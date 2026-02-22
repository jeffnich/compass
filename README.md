# Compass - AI Memory for Product Teams

Compass is an AI assistant that lives in your Slack workspace and never forgets. It listens to team conversations, extracts key decisions and open questions, and helps surface insights from past discussions.

## 🎯 What It Does

- **Remembers everything** - Stores all Slack messages with semantic search (pgvector)
- **Extracts decisions** - Natural narrative summaries of what was decided and why
- **Tracks open questions** - Surfaces unresolved blockers automatically
- **Unlimited commands** - `/compass [command]` meta-pattern for infinite slash commands
- **Trending topics** - See what your team is discussing most
- **Admin dashboard** - Manage commands, view insights, track usage

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 17+ with pgvector extension
- Slack workspace (admin access)
- OpenAI API key (required)
- Anthropic API key (optional, for cost optimization)

### Installation

```bash
# 1. Clone the repo
git clone https://github.com/jeffnich/compass.git
cd compass

# 2. Install dependencies
npm install

# 3. Set up database
createdb compass_slack
psql compass_slack < db/schema.sql

# 4. Configure environment
cp .env.example .env
# Edit .env with your credentials

# 5. Set up Slack app
# See SLACK_SETUP.md for detailed instructions

# 6. Start the bot
npm start
```

The bot will connect to Slack via Socket Mode (no public URL required).

### Admin UI

```bash
cd ../compass-admin
npm install
npm start
```

Admin UI runs on http://localhost:3002

## 📚 Documentation

- [Slack Setup Guide](SLACK_SETUP.md) - Create and configure your Slack app
- [Adding Commands](docs/ADDING_COMMANDS.md) - How to create custom commands
- [Memory System](docs/MEMORY_SYSTEM.md) - How semantic search works
- [Deployment Guide](DEPLOYMENT.md) - Production deployment options
- [User Guide](docs/USER_GUIDE.md) - End-user documentation

## 🛠 Built With

- **Slack Bolt SDK** - Official Slack framework with Socket Mode
- **PostgreSQL 17 + pgvector** - Semantic search with vector embeddings
- **OpenAI GPT-4** - Fast responses and embeddings
- **Anthropic Claude Haiku** - Cost-optimized heavy workloads ($0.001/1K vs $0.015/1K)
- **Express.js** - Admin dashboard backend
- **Model Context Protocol (MCP)** - Cursor/VS Code integration

## 💡 Use Cases

Perfect for product teams (10-50 people) at Series A-C startups who need to:

- ✅ Track decisions without tedious note-taking
- ✅ Find past discussions instantly with semantic search
- ✅ Keep remote teams aligned on context
- ✅ Never lose important questions or action items
- ✅ Onboard new team members with full conversation history

## 🎨 Features

### Slash Commands

Built-in commands:
- `/compass prd [feature]` - Generate Product Requirements Document
- `/compass summarize` - Summarize current thread or channel
- `/compass decisions [topic]` - Search past decisions
- `/compass open-questions` - Show unresolved questions
- `/compass design-review [link]` - Review design with context
- `/compass api-spec [endpoint]` - Generate API specification

Add unlimited custom commands via the admin UI - no code required.

### Insights Dashboard

- **Key Decisions** - Narrative summaries of team choices
- **Open Questions** - Unresolved blockers
- **Trending Topics** - Word frequency analysis
- **Team Activity** - Who's discussing what
- **AI Suggestions** - Contextual command recommendations

### Memory System

- **Channel-isolated** - No cross-contamination
- **Semantic search** - Find by meaning, not just keywords
- **Recent + relevant** - Combines chronological and similarity
- **Automatic embedding** - All messages indexed on arrival

## 📊 Architecture

```
┌─────────────────┐
│  Slack (Socket) │
└────────┬────────┘
         │
    ┌────▼─────┐
    │ Compass  │◄──── OpenAI/Anthropic
    │   Bot    │
    └────┬─────┘
         │
    ┌────▼─────────┐
    │ PostgreSQL   │
    │ + pgvector   │
    └──────────────┘

    ┌──────────────┐
    │  Admin UI    │◄──── Commands CRUD
    │ (port 3002)  │      Stats & Insights
    └──────────────┘
```

## 🔧 Configuration

### Environment Variables

```bash
# Slack
SLACK_BOT_TOKEN=xoxb-...
SLACK_SIGNING_SECRET=...
SLACK_APP_TOKEN=xapp-...

# Database
DATABASE_URL=postgresql://localhost/compass_slack

# AI Providers
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...  # Optional

# Server
PORT=3001
NODE_ENV=development
```

### Customization

- **Commands**: Edit `config/commands.json` or use admin UI
- **Prompts**: Modify prompts in commands.json (hot-reload enabled)
- **Models**: Choose OpenAI or Anthropic per-command
- **Context size**: Adjust in `services/context.js`

## 🚢 Deployment

### Docker

```bash
docker-compose up -d
```

See `docker-compose.yml` for full stack (bot + database + admin).

### Manual Deployment

1. Set up PostgreSQL with pgvector on your server
2. Configure environment variables
3. Run migrations: `psql $DATABASE_URL < db/schema.sql`
4. Start bot: `npm start`
5. Start admin: `cd ../compass-admin && npm start`

### Recommended: Railway / Render / Fly.io

Socket Mode means no public webhooks - easy to deploy anywhere.

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repo
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

MIT License - see LICENSE file

## 🙋 Support

- **Issues**: https://github.com/jeffnich/compass/issues
- **Discussions**: https://github.com/jeffnich/compass/discussions
- **Documentation**: https://github.com/jeffnich/compass/wiki

## 🎯 Roadmap

- [ ] Notion/Confluence integration
- [ ] Product requirements pipeline
- [ ] Decision tracking with outcomes
- [ ] Action item extraction
- [ ] Multi-workspace support
- [ ] Mobile app
- [ ] Self-hosted option (no OpenAI required)

---

Built with ❤️ for product teams who value context and clarity.
