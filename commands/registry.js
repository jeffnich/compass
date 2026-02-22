const { handleSlashCommand } = require('../handlers/commands');
const { query } = require('../db/client');

// Core commands to implement first
const CORE_COMMANDS = [
  'ion-help',
  'prd',
  'summarize',
  'decisions',
  'design-review',
  'api-spec',
];

/**
 * Register all slash commands with the Bolt app
 */
function registerCommands(app) {
  // /ion-help - Show available commands
  app.command('/ion-help', async ({ command, ack, respond }) => {
    await ack();
    
    const fs = require('fs');
    const path = require('path');
    
    // Load commands dynamically
    let commandList = '';
    let commandCount = 0;
    try {
      const commandsFile = path.join(__dirname, '../config/commands.json');
      const commandsData = fs.readFileSync(commandsFile, 'utf8');
      const commands = JSON.parse(commandsData);
      
      commandList = Object.entries(commands)
        .filter(([_, config]) => config.enabled !== false)
        .map(([name, config]) => `• \`/ion ${name}\` - ${config.description || 'No description'}`)
        .join('\n');
      
      commandCount = Object.keys(commands).length;
    } catch (err) {
      console.error('Failed to load commands:', err);
      commandList = '• `/prd [feature]` - Generate PRD\n• `/summarize` - Summarize discussions';
    }
    
    await respond({
      text: `*Ion Commands* ⚡\n\n*Quick Access (Native):*\n• \`/prd [feature]\` - Generate Product Requirements Document\n• \`/summarize\` - Summarize thread or channel\n• \`/decisions [topic]\` - Search past decisions\n\n*All Commands (${commandCount} total):*\n${commandList}\n\n*How to use:*\n• Type \`/ion [command]\` to run any command\n• Mention \`@ion\` for conversational help\n• Click Ion in sidebar → Home tab for full directory\n\n*Examples:*\n• \`/ion prd mobile redesign\`\n• \`/ion fe-doc authentication flow\`\n\n💡 *Tip:* I learn from your conversations - the more you use me, the better my answers!`,
      response_type: 'ephemeral',
    });
  });
  
  // /prd - Generate PRD
  app.command('/prd', async ({ command, ack, respond }) => {
    await ack();
    
    if (!command.text.trim()) {
      return respond({
        text: '❓ Please specify what feature you want a PRD for.\n\nExample: `/prd mobile app redesign`',
        response_type: 'ephemeral',
      });
    }
    
    try {
      // Show loading message
      await respond({
        text: '⚡ Generating PRD...',
        response_type: 'in_channel',
      });
      
      const response = await handleSlashCommand('prd', command.text, {
        channel: command.channel_id,
        user: command.user_id,
      });
      
      await respond({
        text: response,
        response_type: 'in_channel',
      });
    } catch (error) {
      console.error('Error in /prd command:', error);
      await respond({
        text: '❌ Failed to generate PRD. Please try again.',
        response_type: 'ephemeral',
      });
    }
  });
  
  // /summarize - Summarize thread or channel
  app.command('/summarize', async ({ command, ack, respond }) => {
    await ack();
    
    try {
      await respond({
        text: '⚡ Summarizing...',
        response_type: 'in_channel',
      });
      
      const response = await handleSlashCommand('summarize', command.text, {
        channel: command.channel_id,
        user: command.user_id,
      });
      
      await respond({
        text: response,
        response_type: 'in_channel',
      });
    } catch (error) {
      console.error('Error in /summarize command:', error);
      await respond({
        text: '❌ Failed to summarize. Please try again.',
        response_type: 'ephemeral',
      });
    }
  });
  
  // /decisions - Search decisions
  app.command('/decisions', async ({ command, ack, respond }) => {
    await ack();
    
    try {
      await respond({
        text: '🔍 Searching decisions...',
        response_type: 'in_channel',
      });
      
      const response = await handleSlashCommand('decisions', command.text, {
        channel: command.channel_id,
        user: command.user_id,
      });
      
      await respond({
        text: response,
        response_type: 'in_channel',
      });
    } catch (error) {
      console.error('Error in /decisions command:', error);
      await respond({
        text: '❌ Failed to search decisions. Please try again.',
        response_type: 'ephemeral',
      });
    }
  });
  
  // /design-review
  app.command('/design-review', async ({ command, ack, respond }) => {
    await ack();
    
    if (!command.text.trim()) {
      return respond({
        text: '❓ Please provide a design link or description.\n\nExample: `/design-review https://figma.com/...`',
        response_type: 'ephemeral',
      });
    }
    
    try {
      await respond({
        text: '⚡ Reviewing design...',
        response_type: 'in_channel',
      });
      
      const response = await handleSlashCommand('design-review', command.text, {
        channel: command.channel_id,
        user: command.user_id,
      });
      
      await respond({
        text: response,
        response_type: 'in_channel',
      });
    } catch (error) {
      console.error('Error in /design-review command:', error);
      await respond({
        text: '❌ Failed to review design. Please try again.',
        response_type: 'ephemeral',
      });
    }
  });
  
  // /api-spec
  app.command('/api-spec', async ({ command, ack, respond }) => {
    await ack();
    
    if (!command.text.trim()) {
      return respond({
        text: '❓ Please specify the API endpoint.\n\nExample: `/api-spec user authentication`',
        response_type: 'ephemeral',
      });
    }
    
    try {
      await respond({
        text: '⚡ Generating API spec...',
        response_type: 'in_channel',
      });
      
      const response = await handleSlashCommand('api-spec', command.text, {
        channel: command.channel_id,
        user: command.user_id,
      });
      
      await respond({
        text: response,
        response_type: 'in_channel',
      });
    } catch (error) {
      console.error('Error in /api-spec command:', error);
      await respond({
        text: '❌ Failed to generate API spec. Please try again.',
        response_type: 'ephemeral',
      });
    }
  });
  
  // /ion - Meta-command (routes to any command dynamically)
  app.command('/ion', async ({ command, ack, respond }) => {
    await ack();
    
    const fs = require('fs');
    const path = require('path');
    
    try {
      // Parse command and args
      const parts = command.text.trim().split(/\s+/);
      const subCommand = parts[0];
      const args = parts.slice(1).join(' ');
      
      // Load commands
      const commandsFile = path.join(__dirname, '../config/commands.json');
      const commandsData = fs.readFileSync(commandsFile, 'utf8');
      const commands = JSON.parse(commandsData);
      
      console.log(`[/ion] Loaded ${Object.keys(commands).length} commands:`, Object.keys(commands));
      
      // Show help if no command or help/list alias
      if (!subCommand || subCommand === 'help' || subCommand === 'list' || subCommand === 'commands') {
        const enabledCommands = Object.entries(commands)
          .filter(([_, config]) => config.enabled !== false)
          .map(([name, config]) => `• \`/ion ${name}\` - ${config.description || 'No description'}`)
          .join('\n');
        
        console.log(`[/ion help] Showing ${enabledCommands.split('\n').length} commands`);
        
        return respond({
          text: `*Ion Meta-Command* ⚡\n\nUse: \`/ion [command] [args]\`\n\n*Available commands (${Object.keys(commands).length} total):*\n${enabledCommands}\n\n*Examples:*\n• \`/ion prd mobile redesign\`\n• \`/ion fe-doc authentication flow\`\n\n*Quick access:* Top commands also work as \`/prd\`, \`/summarize\`, etc.\n\n*See full list:* Click Ion in the sidebar → Home tab`,
          response_type: 'ephemeral',
        });
      }
      
      const cmdConfig = commands[subCommand];
      
      if (!cmdConfig) {
        return respond({
          text: `❓ Unknown command: \`${subCommand}\`\n\nUse \`/ion\` to see available commands.`,
          response_type: 'ephemeral',
        });
      }
      
      if (cmdConfig.enabled === false) {
        return respond({
          text: `⚠️ Command \`${subCommand}\` is currently disabled.`,
          response_type: 'ephemeral',
        });
      }
      
      // Handle deterministic commands
      if (cmdConfig.type === 'deterministic') {
        return respond({
          text: cmdConfig.response || 'No response configured.',
          response_type: 'in_channel',
        });
      }
      
      // Handle LLM commands
      await respond({
        text: `⚡ Running \`${subCommand}\`...`,
        response_type: 'in_channel',
      });
      
      const response = await handleSlashCommand(subCommand, args, {
        channel: command.channel_id,
        user: command.user_id,
      });
      
      await respond({
        text: response,
        response_type: 'in_channel',
      });
    } catch (error) {
      console.error('Error in /ion command:', error);
      await respond({
        text: `❌ Failed to execute command. Error: ${error.message}`,
        response_type: 'ephemeral',
      });
    }
  });
  
  // /stats - Show channel statistics (DETERMINISTIC - no AI)
  app.command('/stats', async ({ command, ack, respond }) => {
    await ack();
    
    try {
      const stats = await query(`
        SELECT 
          COUNT(*) as total_messages,
          COUNT(DISTINCT user_id) as unique_users,
          MIN(slack_created_at) as first_message,
          MAX(slack_created_at) as last_message
        FROM messages
        WHERE channel_id = $1
      `, [command.channel_id]);
      
      if (stats.rows.length === 0 || !stats.rows[0].total_messages) {
        return respond({
          text: '📊 No messages indexed for this channel yet.\n\nI need to see some conversations first!',
          response_type: 'ephemeral',
        });
      }
      
      const s = stats.rows[0];
      const daysSince = Math.max(1, Math.floor(
        (new Date() - new Date(s.first_message)) / (1000 * 60 * 60 * 24)
      ));
      
      await respond({
        text: `📊 *Channel Statistics*\n\n` +
              `💬 Total messages: ${s.total_messages}\n` +
              `👥 Unique users: ${s.unique_users}\n` +
              `📅 First message: ${new Date(s.first_message).toLocaleDateString()}\n` +
              `⏰ Last message: ${new Date(s.last_message).toLocaleDateString()}\n` +
              `⏱️ Days active: ${daysSince}\n` +
              `📈 Avg messages/day: ${Math.floor(parseInt(s.total_messages) / daysSince)}`,
        response_type: 'ephemeral',
      });
    } catch (error) {
      console.error('Error in /stats command:', error);
      await respond({
        text: '❌ Failed to get statistics. Please try again.',
        response_type: 'ephemeral',
      });
    }
  });
  
  console.log(`✅ Registered ${CORE_COMMANDS.length + 2} slash commands (including /ion and /stats)`);
}

module.exports = {
  registerCommands,
  CORE_COMMANDS,
};
