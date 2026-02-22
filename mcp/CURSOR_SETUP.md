# Cursor + Ion MCP Integration

Connect Cursor to your Slack workspace through Ion's MCP server.

---

## What You Get

Once connected, Cursor can:

✅ **Search Slack conversations** - Find past discussions while coding  
✅ **Get channel context** - Pull relevant messages into your editor  
✅ **Find decisions** - "What did we decide about authentication?"  
✅ **Ask questions** - Query your team's knowledge base  

All from within Cursor's AI chat!

---

## Quick Setup (5 minutes)

### 1. Install Cursor

If you don't have it:

```bash
# Download from
open https://cursor.sh
```

Or if you already have it, continue.

### 2. Find MCP Config Location

**macOS:**
```bash
mkdir -p ~/.cursor
touch ~/.cursor/mcp.json
```

**Windows:**
```cmd
mkdir %APPDATA%\Cursor
type nul > %APPDATA%\Cursor\mcp.json
```

**Linux:**
```bash
mkdir -p ~/.cursor
touch ~/.cursor/mcp.json
```

### 3. Configure MCP Server

Edit `~/.cursor/mcp.json` (or `%APPDATA%\Cursor\mcp.json` on Windows):

```json
{
  "mcpServers": {
    "ion": {
      "command": "node",
      "args": [
        "/Users/agenthost/.openclaw/workspace/ion-slack-bot/mcp/server.js"
      ],
      "env": {
        "DATABASE_URL": "postgresql://localhost/ion_slack"
      }
    }
  }
}
```

**Important:** Replace the path with your actual path to `mcp/server.js`.

To get the full path:
```bash
cd ~/.openclaw/workspace/ion-slack-bot/mcp
pwd
# Copy this path and add /server.js
```

### 4. Restart Cursor

Quit Cursor completely (⌘+Q on Mac, Alt+F4 on Windows), then reopen.

### 5. Test It

Open Cursor's AI chat (⌘+L or Ctrl+L) and try:

```
Use the ion tool to search conversations about "authentication"
```

Or:

```
Get channel messages from <channel-id>
```

You should see results from your Slack workspace!

---

## Available Tools

Once connected, Cursor has these tools:

### 1. `search_conversations`

Search Slack by keyword.

**Example prompts:**
```
Search Slack for discussions about "database schema"
Find messages mentioning "API design"
Show me what the team said about "authentication"
```

### 2. `get_channel_messages`

Get recent messages from a specific channel.

**Example prompts:**
```
Get recent messages from channel <channel-id>
Show me the last 20 messages from #product
What's the latest in #engineering?
```

**Note:** You need the channel ID, not name. Get it with `list_channels` first.

### 3. `get_decision_history`

Find product/technical decisions.

**Example prompts:**
```
What decisions did we make about authentication?
Find all decisions related to API design
Show me architecture decisions from the last month
```

### 4. `list_channels`

List all channels Ion has indexed.

**Example prompts:**
```
List all channels with messages
Which channels does Ion have access to?
Show me available channels
```

---

## Example Workflow

### Generate Code from Slack Requirements

1. **In Slack:** Team discusses new feature in #product channel
2. **In Cursor:** 
   ```
   Search Slack for "user profile feature" and generate the implementation
   ```
3. **Cursor:**
   - Searches Slack via MCP
   - Reads requirements from discussions
   - Generates code based on team decisions

### Reference Past Decisions

1. **In Cursor:**
   ```
   What did the team decide about database choices? Generate a connection pool based on that.
   ```
2. **Cursor:**
   - Uses `get_decision_history` to find Slack messages
   - References team consensus
   - Implements accordingly

### Get Context While Coding

1. **In Cursor:**
   ```
   Show me recent #engineering messages and explain the current architecture
   ```
2. **Cursor:**
   - Fetches channel context
   - Synthesizes overview
   - Helps you understand the system

---

## Troubleshooting

### MCP server not showing up

**Check:**
1. Path in `mcp.json` is correct (use absolute path)
2. Node.js is in PATH: `which node`
3. Database is accessible: `psql -d ion_slack -c "SELECT COUNT(*) FROM messages;"`

**Fix:**
```bash
# Test MCP server manually
node ~/.openclaw/workspace/ion-slack-bot/mcp/server.js
# Should output: "✅ Ion MCP Server running"
# Press Ctrl+C to stop
```

### "Cannot find module" errors

**Fix:**
```bash
cd ~/.openclaw/workspace/ion-slack-bot
npm install @modelcontextprotocol/sdk
```

### No results from searches

**Check:**
1. Ion bot is running and storing messages
2. Database has messages: `psql -d ion_slack -c "SELECT COUNT(*) FROM messages;"`
3. Have some Slack conversations with Ion invited to channels

**Populate test data:**
- Invite Ion to a channel: `/invite @ion`
- Have some conversations
- Wait a minute for indexing
- Try searching again

### Database connection errors

**Fix:**
```bash
# Make sure PostgreSQL is running
brew services start postgresql@17  # macOS
sudo systemctl start postgresql    # Linux

# Check database exists
psql -l | grep ion_slack
```

### Wrong database URL

If your database is not at `localhost`, update `mcp.json`:

```json
{
  "mcpServers": {
    "ion": {
      "command": "node",
      "args": ["..."],
      "env": {
        "DATABASE_URL": "postgresql://user:pass@host:5432/ion_slack"
      }
    }
  }
}
```

---

## Advanced Usage

### Search Specific Channels

```
Search for "authentication" only in channel C123ABC456
```

Cursor will use the `channel` parameter.

### Limit Results

```
Get last 50 messages from #product
```

Cursor will adjust the `limit` parameter.

### Combine Multiple Tools

```
List all channels, then get recent messages from the most active one and summarize the discussion
```

Cursor will chain multiple MCP calls.

---

## Tips

### 1. Be Specific

❌ "Search Slack"  
✅ "Search Slack for discussions about authentication methods"

### 2. Use Context

```
Based on what the team discussed in #product, implement the user profile feature
```

Cursor will fetch Slack context and use it for code generation.

### 3. Reference Decisions

```
The team decided on PostgreSQL. Generate a database connection module following that decision.
```

Cursor finds the decision in Slack and implements accordingly.

### 4. Get Channel IDs

First run:
```
List all channels
```

Then use the IDs:
```
Get messages from C0AG123456
```

---

## Example Prompts

### Product Development

```
Search Slack for feature requirements and generate a PRD
Find all decisions about the payment flow and implement it
What features did the team discuss this week?
```

### Architecture

```
What did we decide about microservices vs monolith?
Search for architecture discussions and explain our current setup
Find database schema decisions
```

### Debugging

```
Search for error messages matching "authentication failed"
What did the team say about this bug?
Find related discussions about this issue
```

### Context Building

```
Summarize all discussions in #product from the last 7 days
What's the current status of the mobile app based on #engineering?
Get me up to speed on the API redesign
```

---

## Performance

### Search Speed

- Keyword search: <100ms
- Semantic search: ~500ms (requires embedding)
- Channel fetch: <50ms

### Limits

- Max results per search: 100 (configurable)
- Max message length: No limit
- Concurrent searches: Limited by PostgreSQL connections

---

## Privacy & Security

### What Cursor Can Access

✅ Messages in channels where Ion is invited  
✅ Public channel history  
❌ Private DMs (unless to Ion directly)  
❌ Channels where Ion isn't invited  

### Data Flow

```
Cursor → MCP Server → PostgreSQL → Results → Cursor
```

Everything stays local - no data sent to external services except:
- OpenAI (if using semantic search)
- Your configured database

### Disable MCP

Remove from `mcp.json` or set to empty object:

```json
{
  "mcpServers": {}
}
```

---

## Upgrading

### Update MCP Server

```bash
cd ~/.openclaw/workspace/ion-slack-bot
git pull  # If using git
# Or manually copy new mcp/server.js
```

### Update SDK

```bash
npm install @modelcontextprotocol/sdk@latest
```

Restart Cursor after updates.

---

## Alternative: VS Code

Same setup works for VS Code with MCP extension:

1. Install MCP extension for VS Code
2. Configure in VS Code settings:
   ```json
   {
     "mcp.servers": {
       "ion": {
         "command": "node",
         "args": ["...path.../mcp/server.js"],
         "env": { "DATABASE_URL": "..." }
       }
     }
   }
   ```
3. Restart VS Code

---

## Example Session

```
You: List all channels

Cursor: [Uses list_channels tool]
Found 3 channels:
- C0AG123ABC (142 messages)
- C0AG456DEF (89 messages)  
- C0AG789GHI (34 messages)

You: Get recent messages from C0AG123ABC

Cursor: [Uses get_channel_messages]
[2026-02-22T10:30:00Z] U123: Let's use PostgreSQL for the backend
[2026-02-22T10:31:00Z] U456: Agreed, better for our use case
[2026-02-22T10:32:00Z] U789: I'll set up the connection pool
...

You: Based on that discussion, create a PostgreSQL connection module

Cursor: [Generates code based on Slack context]
```javascript
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
});

module.exports = pool;
```

Based on the team's decision to use PostgreSQL, here's a connection module...
```

---

## Support

- **MCP Server Issues:** Check `~/.openclaw/workspace/ion-slack-bot/mcp/README.md`
- **Cursor Issues:** https://cursor.sh/docs
- **Ion Issues:** See main `README.md`

---

**Last Updated:** Feb 22, 2026  
**MCP Version:** 1.0.0  
**Cursor Compatibility:** Latest
