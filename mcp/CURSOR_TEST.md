# Cursor MCP Test Prompts

Test data has been seeded! 33 test messages across 3 channels.

---

## Setup First

**1. Configure Cursor MCP:**

Copy this to `~/.cursor/mcp.json`:
```bash
mkdir -p ~/.cursor
cp ~/.openclaw/workspace/ion-slack-bot/mcp/cursor-config.json ~/.cursor/mcp.json
```

**2. Restart Cursor** (completely quit and reopen)

**3. Open Cursor's AI chat** (⌘+L on Mac, Ctrl+L on Windows/Linux)

---

## Test Prompts

Copy these prompts into Cursor's AI chat to test the MCP integration.

### Test 1: List Channels

```
Use the ion tool to list all channels
```

**Expected Response:**
```json
[
  {
    "channel_id": "TEST_PRODUCT",
    "message_count": 13
  },
  {
    "channel_id": "TEST_ENGINEERING",
    "message_count": 12
  },
  {
    "channel_id": "TEST_DESIGN",
    "message_count": 8
  }
]
```

---

### Test 2: Search Conversations

```
Use the ion tool to search conversations for "database"
```

**Expected Response:**
Should find messages about PostgreSQL decision:
- "We need to decide on a database"
- "I think we should go with PostgreSQL"
- "Let's go with PostgreSQL then"

---

### Test 3: Get Decision History

```
Use the ion tool to find all decisions about "database"
```

**Expected Response:**
Should find the PostgreSQL decision from the #product channel.

---

### Test 4: Get Channel Messages

```
Use the ion tool to get recent messages from channel TEST_PRODUCT
```

**Expected Response:**
Should show all 13 messages from the product channel in chronological order.

---

### Test 5: Search for Authentication

```
Use the ion tool to search for "authentication"
```

**Expected Response:**
Should find messages about OAuth and JWT from #engineering channel.

---

### Test 6: Get Q2 Features

```
Use the ion tool to search for "Q2 priorities"
```

**Expected Response:**
Should find: "Q2 priorities are user profiles, OAuth, and mobile redesign"

---

### Test 7: Combined Query

```
Search ion for discussions about authentication and then explain what the team decided
```

**Expected Response:**
Cursor will:
1. Use MCP to search for "authentication"
2. Find the OAuth discussion
3. Synthesize: "The team decided to use OAuth for better security and third-party integrations"

---

### Test 8: Code Generation from Context

```
Based on the database decision found in ion's Slack history, generate a PostgreSQL connection module
```

**Expected Response:**
Cursor will:
1. Search for database decisions
2. Find PostgreSQL choice
3. Generate code like:
```javascript
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // ... config
});
```

---

### Test 9: Architecture Question

```
What did the team decide about microservices vs monolith? Search ion's history and explain
```

**Expected Response:**
Should find: "Decision made: Modular monolith for v1"

---

### Test 10: Design Question

```
Search ion for mobile app design decisions
```

**Expected Response:**
Should find Material Design decision with custom colors.

---

## Advanced Tests

### Multi-Step Workflow

```
1. List all channels in ion
2. Get recent messages from TEST_ENGINEERING
3. Summarize the technical decisions made
```

Cursor will chain multiple MCP calls.

---

### Context-Aware Code Generation

```
Search ion for the user profile feature requirements and generate a React component for the profile page
```

Expected:
1. Finds: "avatar, bio, recent activity, stats, privacy controls"
2. Generates React component with those fields

---

### API Design from Decisions

```
The team decided on REST API. Search ion for this decision and generate an Express.js API router based on the context
```

Expected:
1. Finds REST decision
2. Generates Express router code

---

## Troubleshooting

### "Tool not found" error

**Fix:**
1. Check `~/.cursor/mcp.json` exists and has correct path
2. Restart Cursor completely (Cmd+Q, not just close window)
3. Wait 10 seconds after restart before testing

### Empty results

**Check database:**
```bash
psql -d ion_slack -c "SELECT COUNT(*) FROM messages WHERE channel_id LIKE 'TEST_%';"
```

Should show 33 messages.

**Re-seed if needed:**
```bash
psql -d ion_slack -f ~/.openclaw/workspace/ion-slack-bot/db/seed-test-data.sql
```

### MCP server won't start

**Test manually:**
```bash
node ~/.openclaw/workspace/ion-slack-bot/mcp/server.js
# Should output: ✅ Ion MCP Server running
# Press Ctrl+C to stop
```

### Database connection error

**Check PostgreSQL:**
```bash
pg_isready
psql -l | grep ion_slack
```

---

## What's Happening Behind the Scenes

When you ask Cursor to search ion:

```
Cursor AI Chat
     ↓
Calls MCP Tool: search_conversations("database")
     ↓
MCP Server (mcp/server.js)
     ↓
PostgreSQL Query: SELECT * FROM messages WHERE text ILIKE '%database%'
     ↓
Returns Results
     ↓
Cursor formats and displays
```

---

## Success Criteria

✅ All 10 test prompts return relevant results  
✅ Cursor can search across channels  
✅ Multi-step workflows work  
✅ Code generation uses Slack context  
✅ No error messages  

---

## Next Steps After Testing

Once MCP works:

1. **Use with real Slack data:**
   - Invite Ion to real channels
   - Have real conversations
   - Search actual team discussions in Cursor

2. **Add to your workflow:**
   - "What did the team say about X?" while coding
   - Reference decisions without leaving editor
   - Generate code based on requirements discussed in Slack

3. **Customize prompts:**
   - Add domain-specific searches
   - Create shortcuts for common queries
   - Integrate with your coding patterns

---

**Ready to test?** Start with Test 1 (list channels) and work your way through!
