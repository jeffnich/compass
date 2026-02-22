# Ion Slack Bot - Quick Start

Get Ion running in your Slack workspace in 15 minutes.

## Prerequisites

- [x] Slack workspace (admin access to install apps)
- [x] OpenAI API key (get from platform.openai.com)
- [x] PostgreSQL installed (optional for MVP)

## Step 1: Create Slack App (5 min)

### Option A: Use Manifest (Recommended)

1. Go to https://api.slack.com/apps
2. Click **"Create New App"**
3. Choose **"From an app manifest"**
4. Select your workspace
5. Copy-paste the manifest from `SLACK_SETUP.md` (lines 11-60)
6. Click **"Create"**

### Option B: Manual Setup

See `SLACK_SETUP.md` for detailed instructions.

## Step 2: Get Tokens (5 min)

### Bot Token
1. Go to **"OAuth & Permissions"**
2. Click **"Install to Workspace"**
3. Copy **Bot User OAuth Token** (starts with `xoxb-`)

### Signing Secret
1. Go to **"Basic Information"**
2. Copy **Signing Secret**

### App Token
1. Go to **"Socket Mode"**
2. Enable Socket Mode
3. Generate token with `connections:write` scope
4. Copy token (starts with `xapp-`)

## Step 3: Configure Bot (2 min)

Edit `.env` file:

```bash
# Paste your tokens here
SLACK_BOT_TOKEN=xoxb-paste-here
SLACK_SIGNING_SECRET=paste-here
SLACK_APP_TOKEN=xapp-paste-here

# Your OpenAI key
OPENAI_API_KEY=sk-paste-here

# Database (optional for MVP)
DATABASE_URL=postgresql://localhost/ion_slack

# Server config
PORT=3001
NODE_ENV=development
```

## Step 4: Start Bot (1 min)

```bash
cd ~/.openclaw/workspace/ion-slack-bot
npm start
```

You should see:
```
┌─────────────────────────────────────┐
│   ⚡ Ion Slack Bot Started          │
└─────────────────────────────────────┘
Port:        3001
Environment: development

✅ Bot is listening for events!
```

## Step 5: Test in Slack (2 min)

### Test @mention
1. In Slack, find a channel
2. Type: `@ion hello`
3. Bot should respond!

### Test slash command
1. Type: `/ion-help`
2. Should show available commands

### Test PRD generation
1. Type: `/prd mobile app redesign`
2. Should generate a PRD with OpenAI

## Troubleshooting

### "Bot doesn't respond"
- Check that bot is invited to the channel: `/invite @ion`
- Verify tokens in `.env` are correct
- Check console for errors

### "Command not found"
- Reinstall app to workspace
- Verify commands are in app manifest
- Wait 1-2 minutes for Slack to sync

### "OpenAI error"
- Check API key is valid
- Verify you have credits/billing set up
- Check OpenAI dashboard for errors

### "Database error"
- Database is optional for MVP
- Bot will work without it (just no message memory)
- To fix: `createdb ion_slack`

## What Works Now

With this basic setup:
- ✅ @ion responds to mentions
- ✅ Direct messages work
- ✅ 6 slash commands work
- ✅ OpenAI generates responses
- ⚠️ No message memory (needs database)
- ⚠️ No vector search (needs database + embeddings)

## Next Steps

### Add Message Memory (1 hour)
1. Create database: `createdb ion_slack`
2. Run migrations (TODO: create these)
3. Messages will be stored for context

### Add Vector Search (2 hours)
1. Install pgvector extension
2. Generate embeddings on message store
3. Semantic search for relevant context

### Add More Commands (as needed)
1. Copy command template from `registry.js`
2. Add command to Slack manifest
3. Reinstall app
4. Test

### Deploy to Production
See `DEPLOYMENT.md` (TODO: create this)

## Support

Stuck? Check:
1. Console output for error messages
2. `README.md` for detailed docs
3. `SLACK_SETUP.md` for Slack-specific help
4. GitHub issues (if open source)

## Development Mode

For local development with auto-reload:

```bash
npm run dev
```

This uses `nodemon` to restart on file changes.

## Environment Variables

Required:
- `SLACK_BOT_TOKEN` - Bot OAuth token
- `SLACK_SIGNING_SECRET` - App signing secret
- `SLACK_APP_TOKEN` - App-level token (Socket Mode)
- `OPENAI_API_KEY` - OpenAI API key

Optional:
- `DATABASE_URL` - PostgreSQL connection string
- `PORT` - Server port (default 3001)
- `NODE_ENV` - Environment (development/production)

## Success Checklist

After following this guide:
- [ ] Slack app created
- [ ] Bot token, signing secret, app token configured
- [ ] OpenAI API key added
- [ ] `npm start` runs without errors
- [ ] @ion responds in Slack
- [ ] /ion-help shows commands
- [ ] /prd generates content

**If all checked:** You're ready to use Ion! 🎉

**Next:** Invite teammates and start using slash commands.

---

## Bonus: Cursor Integration (Optional)

Connect Ion to Cursor for Slack context while coding:

```bash
./mcp/setup-cursor.sh
# Then restart Cursor
```

Test in Cursor (⌘+L):
```
Use the ion tool to list all channels
```

**Full guide:** `mcp/CURSOR_SETUP.md`
