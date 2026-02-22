# Ion MCP Server

Expose your Slack workspace context to Cursor/VS Code via Model Context Protocol.

## What This Enables

**In Cursor/VS Code:**
```
You: "Generate React component for the mobile redesign"

Cursor (via MCP):
  → Queries Ion's database
  → Gets PRD from #product channel
  → Gets design specs from #design  
  → Gets technical decisions from #engineering
  → Generates code with FULL CONTEXT
```

## Installation

### 1. Install MCP SDK

```bash
cd ion-slack-bot
npm install @modelcontextprotocol/sdk
```

### 2. Configure Cursor

Add to Cursor settings (`~/.cursor/mcp.json`):

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

### 3. Restart Cursor

MCP server will start automatically when Cursor launches.

## Available Tools

### 1. search_conversations
Search Slack history semantically:
```
"Search conversations about authentication"
```

### 2. get_channel_context
Get recent messages from a channel:
```
"Get context from #product channel"
```

### 3. get_decision_history
Find product/technical decisions:
```
"Get decision history about API design"
```

### 4. ask_ion
Ask Ion's AI with full workspace context:
```
"Ask Ion: What features are we building this quarter?"
```

## Resources

MCP exposes Slack channels as resources:

```
slack://channel/C01ABC123
slack://channel/C02DEF456
```

Cursor can read these to get channel history.

## Prompts

Pre-built prompt templates:

### code_from_requirements
```
Generate code for [feature] using requirements from #product
```

### technical_context
```
Get technical context for [feature] from #engineering
```

## Usage in Cursor

### Example 1: Generate Code with Context
```
Prompt: "Generate authentication API using requirements from #product"

MCP Flow:
1. get_channel_context(channel: "product")
2. Returns recent #product messages
3. Cursor generates code with that context
```

### Example 2: Search Decisions
```
Prompt: "What did we decide about database choice?"

MCP Flow:
1. get_decision_history(topic: "database")
2. Returns messages with decisions
3. LLM summarizes the decision
```

### Example 3: Ask Ion Directly
```
Prompt: "Ask Ion what our mobile app priorities are"

MCP Flow:
1. ask_ion(question: "what are mobile app priorities")
2. Ion searches all channels
3. Returns AI-generated answer with context
```

## Under the Hood

```
Cursor/VS Code
     ↓ (MCP protocol via stdio)
mcp/server.js
     ↓ (SQL queries)
PostgreSQL (ion_slack database)
     ↓
Returns: messages, channels, decisions
     ↓
Cursor uses as context for code generation
```

## Database Schema Required

The MCP server expects these tables:

```sql
-- Slack channels
CREATE TABLE slack_channels (
    id UUID PRIMARY KEY,
    slack_channel_id VARCHAR(20),
    channel_name VARCHAR(200),
    is_indexed BOOLEAN
);

-- Messages with embeddings
CREATE TABLE messages (
    id UUID PRIMARY KEY,
    channel_id UUID REFERENCES slack_channels(id),
    text TEXT,
    user_id VARCHAR(20),
    created_at TIMESTAMP,
    embedding vector(1536) -- for semantic search
);

-- User info
CREATE TABLE slack_users (
    slack_user_id VARCHAR(20) PRIMARY KEY,
    username VARCHAR(200)
);
```

## TODO: Add Vector Search

Currently uses basic text search. To enable semantic search:

1. Install pgvector: `brew install pgvector`
2. Enable in DB: `CREATE EXTENSION vector;`
3. Generate embeddings on message store
4. Update search_conversations to use vector similarity

## Testing

```bash
# Run MCP server standalone
node mcp/server.js

# Should output:
# Ion MCP Server running on stdio
# Available tools: [...]
```

## Troubleshooting

### "Cannot find module '@modelcontextprotocol/sdk'"
```bash
npm install @modelcontextprotocol/sdk
```

### "Database connection failed"
Check `DATABASE_URL` in Cursor MCP config matches your database.

### "No results returned"
Ensure messages are stored in database (bot needs to be running and indexing channels).

## Next Steps

1. ✅ MCP server created
2. [ ] Install MCP SDK: `npm install @modelcontextprotocol/sdk`
3. [ ] Add to Cursor settings
4. [ ] Test in Cursor
5. [ ] Add vector search for better semantic results

## Resources

- [MCP Specification](https://modelcontextprotocol.io/)
- [Cursor MCP Docs](https://docs.cursor.com/mcp)
- [Example MCP Servers](https://github.com/modelcontextprotocol)
