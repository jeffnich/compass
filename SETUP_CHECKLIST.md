# Ion Slack Bot - Setup Checklist

**Time:** 15 minutes  
**Date:** Feb 22, 2026

---

## ✅ Prerequisites (Already Done)

- [x] Node.js installed
- [x] Bot code complete
- [x] MCP SDK installed
- [x] Documentation written

---

## 📝 Step 1: Create Slack App (5 min)

### 1.1 Open Slack Apps Page
Go to: https://api.slack.com/apps

### 1.2 Create New App
1. Click **"Create New App"**
2. Choose **"From an app manifest"**
3. Select your workspace (which workspace do you want to use?)
4. Choose **YAML** format

### 1.3 Paste Manifest
Copy entire contents of `slack-app-manifest.yaml` and paste it

Or copy this:
```yaml
[File is ready at: ~/.openclaw/workspace/ion-slack-bot/slack-app-manifest.yaml]
```

### 1.4 Review & Create
1. Review the permissions
2. Click **"Create"**
3. App is now created!

**Checkpoint:** You should see "Ion" app in your workspace

---

## 🔑 Step 2: Get Credentials (5 min)

### 2.1 Get Bot Token
1. In app settings, go to **"OAuth & Permissions"**
2. Click **"Install to Workspace"**
3. Click **"Allow"**
4. Copy **"Bot User OAuth Token"** (starts with `xoxb-`)
5. Save to .env file

### 2.2 Get Signing Secret
1. Go to **"Basic Information"**
2. Scroll to **"App Credentials"**
3. Copy **"Signing Secret"**
4. Save to .env file

### 2.3 Enable Socket Mode & Get App Token
1. Go to **"Socket Mode"**
2. Toggle **"Enable Socket Mode"** to ON
3. Click **"Generate an app-level token to enable Socket Mode"**
4. Name: `websocket`
5. Add scope: `connections:write`
6. Click **"Generate"**
7. Copy token (starts with `xapp-`)
8. Save to .env file

**Checkpoint:** You should have 3 tokens copied

---

## 🔧 Step 3: Configure Environment (2 min)

### 3.1 Edit .env File
Open: `~/.openclaw/workspace/ion-slack-bot/.env`

Paste your tokens:
```bash
# Slack App Credentials
SLACK_BOT_TOKEN=xoxb-YOUR-TOKEN-HERE
SLACK_SIGNING_SECRET=YOUR-SECRET-HERE
SLACK_APP_TOKEN=xapp-YOUR-TOKEN-HERE

# Database (optional for MVP)
DATABASE_URL=postgresql://localhost/ion_slack

# OpenAI
OPENAI_API_KEY=YOUR-OPENAI-KEY-HERE

# Server
PORT=3001
NODE_ENV=development
```

### 3.2 Add OpenAI Key
Get from: https://platform.openai.com/api-keys

Or use existing key if you have one

**Checkpoint:** .env file has all 4 required variables

---

## 🚀 Step 4: Start Bot (1 min)

### 4.1 Start Server
```bash
cd ~/.openclaw/workspace/ion-slack-bot
npm start
```

### 4.2 Verify Startup
You should see:
```
┌─────────────────────────────────────┐
│   ⚡ Ion Slack Bot Started          │
└─────────────────────────────────────┘
Port:        3001
Environment: development

✅ Bot is listening for events!
```

**Checkpoint:** No errors, server running

---

## 🧪 Step 5: Test in Slack (2 min)

### 5.1 Test @Mention
1. In Slack, go to any channel
2. Type: `@ion hello`
3. Ion should respond!

### 5.2 Test Slash Command
1. Type: `/ion-help`
2. Should show available commands

### 5.3 Test PRD Generation
1. Type: `/prd mobile app redesign`
2. Should generate a PRD with OpenAI

### 5.4 Test DM
1. DM @ion directly
2. Type: `what can you do?`
3. Should respond

**Checkpoint:** All 4 tests pass = Slack bot works! 🎉

---

## 🔗 Step 6: MCP Setup for Cursor (5 min)

### 6.1 Find Cursor Config Location
Mac: `~/.cursor/mcp.json`  
Windows: `%APPDATA%\Cursor\mcp.json`

### 6.2 Create/Edit mcp.json
If file doesn't exist, create it:
```bash
mkdir -p ~/.cursor
touch ~/.cursor/mcp.json
```

### 6.3 Add Ion Configuration
```json
{
  "mcpServers": {
    "ion": {
      "command": "node",
      "args": ["/Users/agenthost/.openclaw/workspace/ion-slack-bot/mcp/server.js"],
      "env": {
        "DATABASE_URL": "postgresql://localhost/ion_slack"
      }
    }
  }
}
```

**Note:** Update path if your workspace is in different location

### 6.4 Restart Cursor
Quit and reopen Cursor completely

### 6.5 Test MCP in Cursor
In Cursor's chat, try:
```
"Search Ion conversations about authentication"
"Get context from #product channel"
```

**Checkpoint:** MCP shows up in Cursor's tools list

---

## ✅ Success Checklist

- [ ] Slack app created at api.slack.com
- [ ] 3 tokens obtained (bot, signing secret, app token)
- [ ] OpenAI API key added to .env
- [ ] Bot starts without errors
- [ ] @ion responds in Slack
- [ ] /ion-help works
- [ ] /prd generates content
- [ ] DMs work
- [ ] MCP configured in Cursor
- [ ] Cursor can query Ion

**If all checked:** Ion is fully operational! 🚀

---

## 🔗 Bonus: Cursor Integration (Optional)

Connect Ion to Cursor for Slack context while coding.

### Setup (2 minutes)

```bash
# Run automated setup
cd ~/.openclaw/workspace/ion-slack-bot
./mcp/setup-cursor.sh
```

Then restart Cursor completely.

### Test

Open Cursor (⌘+L) and try:
```
Use the ion tool to list all channels
```

**Full guide:** `mcp/CURSOR_SETUP.md`  
**Test prompts:** `mcp/CURSOR_TEST.md`

### What It Does

- Search Slack conversations from Cursor
- Generate code based on team decisions
- Reference past discussions without leaving editor
- Find decisions about specific topics

**Don't have Cursor?** Download free from https://cursor.sh

---

## 🐛 Troubleshooting

### Bot doesn't respond
- Check bot is invited to channel: `/invite @ion`
- Verify tokens in .env are correct
- Check console for errors

### "Invalid token" error
- Regenerate tokens in Slack app settings
- Make sure no extra spaces in .env

### MCP not showing in Cursor
- Check path in mcp.json is correct
- Restart Cursor completely (Cmd+Q)
- Check MCP server starts: `node mcp/server.js`

### Database errors
- Database is optional for MVP
- Bot works without it (no message memory)
- To fix: `createdb ion_slack`

---

## 📊 What's Working

**With current setup:**
- ✅ @ion responds to mentions
- ✅ Slash commands generate content
- ✅ DMs work
- ✅ OpenAI integration
- ✅ MCP exposes Slack context to Cursor

**Not yet working (need database):**
- ⏳ Message storage
- ⏳ Vector search
- ⏳ Long-term memory

**Add later (30-60 min each):**
- Database setup + migrations
- Message indexing
- Vector search with pgvector

---

## 🎯 Next Steps After Setup

1. **Immediate:**
   - Test all commands
   - Invite to channels you want indexed
   - Set your role: `/ion set-role` (when we add this)

2. **This Week:**
   - Add database for message storage
   - Implement vector search
   - Deploy to production (Railway/Heroku)

3. **Next Week:**
   - Add more slash commands
   - Beta test with teammates
   - Collect feedback

---

**Ready to start?** Follow steps in order, check off as you go.

**Current step:** Create Slack app at https://api.slack.com/apps
