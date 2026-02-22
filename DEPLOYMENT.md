# Ion Slack Bot - Deployment Guide

This guide shows how to package and deploy Ion to another machine or app instance.

---

## Quick Deploy (5 minutes)

### Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- OpenAI API key
- Slack workspace admin access

### Steps

1. **Copy the entire folder** to new machine
2. **Run setup script:** `./scripts/setup.sh`
3. **Configure environment:** Edit `.env` with your tokens
4. **Start bot:** `npm start`

Done!

---

## Package for Distribution

### Create Portable Archive

```bash
cd ~/.openclaw/workspace
tar -czf ion-slack-bot-portable.tar.gz \
  --exclude='node_modules' \
  --exclude='.env' \
  --exclude='*.log' \
  ion-slack-bot/
```

This creates a ~50KB archive (without dependencies).

### What's Included

```
ion-slack-bot/
├── .env.example          # Template for configuration
├── package.json          # Dependencies
├── server.js             # Main app
├── handlers/             # Event handlers
├── services/             # OpenAI, context, database
├── commands/             # Slash command registry
├── db/
│   ├── schema.sql        # Database schema
│   └── client.js         # Database connection
├── docs/                 # Documentation
└── scripts/
    ├── setup.sh          # Automated setup
    └── migrate.sh        # Database migration
```

---

## Installation on New Machine

### 1. Extract Archive

```bash
tar -xzf ion-slack-bot-portable.tar.gz
cd ion-slack-bot
```

### 2. Run Setup Script

```bash
chmod +x scripts/setup.sh
./scripts/setup.sh
```

This will:
- Install Node.js dependencies
- Check for PostgreSQL
- Create database
- Run schema migrations
- Verify pgvector extension

### 3. Configure Environment

Copy and edit `.env`:

```bash
cp .env.example .env
nano .env
```

Required variables:
```bash
SLACK_BOT_TOKEN=xoxb-...
SLACK_SIGNING_SECRET=...
SLACK_APP_TOKEN=xapp-...
OPENAI_API_KEY=sk-...
DATABASE_URL=postgresql://localhost/ion_slack
```

### 4. Create Slack App

Follow `docs/SLACK_SETUP.md` or:

1. Go to https://api.slack.com/apps
2. Create app from manifest: `slack-app-manifest.yaml`
3. Copy tokens to `.env`

### 5. Start Bot

```bash
npm start
```

---

## Docker Deployment (Recommended for Production)

### Dockerfile

```dockerfile
FROM node:18-alpine

# Install PostgreSQL client
RUN apk add --no-cache postgresql-client

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy app files
COPY . .

# Expose health check port
EXPOSE 3001

CMD ["node", "server.js"]
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  ion-bot:
    build: .
    environment:
      - SLACK_BOT_TOKEN=${SLACK_BOT_TOKEN}
      - SLACK_SIGNING_SECRET=${SLACK_SIGNING_SECRET}
      - SLACK_APP_TOKEN=${SLACK_APP_TOKEN}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - DATABASE_URL=postgresql://postgres:password@db:5432/ion_slack
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: pgvector/pgvector:pg17
    environment:
      - POSTGRES_DB=ion_slack
      - POSTGRES_PASSWORD=password
    volumes:
      - pgdata:/var/lib/postgresql/data
      - ./db/schema.sql:/docker-entrypoint-initdb.d/schema.sql
    restart: unless-stopped

volumes:
  pgdata:
```

### Deploy with Docker

```bash
docker-compose up -d
```

---

## Cloud Deployment

### Railway (Easiest)

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin YOUR_REPO_URL
   git push -u origin main
   ```

2. **Deploy on Railway:**
   - Go to https://railway.app
   - New Project → Deploy from GitHub
   - Select your repo
   - Add PostgreSQL service
   - Add environment variables
   - Deploy!

**Cost:** ~$5/month (hobby plan)

### Heroku

```bash
# Install Heroku CLI
brew install heroku

# Login
heroku login

# Create app
heroku create ion-slack-bot

# Add PostgreSQL
heroku addons:create heroku-postgresql:mini

# Set environment variables
heroku config:set SLACK_BOT_TOKEN=xoxb-...
heroku config:set SLACK_SIGNING_SECRET=...
heroku config:set SLACK_APP_TOKEN=xapp-...
heroku config:set OPENAI_API_KEY=sk-...

# Deploy
git push heroku main

# Run database migration
heroku pg:psql < db/schema.sql
```

**Cost:** ~$7/month (Eco dyno + mini Postgres)

### DigitalOcean App Platform

1. **Create `app.yaml`:**

```yaml
name: ion-slack-bot
services:
- name: web
  github:
    repo: YOUR_USERNAME/ion-slack-bot
    branch: main
  build_command: npm install
  run_command: node server.js
  envs:
  - key: SLACK_BOT_TOKEN
    scope: RUN_TIME
  - key: SLACK_SIGNING_SECRET
    scope: RUN_TIME
  - key: SLACK_APP_TOKEN
    scope: RUN_TIME
  - key: OPENAI_API_KEY
    scope: RUN_TIME
  - key: DATABASE_URL
    scope: RUN_TIME

databases:
- name: ion-db
  engine: PG
  version: "17"
```

2. **Deploy:**
   - Go to https://cloud.digitalocean.com/apps
   - Create App → Import from GitHub
   - Select repo
   - Configure environment variables
   - Deploy!

**Cost:** ~$12/month ($5 app + $7 database)

---

## Environment Variables

### Required

```bash
SLACK_BOT_TOKEN=xoxb-...          # From OAuth & Permissions
SLACK_SIGNING_SECRET=...          # From Basic Information
SLACK_APP_TOKEN=xapp-...          # From Socket Mode
OPENAI_API_KEY=sk-...            # From OpenAI
DATABASE_URL=postgresql://...    # PostgreSQL connection
```

### Optional

```bash
PORT=3001                         # Server port (default: 3001)
NODE_ENV=production              # Environment (default: development)
```

---

## Database Migration

### Export Database (from old instance)

```bash
pg_dump ion_slack > ion_slack_backup.sql
```

### Import Database (to new instance)

```bash
# Create database
createdb ion_slack

# Run schema
psql -d ion_slack -f db/schema.sql

# Import data (optional - if migrating existing data)
psql -d ion_slack < ion_slack_backup.sql
```

### Schema-Only Migration (Fresh Start)

```bash
psql -d ion_slack -f db/schema.sql
```

---

## Production Checklist

### Before Deploying

- [ ] Remove sensitive data from `.env.example`
- [ ] Update `NODE_ENV=production` in production
- [ ] Set up error monitoring (Sentry, etc.)
- [ ] Configure log aggregation
- [ ] Set up database backups
- [ ] Document custom slash commands

### After Deploying

- [ ] Test all slash commands
- [ ] Verify message storage
- [ ] Check vector search works
- [ ] Monitor error logs
- [ ] Set up health checks
- [ ] Configure alerts

---

## Monitoring

### Health Check Endpoint

Add to `server.js`:

```javascript
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});
```

### Database Health

```sql
-- Check message count
SELECT COUNT(*) FROM messages;

-- Check recent activity
SELECT MAX(slack_created_at) FROM messages;

-- Check embedding coverage
SELECT 
  COUNT(*) as total,
  SUM(CASE WHEN embedding IS NOT NULL THEN 1 ELSE 0 END) as with_embedding
FROM messages;
```

### Logs

```bash
# View logs
npm start 2>&1 | tee ion.log

# Search logs
grep "ERROR" ion.log

# Monitor in real-time
tail -f ion.log
```

---

## Scaling

### Horizontal Scaling (Multiple Instances)

Ion uses Socket Mode (WebSocket), so you can run multiple instances:

```yaml
# docker-compose.yml
services:
  ion-bot-1:
    build: .
    # ... config ...
  
  ion-bot-2:
    build: .
    # ... config ...
```

Slack will load-balance events across instances.

### Database Optimization

For >100K messages:

```sql
-- Increase vector index lists
DROP INDEX idx_embedding;
CREATE INDEX idx_embedding ON messages 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 500);

-- Add partitioning (optional)
CREATE TABLE messages_2026_03 PARTITION OF messages
FOR VALUES FROM ('2026-03-01') TO ('2026-04-01');
```

---

## Backup Strategy

### Automated Daily Backups

```bash
#!/bin/bash
# scripts/backup.sh

DATE=$(date +%Y%m%d)
BACKUP_DIR="/backups"

# Dump database
pg_dump ion_slack | gzip > $BACKUP_DIR/ion_slack_$DATE.sql.gz

# Keep last 30 days
find $BACKUP_DIR -name "ion_slack_*.sql.gz" -mtime +30 -delete
```

Run daily via cron:
```bash
0 2 * * * /path/to/scripts/backup.sh
```

### Cloud Storage

Upload backups to S3/Spaces:

```bash
aws s3 cp $BACKUP_DIR/ion_slack_$DATE.sql.gz s3://my-backups/
```

---

## Troubleshooting

### Bot won't start

**Check:**
1. Node.js version: `node --version` (need 18+)
2. Dependencies installed: `npm install`
3. Environment variables set: `cat .env`
4. PostgreSQL running: `psql -l`

### Database connection fails

**Fix:**
```bash
# Check PostgreSQL is running
pg_isready

# Verify database exists
psql -l | grep ion_slack

# Test connection
psql -d ion_slack -c "SELECT 1;"
```

### Vector search not working

**Fix:**
```bash
# Check pgvector extension
psql -d ion_slack -c "SELECT * FROM pg_extension WHERE extname = 'vector';"

# If missing, install:
psql -d ion_slack -c "CREATE EXTENSION vector;"
```

### Messages not being stored

**Check logs for:**
- OpenAI API errors (invalid key?)
- Database errors (connection issues?)
- Event listener errors (Slack permissions?)

---

## Security

### Production Hardening

1. **Rotate tokens regularly**
2. **Use environment variables** (never commit `.env`)
3. **Enable database SSL:** `DATABASE_URL=postgresql://...?sslmode=require`
4. **Restrict database access** (firewall rules)
5. **Monitor API usage** (OpenAI dashboard)

### Secrets Management

Use a secrets manager:

```bash
# AWS Secrets Manager
aws secretsmanager get-secret-value --secret-id ion-slack-bot

# HashiCorp Vault
vault kv get secret/ion-slack-bot
```

---

## Cost Estimation

### Typical Monthly Costs

**Small workspace (10 users, 1K messages/day):**
- Hosting: $5-12 (Railway/Heroku)
- Database: $7 (managed Postgres)
- OpenAI: $10-20 (embeddings + GPT-4)
- **Total: ~$25/month**

**Medium workspace (50 users, 5K messages/day):**
- Hosting: $12-25
- Database: $15 (larger instance)
- OpenAI: $50-100
- **Total: ~$100/month**

**Large workspace (200 users, 20K messages/day):**
- Hosting: $25-50
- Database: $25-50
- OpenAI: $200-400
- **Total: ~$300-500/month**

---

## Cursor Integration (MCP)

Ion includes an MCP server for Cursor integration.

### Setup on New Machine

After deploying Ion:

```bash
# 1. Configure Cursor MCP
mkdir -p ~/.cursor
cp mcp/cursor-config.json ~/.cursor/mcp.json

# 2. Update path in mcp.json to match your deployment
# Edit ~/.cursor/mcp.json and change the path

# 3. Restart Cursor
```

### Test Data (Optional)

For testing without real Slack data:

```bash
psql -d ion_slack -f db/seed-test-data.sql
```

This seeds 33 test messages for testing MCP functionality.

### Documentation

- **Setup Guide:** `mcp/CURSOR_SETUP.md`
- **Test Prompts:** `mcp/CURSOR_TEST.md`
- **Server Code:** `mcp/server.js`

---

## Support

### Documentation

- `SETUP_CHECKLIST.md` - Initial setup
- `SLACK_SETUP.md` - Slack app creation
- `MEMORY_SYSTEM.md` - Database details
- `ADDING_COMMANDS.md` - Custom commands
- `USER_GUIDE.md` - End-user guide

### Community

- GitHub Issues: [Report bugs]
- Discord: [Get help]
- Email: [Contact support]

---

**Last Updated:** Feb 22, 2026  
**Version:** 1.0.0
