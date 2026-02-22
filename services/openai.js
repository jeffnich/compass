const OpenAI = require('openai');
const Anthropic = require('@anthropic-ai/sdk');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || process.env.OPENAI_API_KEY, // fallback to OpenAI
});

const SYSTEM_PROMPT = `You are Ion, an AI assistant integrated into a Slack workspace. You help teams by:

1. Answering questions with context from their conversations
2. Generating product documents (PRDs, specs, designs)
3. Summarizing discussions and decisions
4. Providing insights based on team communications

Be:
- Concise and direct (Slack messages should be scannable)
- Professional but friendly
- Context-aware (reference past conversations when relevant)
- Helpful and proactive

Format responses for Slack:
- Use *bold* for emphasis
- Use \`code\` for technical terms
- Use > for quotes
- Use bullet points for lists
- Keep paragraphs short`;

/**
 * Generate response to user message
 */
async function generateResponse({ userMessage, userName, context, channel }) {
  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
  ];
  
  // Add recent conversation context
  if (context.recentMessages && context.recentMessages.length > 0) {
    const contextText = context.recentMessages
      .map(msg => `${msg.user}: ${msg.text}`)
      .join('\n');
    
    messages.push({
      role: 'system',
      content: `Recent conversation context:\n${contextText}`,
    });
  }
  
  // Add semantic search results (most relevant past discussions)
  if (context.semanticResults && context.semanticResults.length > 0) {
    const semanticText = context.semanticResults
      .map(msg => `[${(msg.similarity * 100).toFixed(0)}% relevant] ${msg.user}: ${msg.text}`)
      .join('\n');
    
    messages.push({
      role: 'system',
      content: `Related past discussions (semantic search):\n${semanticText}`,
    });
  }
  
  // Add user message
  messages.push({
    role: 'user',
    content: `${userName} asks: ${userMessage}`,
  });
  
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages,
      temperature: 0.7,
      max_tokens: 500,
    });
    
    return completion.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error('Failed to generate response from OpenAI');
  }
}

/**
 * Generate response for slash command
 */
async function generateCommandResponse({ command, input, context, user, channel, model = null }) {
  const { getCommandConfig, getPromptForCommand, getModelForCommand } = require('../config/loader');
  
  // Get config from JSON file
  const config = getCommandConfig(command);
  
  // Get prompt (with {input} replaced)
  const prompt = config 
    ? getPromptForCommand(command, input)
    : `Help with: /${command} ${input}`;
  
  // Get model (use override or config or default)
  const selectedModel = model || (config?.model) || 'openai';
  
  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    {
      role: 'system',
      content: `You are responding to the slash command: /${command}\n\nProvide a detailed, structured response.`,
    },
  ];
  
  // Add recent messages context
  if (context.recentMessages && context.recentMessages.length > 0) {
    const contextText = context.recentMessages
      .map(msg => `${msg.user}: ${msg.text}`)
      .join('\n');
    
    messages.push({
      role: 'system',
      content: `Recent conversation context:\n${contextText}`,
    });
  }
  
  // Add semantic search results (most relevant past discussions)
  if (context.semanticResults && context.semanticResults.length > 0) {
    const semanticText = context.semanticResults
      .map(msg => `[${(msg.similarity * 100).toFixed(0)}% relevant] ${msg.user}: ${msg.text}`)
      .join('\n');
    
    messages.push({
      role: 'system',
      content: `Related past discussions (semantic search):\n${semanticText}`,
    });
  }
  
  messages.push({
    role: 'user',
    content: prompt,
  });
  
  try {
    // Route to appropriate model
    if (selectedModel === 'anthropic' || selectedModel === 'claude') {
      return await generateWithAnthropic(messages);
    } else {
      return await generateWithOpenAI(messages);
    }
  } catch (error) {
    console.error(`${selectedModel} API error:`, error);
    throw new Error(`Failed to generate command response with ${selectedModel}`);
  }
}

/**
 * Generate with OpenAI
 */
async function generateWithOpenAI(messages, options = {}) {
  const completion = await openai.chat.completions.create({
    model: options.model || 'gpt-4',
    messages,
    temperature: options.temperature || 0.7,
    max_tokens: options.max_tokens || 1500,
  });
  
  return completion.choices[0].message.content;
}

/**
 * Generate with Anthropic Claude
 */
async function generateWithAnthropic(messages, options = {}) {
  // Convert OpenAI format to Anthropic format
  const systemMessage = messages.filter(m => m.role === 'system').map(m => m.content).join('\n\n');
  const userMessages = messages.filter(m => m.role !== 'system');
  
  const response = await anthropic.messages.create({
    model: options.model || 'claude-3-haiku-20240307',
    max_tokens: options.max_tokens || 4096,
    system: systemMessage,
    messages: userMessages.map(m => ({
      role: m.role,
      content: m.content,
    })),
  });
  
  return response.content[0].text;
}

/**
 * Generate embedding for a message (for vector search)
 */
async function generateEmbedding(text) {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: text,
    });
    
    return response.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
}

module.exports = {
  generateResponse,
  generateCommandResponse,
  generateEmbedding,
  createEmbedding: generateEmbedding, // Alias for context.js
};
