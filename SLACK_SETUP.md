# Slack App Setup Guide

Step-by-step instructions to create and configure your Ion Slack app.

## Step 1: Create App

1. Go to https://api.slack.com/apps
2. Click **"Create New App"**
3. Choose **"From an app manifest"**
4. Select your workspace
5. Paste this manifest:

```yaml
display_information:
  name: Ion
  description: AI teammate that learns from your conversations
  background_color: "#2c5ff6"
features:
  app_home:
    home_tab_enabled: true
    messages_tab_enabled: true
    messages_tab_read_only_enabled: false
  bot_user:
    display_name: ion
    always_online: true
  slash_commands:
    - command: /ion-help
      description: Show Ion help and available commands
      usage_hint: ""
    - command: /prd
      description: Generate Product Requirements Document
      usage_hint: "[feature description]"
    - command: /summarize
      description: Summarize thread or channel
      usage_hint: ""
    - command: /decisions
      description: Search past product/technical decisions
      usage_hint: "[topic]"
    - command: /design-review
      description: Review design with context
      usage_hint: "[design link or description]"
    - command: /api-spec
      description: Generate API specification
      usage_hint: "[endpoint description]"
oauth_config:
  scopes:
    bot:
      - app_mentions:read
      - channels:history
      - channels:read
      - chat:write
      - commands
      - groups:history
      - groups:read
      - im:history
      - im:read
      - im:write
      - mpim:history
      - mpim:read
      - users:read
settings:
  event_subscriptions:
    bot_events:
      - app_home_opened
      - app_mention
      - message.im
  interactivity:
    is_enabled: true
  org_deploy_enabled: false
  socket_mode_enabled: true
  token_rotation_enabled: false
```

6. Click **"Create"**

## Step 2: Get Bot Token

1. In your app settings, go to **"OAuth & Permissions"**
2. Click **"Install to Workspace"**
3. Authorize the app
4. Copy the **"Bot User OAuth Token"** (starts with `xoxb-`)
5. Save this as `SLACK_BOT_TOKEN` in your `.env` file

## Step 3: Get Signing Secret

1. Go to **"Basic Information"**
2. Scroll to **"App Credentials"**
3. Copy the **"Signing Secret"**
4. Save this as `SLACK_SIGNING_SECRET` in your `.env` file

## Step 4: Enable Socket Mode

1. Go to **"Socket Mode"**
2. Toggle **"Enable Socket Mode"** to ON
3. Click **"Generate an app-level token to enable Socket Mode"**
4. Name it `websocket` and add scope: `connections:write`
5. Click **"Generate"**
6. Copy the token (starts with `xapp-`)
7. Save this as `SLACK_APP_TOKEN` in your `.env` file

## Step 5: Configure Bot

1. Go to **"App Home"**
2. Under **"Show Tabs"**:
   - ✅ Enable **Home Tab**
   - ✅ Enable **Messages Tab**
   - ✅ Check **"Allow users to send Slash commands and messages from the messages tab"**

## Step 6: Test Installation

Your `.env` should now have:
```bash
SLACK_BOT_TOKEN=xoxb-your-token-here
SLACK_SIGNING_SECRET=your-secret-here
SLACK_APP_TOKEN=xapp-your-token-here
OPENAI_API_KEY=sk-your-openai-key
DATABASE_URL=postgresql://localhost/ion_slack
```

Start the bot:
```bash
npm start
```

In Slack:
1. Find @ion in your workspace
2. Send a DM: `hello`
3. Or mention in a channel: `@ion hello`
4. Try a command: `/ion-help`

## Troubleshooting

### Bot doesn't respond
- Check that Socket Mode is enabled
- Verify SLACK_APP_TOKEN is set correctly
- Check bot is invited to the channel (for @mentions)

### Commands not showing
- Verify commands are in the app manifest
- Reinstall the app if you changed commands

### "Missing scope" error
- Check OAuth scopes in manifest match what's needed
- Reinstall app to update scopes

### Database errors
- Ensure PostgreSQL is running
- Check DATABASE_URL is correct
- Run migrations if needed

## Next Steps

1. ✅ Bot responds to messages
2. ✅ Slash commands work
3. 📝 Add database for message storage
4. 🧠 Add vector search
5. 🔗 Add MCP server
6. 🚀 Deploy to production

## Production Checklist

Before going live:
- [ ] Environment variables secured
- [ ] Database backups configured
- [ ] Error logging set up
- [ ] Rate limiting implemented
- [ ] Privacy policy published
- [ ] Terms of service published
- [ ] Support email configured

## Support

Need help? Email jeff@yourcompany.com
