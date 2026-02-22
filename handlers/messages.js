const { getContext, storeMessage, storeUser } = require('../services/context');
const { generateResponse } = require('../services/openai');

/**
 * Handle @ion mentions and DMs
 */
async function handleAppMention(event, client) {
  const { text, channel, user, thread_ts, ts } = event;
  
  // Remove @ion mention from text
  const userMessage = text.replace(/<@[A-Z0-9]+>/g, '').trim();
  
  if (!userMessage) {
    return '👋 Hi! How can I help? Ask me anything or try `/ion-help` for commands.';
  }
  
  console.log(`Processing message: "${userMessage}" from user ${user} in channel ${channel}`);
  
  // Fetch context (recent messages + vector search)
  const context = await getContext({
    channel,
    threadTs: thread_ts,
    query: userMessage,
    limit: 20,
  });
  
  // Get user info and store it
  let userName = 'there';
  try {
    const userInfo = await client.users.info({ user });
    userName = userInfo.user.real_name || userInfo.user.name || userName;
    
    // Store user in database
    await storeUser({
      userId: user,
      realName: userInfo.user.real_name,
      displayName: userInfo.user.profile?.display_name,
      email: userInfo.user.profile?.email,
      isBot: userInfo.user.is_bot,
    });
  } catch (err) {
    console.warn('Could not fetch user info:', err.message);
  }
  
  // Store this message in the database
  await storeMessage({
    ts,
    channel,
    thread_ts,
    user,
    text: userMessage,
    timestamp: new Date(parseFloat(ts) * 1000),
  });
  
  // Generate AI response with context
  const response = await generateResponse({
    userMessage,
    userName,
    context,
    channel,
  });
  
  // Store Ion's response so future interactions see it
  const responseTs = `resp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  await storeMessage({
    ts: responseTs,
    channel,
    thread_ts,
    user: 'ion_bot',
    text: response,
    timestamp: new Date(),
  });
  
  return response;
}

module.exports = {
  handleAppMention,
};
