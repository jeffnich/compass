const { getContext, storeMessage } = require('../services/context');
const { generateCommandResponse } = require('../services/openai');
const { getModelForCommand } = require('../config/loader');

/**
 * Handle slash command execution
 * 
 * @param {string} commandName - Command name (e.g., 'prd', 'summarize')
 * @param {string} text - Command arguments
 * @param {object} context - Slack command context (channel, user, etc.)
 * @param {string} model - AI model to use (openai, anthropic, etc.)
 */
async function handleSlashCommand(commandName, text, context = {}, model = null) {
  const { channel, user, thread_ts } = context;
  
  // Get configured model for this command (or use override)
  const selectedModel = model || getModelForCommand(commandName);
  
  console.log(`Slash command: /${commandName} ${text} [model: ${selectedModel}]`);
  
  // Fetch relevant context for this command
  const contextData = await getContext({
    channel,
    threadTs: thread_ts,
    query: `${commandName} ${text}`,
    limit: 30,
  });
  
  // Store the command invocation as a message (so future commands see it)
  const commandTs = `cmd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  await storeMessage({
    ts: commandTs,
    channel,
    thread_ts,
    user,
    text: `/${commandName} ${text}`,
    timestamp: new Date(),
  });
  
  // Generate response based on command
  const response = await generateCommandResponse({
    command: commandName,
    input: text,
    context: contextData,
    user,
    channel,
    model: selectedModel,
  });
  
  // Store the response as well (so Ion learns from its own answers)
  const responseTs = `resp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  await storeMessage({
    ts: responseTs,
    channel,
    thread_ts,
    user: 'ion_bot', // Mark as bot response
    text: response,
    timestamp: new Date(),
  });
  
  return response;
}

module.exports = {
  handleSlashCommand,
};
