const { query } = require('../db/client');
const { createEmbedding } = require('./openai');

/**
 * Get relevant context for a query
 * 
 * Combines:
 * - Recent messages from channel/thread
 * - Vector search across historical messages
 * 
 * @param {object} options
 * @param {string} options.channel - Slack channel ID
 * @param {string} options.threadTs - Thread timestamp (optional)
 * @param {string} options.query - Search query
 * @param {number} options.limit - Max messages to return
 */
async function getContext({ channel, threadTs, query: searchQuery, limit = 20 }) {
  try {
    // Get recent messages from this channel/thread
    const recentMessages = await getRecentMessages({ channel, threadTs, limit: 10 });
    
    // If we have a search query, do semantic search
    let semanticResults = [];
    if (searchQuery && searchQuery.trim()) {
      semanticResults = await searchMessages({
        query: searchQuery,
        channel,
        limit: 10,
        threshold: 0.7,
      });
    }
    
    return {
      recentMessages,
      semanticResults,
      threadContext: threadTs ? `Thread context available (${recentMessages.length} messages)` : null,
    };
  } catch (err) {
    console.error('Error fetching context:', err);
    return {
      recentMessages: [],
      semanticResults: [],
      threadContext: null,
    };
  }
}

/**
 * Get recent messages from database
 */
async function getRecentMessages({ channel, threadTs, limit }) {
  try {
    const result = await query(
      'SELECT * FROM get_recent_messages($1, $2, $3)',
      [channel, threadTs || null, limit]
    );
    
    return result.rows.map(row => ({
      ts: row.ts,
      user: row.user_id,
      text: row.text,
      timestamp: row.slack_created_at,
    }));
  } catch (err) {
    console.error('Error getting recent messages:', err);
    return [];
  }
}

/**
 * Search messages by semantic similarity
 */
async function searchMessages({ query: searchQuery, channel = null, limit = 10, threshold = 0.7 }) {
  try {
    // Generate embedding for search query
    const embedding = await createEmbedding(searchQuery);
    
    // Search using vector similarity
    const result = await query(
      'SELECT * FROM search_messages($1, $2, $3, $4)',
      [`[${embedding.join(',')}]`, threshold, limit, channel]
    );
    
    return result.rows.map(row => ({
      ts: row.ts,
      channel: row.channel_id,
      user: row.user_id,
      text: row.text,
      timestamp: row.slack_created_at,
      similarity: parseFloat(row.similarity),
    }));
  } catch (err) {
    console.error('Error searching messages:', err);
    return [];
  }
}

/**
 * Store message for future context retrieval
 */
async function storeMessage({ ts, channel, thread_ts, user, text, timestamp }) {
  try {
    // Skip if no text
    if (!text || text.trim().length === 0) {
      return;
    }
    
    // Generate embedding
    const embedding = await createEmbedding(text);
    
    // Store in database
    await query(
      `INSERT INTO messages (ts, channel_id, thread_ts, user_id, text, embedding, slack_created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (ts) DO UPDATE 
       SET text = EXCLUDED.text, embedding = EXCLUDED.embedding`,
      [
        ts,
        channel,
        thread_ts || null,
        user,
        text,
        `[${embedding.join(',')}]`,
        timestamp || new Date(),
      ]
    );
    
    console.log(`✅ Stored message ${ts} with embedding`);
  } catch (err) {
    console.error('Error storing message:', err);
  }
}

/**
 * Store user info
 */
async function storeUser({ userId, realName, displayName, email, isBot }) {
  try {
    await query(
      `INSERT INTO users (user_id, real_name, display_name, email, is_bot, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       ON CONFLICT (user_id) DO UPDATE
       SET real_name = EXCLUDED.real_name,
           display_name = EXCLUDED.display_name,
           email = EXCLUDED.email,
           is_bot = EXCLUDED.is_bot,
           updated_at = NOW()`,
      [userId, realName, displayName, email, isBot]
    );
  } catch (err) {
    console.error('Error storing user:', err);
  }
}

/**
 * Store channel info
 */
async function storeChannel({ channelId, channelName, isPrivate }) {
  try {
    await query(
      `INSERT INTO channels (channel_id, channel_name, is_private, joined_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (channel_id) DO UPDATE
       SET channel_name = EXCLUDED.channel_name,
           is_private = EXCLUDED.is_private`,
      [channelId, channelName, isPrivate]
    );
  } catch (err) {
    console.error('Error storing channel:', err);
  }
}

/**
 * Log command usage
 */
async function logCommandUsage({ command, userId, channelId, inputText, responseLength, success, error, executionTime }) {
  try {
    await query(
      `INSERT INTO command_usage 
       (command_name, user_id, channel_id, input_text, response_length, success, error_message, execution_time_ms)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [command, userId, channelId, inputText, responseLength, success, error, executionTime]
    );
  } catch (err) {
    console.error('Error logging command usage:', err);
  }
}

module.exports = {
  getContext,
  getRecentMessages,
  searchMessages,
  storeMessage,
  storeUser,
  storeChannel,
  logCommandUsage,
};
