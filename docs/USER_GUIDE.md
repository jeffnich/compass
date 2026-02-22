# Ion User Guide

**Your AI teammate that learns from your conversations**

## What is Ion?

Ion is an AI assistant that lives in your Slack workspace and connects to your code editor. It learns from your team's conversations and helps you work smarter by:

- Answering questions with context from past discussions
- Generating product documents (PRDs, specs, user stories)
- Searching decisions and historical context
- Providing insights across all your Slack channels

---

## Two Ways to Use Ion

### 1. Slack Bot (Daily Work)
Chat with Ion directly in Slack for quick answers and team collaboration.

### 2. Cursor/VS Code via MCP (Deep Work)
Access Ion's knowledge while writing code, specs, or documentation.

**Both use the same AI and knowledge base** - pick whichever fits your task.

---

## Getting Started

### First Time Setup (5 minutes)

**Step 1: Set Your Role**
```
/ion set-role
```
Select your role(s) to personalize Ion's responses:
- Product Manager
- Product Designer
- Engineering Manager
- Software Engineer
- Marketing Manager
- And more...

**Step 2: Invite Ion to Channels**
```
/invite @ion
```
Add Ion to channels where you want it to learn from:
- #product
- #engineering
- #design
- #customer-feedback

**Tip:** Only invite Ion to channels you're comfortable having indexed.

**Step 3: Try a Command**
```
/ion help
```
See all available commands and features.

---

## Using Ion in Slack

### @Mentions - Ask Anything

Mention @ion in any channel or thread:

```
@ion what features are we building this quarter?
@ion can you explain our authentication approach?
@ion summarize this thread
```

**When to use:**
- Quick questions
- Need context from past conversations
- Want team to see the answer
- Mobile-friendly interaction

### Slash Commands - Structured Tasks

Use `/ion [command]` for specific tasks:

```
/ion prd mobile app redesign
/ion user-story login flow
/ion summarize
/ion decisions authentication
/ion design-review https://figma.com/...
```

**When to use:**
- Generate documents
- Search historical decisions
- Review designs with context
- Create structured content

### Direct Messages - Private Help

DM @ion for private conversations:

```
You → @ion: Help me draft a difficult message to stakeholders

Ion → [Private response with suggestions]
```

**When to use:**
- Sensitive topics
- Draft messages before sharing
- Personal productivity help

---

## Ion Commands by Role

### Product Managers

**Discovery & Planning:**
```
/ion prd [feature]                  → Generate PRD
/ion user-story [description]       → Create user story
/ion competitive-analysis [topic]   → Analyze competitors
/ion roadmap                        → Generate roadmap view
```

**Decisions & Alignment:**
```
/ion decisions [topic]              → Search past decisions
/ion stakeholder-update             → Draft stakeholder update
/ion prioritize                     → Prioritization framework
```

**Metrics & Launch:**
```
/ion metrics-dashboard [feature]    → Define success metrics
/ion gtm [product]                  → Go-to-market plan
/ion release-notes [version]        → Generate release notes
```

### Product Designers

**Design Process:**
```
/ion user-flow [feature]            → Map user flow
/ion design-review [link]           → Review design
/ion wireframe-content [screen]     → Generate wireframe content
/ion accessibility-audit [link]     → Accessibility review
```

**Collaboration:**
```
/ion design-critique [link]         → Structured critique
/ion design-handoff [feature]       → Handoff documentation
/ion design-system-component [name] → Component spec
```

### Engineering Managers

**Planning & Process:**
```
/ion sprint-plan                    → Generate sprint plan
/ion tech-debt                      → Prioritize tech debt
/ion one-on-one [person]            → 1:1 prep
/ion team-charter                   → Draft team charter
```

**Technical:**
```
/ion design-review-tech [spec]      → Technical design review
/ion incident-retro [incident]      → Incident retrospective
/ion oncall-policy                  → Oncall policy draft
```

### Software Engineers

**Development:**
```
/ion api-spec [endpoint]            → API specification
/ion tech-design [feature]          → Technical design doc
/ion code-review-standards          → Code review guide
```

**Documentation:**
```
/ion architecture-docs [system]     → Architecture overview
/ion troubleshooting [issue]        → Troubleshooting guide
```

### All Roles

**Universal Commands:**
```
/ion help                           → Show all commands
/ion summarize                      → Summarize discussion
/ion decisions [topic]              → Search decisions
/ion set-role                       → Change your role(s)
```

---

## Using Ion in Cursor/VS Code (MCP)

### What is MCP?

Model Context Protocol lets Ion connect to your code editor. When you're coding or writing docs, Ion provides context from your Slack workspace.

### Setup (One Time)

**1. Install in Cursor**

Add to `~/.cursor/mcp.json`:
```json
{
  "mcpServers": {
    "ion": {
      "command": "node",
      "args": ["/path/to/ion-slack-bot/mcp/server.js"],
      "env": {
        "DATABASE_URL": "postgresql://localhost/ion_slack"
      }
    }
  }
}
```

**2. Restart Cursor**

Ion's MCP server will start automatically.

### How to Use

**In Cursor's chat or inline prompts:**

```
"Generate API spec for user authentication based on #product requirements"

"What did we decide about database choice?"

"Show me requirements from #customer-feedback for mobile app"

"Create React component for feature discussed in #design"
```

**MCP Tools Available:**

1. **search_conversations** - Semantic search across Slack
2. **get_channel_context** - Recent messages from specific channel
3. **get_decision_history** - Find product/technical decisions
4. **ask_ion** - Ask Ion's AI directly

### Example Workflows

**Writing a PRD:**
```
Cursor prompt: 
"Generate PRD for mobile app redesign using discussions from #product"

MCP:
→ Searches #product for mobile app mentions
→ Pulls recent requirements and decisions
→ Returns structured PRD in markdown
→ You edit and save to Git
```

**Code Generation with Context:**
```
Cursor prompt:
"Generate authentication API based on security requirements in #engineering"

MCP:
→ Gets technical decisions from #engineering
→ Finds security constraints discussed
→ Generates code matching your team's standards
```

**Decision Lookup:**
```
Cursor prompt:
"What did we decide about user authentication approach?"

MCP:
→ Searches messages with "decided", "consensus", etc.
→ Filters for authentication topic
→ Returns summary of decision + context
```

---

## Best Practices

### For Maximum Value

**1. Index the Right Channels**

✅ **Do index:**
- #product, #engineering, #design (core work)
- #customer-feedback, #analytics (insights)
- #decisions, #roadmap (strategic)

❌ **Don't index:**
- #random, #watercooler (noise)
- #hr, #payroll (privacy)
- Private channels with sensitive data

**2. Use Descriptive Language**

When discussing decisions in Slack, use clear language:

✅ Good:
```
"We decided to use JWT for authentication because of mobile requirements"
"Consensus: Ship mobile web first, native apps in Q3"
```

❌ Vague:
```
"Yeah let's do that"
"Sounds good 👍"
```

**3. Choose the Right Interface**

| Task | Use Slack | Use Cursor MCP |
|------|-----------|----------------|
| Quick question | ✅ | ❌ |
| Team discussion | ✅ | ❌ |
| Write detailed spec | ❌ | ✅ |
| Generate code | ❌ | ✅ |
| Share with team | ✅ | ❌ |
| Version control output | ❌ | ✅ |

**4. Thread Your Conversations**

Use threads to keep context together:
```
Main channel: "Planning mobile app redesign"
└─ Thread: @ion what's our mobile strategy?
  └─ Ion: [Response with context]
    └─ Team discussion
      └─ @ion prd mobile app
```

**5. Set Your Role(s)**

Set accurate role(s) for better responses:
```
/ion set-role
```

You can have multiple roles:
- Product Manager + Product Designer
- Engineering Manager + Backend Engineer
- Technical Writer + Content Creator

**6. Review Summaries Weekly**

```
Every Friday in #product:
/ion summarize

Reviews:
→ Key decisions made this week
→ Action items
→ Blockers discussed
→ Archive for future reference
```

### Privacy & Security

**What Ion Can See:**
- Only channels it's invited to
- Public messages (not private DMs between others)
- File links (not file contents unless shared in message)

**What Ion Stores:**
- Message text and metadata
- Embeddings (for semantic search)
- Channel and user info

**What Ion Doesn't Store:**
- Private DMs between other users
- Deleted messages (respects Slack deletions)
- Files or attachments

**How to Remove Data:**
```
/ion forget-channel #channel-name
/ion delete-my-data
```

**Compliance:**
- GDPR compliant (data deletion on request)
- SOC 2 Type II (roadmap)
- Encrypted at rest and in transit

---

## Common Workflows

### Product Manager Daily Flow

**Morning: Planning**
```
8:00 AM in #product
@ion what were the top customer requests this week?

Review response, discuss with team

/ion prioritize

Plan sprint based on insights
```

**Midday: Documentation**
```
12:00 PM - Open Cursor

New file: feature-spec.md

Prompt: "Generate feature spec for [X] using #product and 
#customer-feedback discussions"

Edit, commit to Git
```

**Evening: Stakeholder Update**
```
5:00 PM in Slack

/ion stakeholder-update

Copy to email/Notion
Send to leadership
```

### Engineer Workflow

**Starting a Feature**
```
1. Read spec in Notion/GitHub
2. Open Cursor
3. Prompt: "Generate API endpoints for [feature] based on 
   #product requirements and #engineering technical decisions"
4. Review generated code
5. Implement with context
```

**Code Review**
```
In Slack during PR review:

@ion what was our decision about error handling?

Ion: Based on #engineering (3 months ago):
"Use custom error classes, log to Sentry, return 
user-friendly messages..."

Apply to PR feedback
```

**Incident Response**
```
During incident in #engineering:

@ion what's our rollback procedure?

Ion: [Finds documented procedure]

After incident:
/ion incident-retro [description]

Generates structured retrospective
```

### Designer Workflow

**Design Reviews**
```
In #design thread:

Designer posts Figma link

/ion design-review https://figma.com/...

Ion reviews considering:
- Accessibility standards discussed in #design
- Design system patterns
- User feedback from #customer-feedback
- Technical constraints from #engineering
```

**Handoff Documentation**
```
In Cursor:

Prompt: "Generate design handoff doc for mobile redesign 
using Figma link and #design discussions"

Includes:
- Component specs
- Interaction patterns
- Edge cases discussed
- Technical notes
```

---

## Tips & Tricks

### Get Better Responses

**Be Specific:**
```
❌ @ion what should we build?
✅ @ion based on #customer-feedback, what are the top 3 
   requested features for mobile users?
```

**Provide Context:**
```
❌ /ion prd payments
✅ /ion prd payment processing for marketplace sellers, 
   considering Stripe integration discussed in #engineering
```

**Use Threads:**
```
✅ Ask follow-up questions in same thread
Ion maintains context across thread
```

### Power User Features

**Summarize Long Discussions:**
```
In a 100+ message thread:
/ion summarize

Get:
→ Key points
→ Decisions made
→ Action items
→ Unresolved questions
```

**Compare Options:**
```
@ion compare the database options we discussed in #engineering

Ion:
→ Finds PostgreSQL vs MongoDB discussion
→ Pros/cons from team members
→ Final decision and reasoning
```

**Extract Action Items:**
```
After planning meeting in #product:
@ion extract action items from this discussion

Ion:
→ Lists @mentions with tasks
→ Deadlines mentioned
→ Owners assigned
```

**Cross-Channel Insights:**
```
@ion what's the status of mobile app across all channels?

Ion searches:
→ #product (roadmap status)
→ #engineering (technical progress)
→ #design (design status)
→ #marketing (launch plans)
→ Synthesized summary
```

### Keyboard Shortcuts (Cursor)

```
Cmd+K → Open Cursor chat
Type: ask ion [question]
```

### Mobile Usage

Ion works great on Slack mobile:
```
Quick @mentions
Slash commands
Read summaries
DMs for private help
```

For detailed doc writing, use desktop + Cursor.

---

## Troubleshooting

### Ion Not Responding

**Check:**
1. Is Ion invited to the channel? `/invite @ion`
2. Did you @mention Ion or use /ion command?
3. Check #ion-status for outages

### Wrong/Irrelevant Responses

**Solutions:**
1. Set your role: `/ion set-role`
2. Be more specific in your question
3. Mention specific channels: "based on #product"
4. Provide more context

### MCP Not Working in Cursor

**Check:**
1. Is MCP configured in `~/.cursor/mcp.json`?
2. Did you restart Cursor after setup?
3. Is the database running?
4. Check Cursor's MCP status panel

### Privacy Concerns

**To limit Ion's access:**
```
/ion show-indexed-channels    → See what Ion can see
/ion forget-channel #private  → Stop indexing a channel
/kick @ion                    → Remove from channel
```

---

## FAQ

**Q: Does Ion read my DMs?**
A: No. Ion only sees messages in channels it's invited to and DMs sent directly to it.

**Q: Can I delete my data?**
A: Yes. `/ion delete-my-data` removes all your messages and interactions.

**Q: How much does Ion cost?**
A: $50/user/month, 5 user minimum. Includes both Slack and MCP access.

**Q: Does Ion work offline?**
A: No. Ion requires internet to access OpenAI and your Slack workspace.

**Q: Can Ion access our codebase?**
A: Via MCP, Ion can reference code you show it in Cursor, but it doesn't automatically index your repos.

**Q: What happens to deleted Slack messages?**
A: Ion respects Slack deletions and removes them from its index within 24 hours.

**Q: Can I use Ion in multiple workspaces?**
A: Yes. Each workspace is a separate installation with its own context.

**Q: Does Ion support languages other than English?**
A: Currently English only. Multilingual support is on the roadmap.

---

## Getting Help

**In Slack:**
```
/ion help              → Command reference
@ion how do I...       → Ask Ion directly
```

**Documentation:**
- README.md - Technical setup
- QUICKSTART.md - Fast installation
- MCP README - Cursor integration

**Support:**
- Email: support@ion.app
- Slack: #ion-support (for customers)
- Twitter: @ionapp

---

## Best Practices Summary

✅ **Do:**
- Set your role for personalized responses
- Invite Ion to relevant work channels
- Use threads to maintain context
- Be specific in your questions
- Use Cursor MCP for deep work
- Review weekly summaries

❌ **Don't:**
- Invite Ion to private/sensitive channels
- Use vague language in important decisions
- Expect Ion to read DMs between other users
- Ask the same question in multiple channels
- Forget to set your role

---

**Remember:** Ion gets smarter the more your team uses it. The more conversations it learns from, the better its responses become.

**Start simple:** @ion hello
