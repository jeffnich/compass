# Compass - Full Local Setup

## What You Need
- Node.js 18+
- PostgreSQL 17 (with pgvector extension)
- OpenAI API key
- Anthropic API key
- Slack app credentials (optional for full bot features)

## Quick Setup

### 1. Install PostgreSQL with pgvector
```bash
# macOS
brew install postgresql@17
brew services start postgresql@17

# Install pgvector extension
brew install pgvector
```

### 2. Create Database
```bash
createdb compass_local
psql compass_local -c "CREATE EXTENSION IF NOT EXISTS vector;"
```

### 3. Set Up Schema
```bash
psql compass_local < db/schema.sql
```

### 4. Seed Demo Data (82 command uses + messages)
```bash
psql compass_local < db/seed-test-data.sql
```

### 5. Configure Environment Variables

Create `.env` in the root directory:
```env
# Database
DATABASE_URL=postgresql://localhost/compass_local

# AI Providers
OPENAI_API_KEY=sk-proj-your-key-here
ANTHROPIC_API_KEY=sk-ant-api03-your-key-here

# Slack (optional - admin UI works without these)
SLACK_BOT_TOKEN=xoxb-your-token
SLACK_SIGNING_SECRET=your-secret
SLACK_APP_TOKEN=xapp-your-token
```

### 6. Install Dependencies
```bash
# Install bot dependencies (needed for DB connection)
npm install

# Install admin UI dependencies
cd ion-admin
npm install
cd ..
```

### 7. Run Admin UI
```bash
cd ion-admin
node server.js
```

Admin UI will be available at: **http://localhost:3002**

## What Works

### Commands Page
- View all 10 commands
- Click to edit/view details
- Create new commands
- Test commands with AI
- View usage stats

### Insights Page
- Overview: Messages, channels, users, commands used
- Decisions: AI-extracted key decisions (Beta)
- Questions: AI-extracted open questions (Beta)
- Real-time stats from database

## Troubleshooting

### PostgreSQL not found
```bash
# Check if Postgres is running
pg_isready

# If not installed:
brew install postgresql@17
brew services start postgresql@17
```

### pgvector extension error
```bash
# Install pgvector
brew install pgvector

# Then in psql:
psql compass_local -c "CREATE EXTENSION vector;"
```

### Port 3002 already in use
```bash
# Kill existing process
lsof -ti:3002 | xargs kill -9

# Or change port in ion-admin/server.js
```

### Database connection error
Check DATABASE_URL in .env matches your Postgres setup:
```
postgresql://username@localhost/compass_local
```

## Demo Data

The seed script creates:
- 82 command usage records (past 7 days)
- 28 sample messages
- 2 channels
- 2 users
- Realistic timestamps and stats

## Next Steps

1. **Test the admin UI**: http://localhost:3002
2. **View insights**: http://localhost:3002/insights.html
3. **Create a new command**: Click "+ New Command"
4. **Test AI responses**: Use the "Test Command" feature

## Optional: Full Slack Bot

If you want the Slack bot running (not required for admin UI demo):

```bash
# In a separate terminal
node server.js
```

This requires Slack app credentials in .env.

---

**Estimated setup time:** 5-10 minutes with Cursor doing the work.
