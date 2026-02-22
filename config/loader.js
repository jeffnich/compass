/**
 * Configuration Loader
 * 
 * Loads command configurations from JSON file.
 * Hot-reloads on file changes without restarting bot.
 */

const fs = require('fs');
const path = require('path');

const CONFIG_PATH = path.join(__dirname, 'commands.json');

let commandsConfig = {};
let lastModified = 0;

/**
 * Load commands from JSON file
 */
function loadCommands() {
  try {
    const stats = fs.statSync(CONFIG_PATH);
    
    // Only reload if file changed
    if (stats.mtimeMs > lastModified) {
      const data = fs.readFileSync(CONFIG_PATH, 'utf8');
      commandsConfig = JSON.parse(data);
      lastModified = stats.mtimeMs;
      
      console.log('✅ Loaded command config:', Object.keys(commandsConfig).join(', '));
    }
    
    return commandsConfig;
  } catch (error) {
    console.error('❌ Failed to load commands.json:', error.message);
    return commandsConfig; // Return cached version
  }
}

/**
 * Get configuration for a specific command
 */
function getCommandConfig(commandName) {
  const commands = loadCommands(); // Auto-reload if changed
  return commands[commandName] || null;
}

/**
 * Get all enabled commands
 */
function getEnabledCommands() {
  const commands = loadCommands();
  return Object.entries(commands)
    .filter(([_, config]) => config.enabled !== false)
    .reduce((acc, [name, config]) => {
      acc[name] = config;
      return acc;
    }, {});
}

/**
 * Get model for a command
 */
function getModelForCommand(commandName) {
  const config = getCommandConfig(commandName);
  return config?.model || 'openai';
}

/**
 * Get prompt for a command
 */
function getPromptForCommand(commandName, input = '') {
  const config = getCommandConfig(commandName);
  if (!config) return null;
  
  // Replace {input} placeholder with actual input
  return config.prompt.replace('{input}', input);
}

/**
 * Validate commands.json format
 */
function validateConfig() {
  const commands = loadCommands();
  const errors = [];
  
  for (const [name, config] of Object.entries(commands)) {
    if (!config.description) {
      errors.push(`${name}: missing 'description'`);
    }
    if (!config.prompt) {
      errors.push(`${name}: missing 'prompt'`);
    }
    if (!config.model) {
      errors.push(`${name}: missing 'model'`);
    }
    if (!['openai', 'anthropic', 'claude'].includes(config.model)) {
      errors.push(`${name}: invalid model '${config.model}'`);
    }
  }
  
  return errors;
}

// Initial load
loadCommands();

module.exports = {
  loadCommands,
  getCommandConfig,
  getEnabledCommands,
  getModelForCommand,
  getPromptForCommand,
  validateConfig,
};
