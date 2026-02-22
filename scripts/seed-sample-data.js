#!/usr/bin/env node
/**
 * Seed realistic sample product team conversations
 */

require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost/ion_slack'
});

// Sample realistic product team conversation
const sampleThread = [
  {
    user: 'sarah_pm',
    text: 'We need to decide on the payment provider for the new checkout flow. Options are Stripe, PayPal, or Braintree.',
    channel: 'C_PRODUCT',
    thread_ts: '1708876800.000001'
  },
  {
    user: 'mike_eng',
    text: 'From a technical perspective, Stripe has the best API and documentation. We\'ve used it before and had good experiences.',
    channel: 'C_PRODUCT',
    thread_ts: '1708876800.000001'
  },
  {
    user: 'alex_design',
    text: 'Stripe also has the cleanest UI components. Their checkout experience feels more modern than PayPal.',
    channel: 'C_PRODUCT',
    thread_ts: '1708876800.000001'
  },
  {
    user: 'sarah_pm',
    text: 'Cost-wise, Stripe is 2.9% + 30¢ per transaction. PayPal is similar but has higher international fees. What\'s our expected transaction volume?',
    channel: 'C_PRODUCT',
    thread_ts: '1708876800.000001'
  },
  {
    user: 'jen_finance',
    text: 'We\'re projecting 500-1000 transactions per month initially, scaling to 5000+ within 6 months.',
    channel: 'C_PRODUCT',
    thread_ts: '1708876800.000001'
  },
  {
    user: 'mike_eng',
    text: 'At that volume, Stripe makes sense. Their volume pricing kicks in at 1M+, so we won\'t benefit yet. But the developer experience is worth it.',
    channel: 'C_PRODUCT',
    thread_ts: '1708876800.000001'
  },
  {
    user: 'sarah_pm',
    text: 'Alright, decision made: We\'re going with Stripe. @mike_eng can you start the integration this sprint? Target is to have checkout live by end of Q1.',
    channel: 'C_PRODUCT',
    thread_ts: '1708876800.000001'
  },
  {
    user: 'mike_eng',
    text: 'Yes, I\'ll start Monday. Should have a working prototype by Wednesday for design review.',
    channel: 'C_PRODUCT',
    thread_ts: '1708876800.000001'
  },
  
  // Another thread about a feature question
  {
    user: 'carlos_eng',
    text: 'Question: Should we support bulk user imports via CSV, or require them to use our API?',
    channel: 'C_PRODUCT',
    thread_ts: '1708963200.000002'
  },
  {
    user: 'sarah_pm',
    text: 'Good question. What\'s the use case driving this?',
    channel: 'C_PRODUCT',
    thread_ts: '1708963200.000002'
  },
  {
    user: 'carlos_eng',
    text: 'Enterprise customers migrating from legacy systems. They have user lists in Excel/CSV format, thousands of rows.',
    channel: 'C_PRODUCT',
    thread_ts: '1708963200.000002'
  },
  {
    user: 'sarah_pm',
    text: 'CSV import is table stakes for enterprise. Let\'s add it to the roadmap. Priority?',
    channel: 'C_PRODUCT',
    thread_ts: '1708963200.000002'
  },
  {
    user: 'mike_eng',
    text: 'I can build it in ~2 days. Basic validation, error handling, async processing.',
    channel: 'C_PRODUCT',
    thread_ts: '1708963200.000002'
  },
  {
    user: 'sarah_pm',
    text: 'Let\'s do it. @carlos_eng work with @mike_eng on the spec. I want field mapping, error reporting, and rollback capability.',
    channel: 'C_PRODUCT',
    thread_ts: '1708963200.000002'
  },
  
  // Thread with open question
  {
    user: 'alex_design',
    text: 'Working on the mobile navigation redesign. Question: Do we support landscape mode on tablets?',
    channel: 'C_DESIGN',
    thread_ts: '1709049600.000003'
  },
  {
    user: 'sarah_pm',
    text: 'Great question. @jen_finance do we have analytics on tablet usage? What % are using landscape?',
    channel: 'C_DESIGN',
    thread_ts: '1709049600.000003'
  },
  {
    user: 'jen_finance',
    text: 'Checking now... looks like 15% of tablet users rotate to landscape at some point.',
    channel: 'C_DESIGN',
    thread_ts: '1709049600.000003'
  },
  {
    user: 'alex_design',
    text: 'So we need to support it. But does the nav collapse to a hamburger menu or stay expanded?',
    channel: 'C_DESIGN',
    thread_ts: '1709049600.000003'
  },
  
  // Security discussion with decision
  {
    user: 'mike_eng',
    text: 'Security concern: We\'re storing API keys in plain text in the database. This is a major vulnerability.',
    channel: 'C_ENG',
    thread_ts: '1709136000.000004'
  },
  {
    user: 'carlos_eng',
    text: 'Agreed. We should encrypt them at rest using AWS KMS or similar.',
    channel: 'C_ENG',
    thread_ts: '1709136000.000004'
  },
  {
    user: 'sarah_pm',
    text: 'This is P0. @mike_eng what\'s the timeline to implement encryption?',
    channel: 'C_ENG',
    thread_ts: '1709136000.000004'
  },
  {
    user: 'mike_eng',
    text: '3-4 days to implement KMS integration, migrate existing keys, and update all access patterns.',
    channel: 'C_ENG',
    thread_ts: '1709136000.000004'
  },
  {
    user: 'sarah_pm',
    text: 'Decision: Pause all other work, fix this immediately. Security cannot wait. Ship date: Friday EOD.',
    channel: 'C_ENG',
    thread_ts: '1709136000.000004'
  },
  {
    user: 'mike_eng',
    text: 'On it. I\'ll have a PR ready by Thursday for review.',
    channel: 'C_ENG',
    thread_ts: '1709136000.000004'
  },
];

async function seedData() {
  console.log('🌱 Seeding sample product team data...\n');
  
  try {
    // Clear existing sample data
    await pool.query(`DELETE FROM messages WHERE user_id LIKE '%_pm' OR user_id LIKE '%_eng' OR user_id LIKE '%_design'`);
    
    // Insert sample messages
    for (const msg of sampleThread) {
      const ts = msg.thread_ts;
      const timestamp = new Date(parseFloat(msg.thread_ts) * 1000);
      
      await pool.query(`
        INSERT INTO messages (ts, channel_id, thread_ts, user_id, text, slack_created_at)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (ts) DO NOTHING
      `, [ts, msg.channel, msg.thread_ts, msg.user, msg.text, timestamp]);
    }
    
    console.log(`✅ Inserted ${sampleThread.length} sample messages across 4 threads`);
    console.log('\nSample threads:');
    console.log('  1. Payment provider decision (Stripe)');
    console.log('  2. CSV import feature discussion');
    console.log('  3. Tablet landscape mode question (OPEN)');
    console.log('  4. API key security fix (P0)');
    
    console.log('\n📊 Run analysis to extract decisions and questions:');
    console.log('   cd ~/.openclaw/workspace/ion-slack-bot');
    console.log('   node scripts/analyze-historical.js');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await pool.end();
  }
}

seedData();
