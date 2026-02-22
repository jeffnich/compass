require('dotenv').config();
const { App } = require('@slack/bolt');
const { handleAppMention } = require('./handlers/messages');
const { handleSlashCommand } = require('./handlers/commands');
const { registerCommands } = require('./commands/registry');
const { storeMessage, storeChannel } = require('./services/context');

// Validate environment
const required = ['SLACK_BOT_TOKEN', 'SLACK_SIGNING_SECRET', 'SLACK_APP_TOKEN', 'OPENAI_API_KEY'];
for (const key of required) {
  if (!process.env[key]) {
    console.error(`❌ Missing required env var: ${key}`);
    process.exit(1);
  }
}

// Initialize Slack app
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
  logLevel: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
});

// ============================================================================
// Event Handlers
// ============================================================================

// @ion mentions
app.event('app_mention', async ({ event, client, say }) => {
  try {
    console.log('📥 App mention:', event.text);
    
    // Show typing indicator
    await client.chat.postMessage({
      channel: event.channel,
      thread_ts: event.thread_ts || event.ts,
      text: '🤔 Thinking...',
    });
    
    const response = await handleAppMention(event, client);
    
    await say({
      text: response,
      thread_ts: event.thread_ts || event.ts,
    });
  } catch (error) {
    console.error('Error handling app mention:', error);
    await say({
      text: '❌ Sorry, I encountered an error. Please try again.',
      thread_ts: event.thread_ts || event.ts,
    });
  }
});

// Direct messages to the bot
app.event('message', async ({ event, client, say }) => {
  // Store all messages for context (except bot messages)
  if (!event.subtype && event.text && !event.bot_id) {
    await storeMessage({
      ts: event.ts,
      channel: event.channel,
      thread_ts: event.thread_ts,
      user: event.user,
      text: event.text,
      timestamp: new Date(parseFloat(event.ts) * 1000),
    });
  }
  
  // Ignore bot messages and threaded replies for responses
  if (event.subtype || event.thread_ts) return;
  
  // Only handle DMs (channel type is 'im')
  if (event.channel_type !== 'im') return;
  
  try {
    console.log('📥 DM:', event.text);
    
    const response = await handleAppMention(event, client);
    await say(response);
  } catch (error) {
    console.error('Error handling DM:', error);
    await say('❌ Sorry, I encountered an error. Please try again.');
  }
});

// ============================================================================
// Slash Commands
// ============================================================================

// Register all slash commands
registerCommands(app);

// Fallback for unknown commands
app.command(/\/.*/, async ({ command, ack, respond }) => {
  await ack();
  await respond({
    text: `❓ Unknown command: ${command.command}\n\nTry \`/ion-help\` to see available commands.`,
    response_type: 'ephemeral',
  });
});

// ============================================================================
// App Home
// ============================================================================

app.event('app_home_opened', async ({ event, client }) => {
  try {
    const fs = require('fs');
    const path = require('path');
    
    // Load commands dynamically
    const commandsFile = path.join(__dirname, 'config/commands.json');
    let commands = {};
    try {
      const data = fs.readFileSync(commandsFile, 'utf8');
      commands = JSON.parse(data);
    } catch (err) {
      console.error('Failed to load commands for App Home:', err);
    }
    
    // Build command list
    const commandBlocks = Object.entries(commands)
      .filter(([_, config]) => config.enabled !== false)
      .map(([name, config]) => ({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*\`/ion ${name}\`*\n${config.description || 'No description'}\n_Model: ${config.model || 'openai'} • Type: ${config.type || 'llm'}_`,
        },
      }));
    
    await client.views.publish({
      user_id: event.user,
      view: {
        type: 'home',
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: '*Welcome to Ion! ⚡*\n\nI\'m your AI teammate that learns from your conversations and helps your team work smarter.',
            },
          },
          {
            type: 'divider',
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: '*🚀 Quick Start*\n\n• Mention me with `@ion` in any channel\n• Use `/ion [command]` for any task below\n• I learn from conversations to give better answers over time',
            },
          },
          {
            type: 'divider',
          },
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: '📚 Available Commands',
              emoji: true,
            },
          },
          ...commandBlocks,
          {
            type: 'divider',
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: '*💡 Pro Tips*\n\n• Type `/ion` to see this list in chat\n• Use `/ion help` for quick reference\n• Top commands also work as `/prd`, `/summarize`, etc.',
            },
          },
          {
            type: 'context',
            elements: [
              {
                type: 'mrkdwn',
                text: `📊 *${Object.keys(commands).length} commands available* • The more you use me, the smarter I get!`,
              },
            ],
          },
        ],
      },
    });
  } catch (error) {
    console.error('Error publishing home view:', error);
  }
});

// ============================================================================
// Channel Events
// ============================================================================

// Track when Ion joins a channel
app.event('member_joined_channel', async ({ event, client, say }) => {
  if (event.user === process.env.SLACK_BOT_USER_ID) {
    try {
      const channelInfo = await client.conversations.info({ channel: event.channel });
      await storeChannel({
        channelId: event.channel,
        channelName: channelInfo.channel.name,
        isPrivate: channelInfo.channel.is_private,
      });
      console.log(`✅ Joined channel: #${channelInfo.channel.name}`);
      
      // Send welcome message
      const fs = require('fs');
      const path = require('path');
      
      // Load commands to show in welcome
      let commandCount = 0;
      try {
        const commandsFile = path.join(__dirname, 'config/commands.json');
        const commandsData = fs.readFileSync(commandsFile, 'utf8');
        const commands = JSON.parse(commandsData);
        commandCount = Object.keys(commands).length;
      } catch (err) {
        console.error('Failed to load commands for welcome:', err);
      }
      
      await client.chat.postMessage({
        channel: event.channel,
        text: `👋 Hi! I'm Ion, your AI teammate.\n\n*What I do:*\n• Generate PRDs, specs, and docs\n• Summarize discussions\n• Search past decisions\n• Answer questions with team context\n\n*Most used commands:*\n• \`/prd [feature]\` - Generate Product Requirements\n• \`/summarize\` - Summarize discussions\n• \`/ion [command]\` - Run any of ${commandCount} available commands\n\n*Get started:*\n• Type \`/ion\` to see all commands\n• Mention me with \`@ion [question]\`\n• Click Ion in the sidebar for the full command directory\n\n💡 *I learn from your conversations* - the more you use me, the better my answers get!`,
      });
    } catch (err) {
      console.error('Error storing channel or sending welcome:', err);
    }
  }
});

// ============================================================================
// Error Handling
// ============================================================================

app.error(async (error) => {
  console.error('⚠️ Global error:', error);
});

// ============================================================================
// Start Server
// ============================================================================

(async () => {
  const port = process.env.PORT || 3001;
  
  await app.start(port);
  
  console.log('┌─────────────────────────────────────┐');
  console.log('│   ⚡ Ion Slack Bot Started          │');
  console.log('└─────────────────────────────────────┘');
  console.log(`Port:        ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('');
  console.log('✅ Bot is listening for events!');
  console.log('');
  console.log('Test it:');
  console.log('  1. Invite @ion to a channel');
  console.log('  2. Type: @ion hello');
  console.log('  3. Try: /ion-help');
  console.log('');
})();

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down...');
  await app.stop();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('\nSIGINT received, shutting down...');
  await app.stop();
  process.exit(0);
});
