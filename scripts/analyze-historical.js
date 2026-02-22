#!/usr/bin/env node
/**
 * Analyze Historical Messages
 * Retroactively extract decisions and questions from existing Slack messages
 */

require('dotenv').config();
const { Pool } = require('pg');
const OpenAI = require('openai');
const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');

// Initialize AI clients
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Load config
const configPath = path.join(__dirname, '../config/commands.json');
const commands = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost/ion_slack'
});

async function analyzeHistoricalMessages() {
  console.log('🔍 Starting historical analysis...\n');
  
  try {
    // Get all threads with multiple messages
    const threadsQuery = `
      SELECT channel_id, thread_ts, COUNT(*) as msg_count
      FROM messages
      WHERE thread_ts IS NOT NULL
      GROUP BY channel_id, thread_ts
      HAVING COUNT(*) >= 2
      ORDER BY MAX(slack_created_at) DESC
      LIMIT 50
    `;
    
    const { rows: threads } = await pool.query(threadsQuery);
    console.log(`Found ${threads.length} threads to analyze\n`);
    
    let decisionsFound = 0;
    let questionsFound = 0;
    
    for (const thread of threads) {
      console.log(`\nAnalyzing thread ${thread.channel_id}/${thread.thread_ts} (${thread.msg_count} messages)`);
      
      // Get thread messages
      const messagesQuery = `
        SELECT user_id, text, slack_created_at
        FROM messages
        WHERE channel_id = $1 AND thread_ts = $2
        ORDER BY slack_created_at ASC
      `;
      
      const { rows: messages } = await pool.query(messagesQuery, [
        thread.channel_id,
        thread.thread_ts
      ]);
      
      // Build conversation context
      const conversation = messages
        .map(m => `[${m.user_id}]: ${m.text}`)
        .join('\n');
      
      // Extract decisions
      try {
        const decisionsPrompt = commands.decisions.prompt.replace('{input}', '');
        const fullPrompt = `${decisionsPrompt}\n\nConversation:\n${conversation}`;
        
        const decisionsResponse = await (commands.decisions.model === 'anthropic' 
          ? generateWithAnthropic(fullPrompt)
          : generateWithOpenAI(fullPrompt)
        );
        
        if (decisionsResponse && decisionsResponse.length > 50) {
          // Store decision
          await pool.query(`
            INSERT INTO workspace_insights 
            (insight_type, channel_id, thread_ts, content, summary, metadata, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, NOW())
            ON CONFLICT DO NOTHING
          `, [
            'decision',
            thread.channel_id,
            thread.thread_ts,
            decisionsResponse,
            decisionsResponse.substring(0, 200),
            JSON.stringify({ message_count: messages.length })
          ]);
          
          decisionsFound++;
          console.log(`  ✅ Decision extracted`);
        }
      } catch (err) {
        console.error(`  ❌ Failed to extract decisions:`, err.message);
      }
      
      // Extract questions
      try {
        const questionsPrompt = commands['open-questions'].prompt.replace('{input}', '');
        const fullPrompt = `${questionsPrompt}\n\nConversation:\n${conversation}`;
        
        const questionsResponse = await (commands['open-questions'].model === 'anthropic'
          ? generateWithAnthropic(fullPrompt)
          : generateWithOpenAI(fullPrompt)
        );
        
        if (questionsResponse && questionsResponse.length > 50) {
          // Store question
          await pool.query(`
            INSERT INTO workspace_insights 
            (insight_type, channel_id, thread_ts, content, summary, metadata, status, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
            ON CONFLICT DO NOTHING
          `, [
            'question',
            thread.channel_id,
            thread.thread_ts,
            questionsResponse,
            questionsResponse.substring(0, 200),
            JSON.stringify({ message_count: messages.length }),
            'open'
          ]);
          
          questionsFound++;
          console.log(`  ✅ Question extracted`);
        }
      } catch (err) {
        console.error(`  ❌ Failed to extract questions:`, err.message);
      }
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log(`\n\n✅ Analysis complete!`);
    console.log(`   Decisions found: ${decisionsFound}`);
    console.log(`   Questions found: ${questionsFound}`);
    
  } catch (error) {
    console.error('❌ Analysis failed:', error);
  } finally {
    await pool.end();
  }
}

// Ensure workspace_insights table exists
async function ensureInsightsTable() {
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS workspace_insights (
      id SERIAL PRIMARY KEY,
      insight_type VARCHAR(50) NOT NULL,
      channel_id VARCHAR(100),
      thread_ts VARCHAR(50),
      summary TEXT NOT NULL,
      metadata JSONB,
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(channel_id, thread_ts, insight_type)
    );
    
    CREATE INDEX IF NOT EXISTS idx_insights_type ON workspace_insights(insight_type);
    CREATE INDEX IF NOT EXISTS idx_insights_channel ON workspace_insights(channel_id);
    CREATE INDEX IF NOT EXISTS idx_insights_created ON workspace_insights(created_at);
  `;
  
  await pool.query(createTableSQL);
}

// AI helper functions
async function generateWithOpenAI(prompt) {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    max_tokens: 1000,
  });
  
  return completion.choices[0].message.content;
}

async function generateWithAnthropic(prompt) {
  const response = await anthropic.messages.create({
    model: 'claude-3-haiku-20240307',
    max_tokens: 4096,
    messages: [{ role: 'user', content: prompt }],
  });
  
  return response.content[0].text;
}

// Run
(async () => {
  await ensureInsightsTable();
  await analyzeHistoricalMessages();
})();
