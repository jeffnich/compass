/**
 * Model Configuration for Slash Commands
 * 
 * Specify which AI model to use for each command.
 * 
 * Available models:
 * - 'openai' - GPT-4 (fast, good for most tasks)
 * - 'anthropic' or 'claude' - Claude 3.5 Sonnet (longer context, better reasoning)
 * 
 * You can also specify model variants:
 * - 'openai:gpt-4-turbo'
 * - 'anthropic:claude-3-opus-20240229'
 */

const COMMAND_MODELS = {
  // Product Requirements Document
  // Claude is better for long-form structured documents
  prd: 'anthropic',
  
  // Summarization
  // GPT-4 is fast and good enough for summaries
  summarize: 'openai',
  
  // Decision search
  // GPT-4 is fine for this
  decisions: 'openai',
  
  // Design review
  // Claude's longer context helps with detailed reviews
  'design-review': 'anthropic',
  
  // API spec generation
  // Claude is better for technical specifications
  'api-spec': 'anthropic',
  
  // Default for any other commands
  default: 'openai',
};

/**
 * Get model for a command
 */
function getModelForCommand(command) {
  return COMMAND_MODELS[command] || COMMAND_MODELS.default;
}

/**
 * Parse model string into provider and model name
 * Examples:
 *   'openai' -> { provider: 'openai', model: 'gpt-4' }
 *   'openai:gpt-4-turbo' -> { provider: 'openai', model: 'gpt-4-turbo' }
 *   'anthropic' -> { provider: 'anthropic', model: 'claude-3-5-sonnet-20241022' }
 */
function parseModel(modelString) {
  const [provider, model] = modelString.split(':');
  
  // Default models for each provider
  const defaults = {
    openai: 'gpt-4',
    anthropic: 'claude-3-5-sonnet-20241022',
    claude: 'claude-3-5-sonnet-20241022',
  };
  
  return {
    provider: provider === 'claude' ? 'anthropic' : provider,
    model: model || defaults[provider] || 'gpt-4',
  };
}

module.exports = {
  COMMAND_MODELS,
  getModelForCommand,
  parseModel,
};
