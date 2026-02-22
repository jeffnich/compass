# Ion Best Practices

**Getting the most value from your AI teammate**

---

## Table of Contents

1. [Channel Management](#channel-management)
2. [Writing for Ion](#writing-for-ion)
3. [Command Usage Patterns](#command-usage-patterns)
4. [Slack vs Cursor](#slack-vs-cursor)
5. [Team Workflows](#team-workflows)
6. [Role Configuration](#role-configuration)
7. [Privacy & Security](#privacy--security)
8. [Performance Optimization](#performance-optimization)

---

## Channel Management

### Which Channels to Index

**✅ High Value - Always Index:**
- `#product` - Product strategy, roadmap, features
- `#engineering` - Technical decisions, architecture
- `#design` - Design critiques, UX decisions
- `#customer-feedback` - User insights, feature requests
- `#analytics` - Data insights, metrics
- `#decisions` - Explicit decision log (if you have one)

**⚠️ Medium Value - Consider:**
- `#marketing` - GTM strategy, campaigns
- `#sales` - Customer conversations, objections
- `#support` - Common issues, product gaps
- `#research` - User research findings

**❌ Low Value - Skip:**
- `#random` - Social chatter (noise)
- `#watercooler` - Off-topic conversations
- `#hr` - Privacy concerns
- `#finance` - Sensitive data
- `#executive` - Confidential strategy
- `#legal` - Attorney-client privilege

### Structuring Channels

**Create Decision Channels:**
```
#product-decisions
#tech-decisions
#design-decisions

Post format:
📋 Decision: [Title]
Context: [Why we're deciding]
Options: [A, B, C]
Decision: [Final choice]
Reasoning: [Why]
Owner: @person
Date: 2026-02-21
```

**Benefits:**
- Ion can quickly find decisions
- Clear historical record
- Easy to reference in PRDs/specs

### Channel Hygiene

**Use Threads:**
```
Main channel: High-level topics
└─ Threads: Detailed discussions

Example:
Main: "Planning Q2 roadmap"
└─ Thread 1: Mobile app features
  └─ Thread 2: API priorities
    └─ Thread 3: Design system updates
```

**Why:** Ion maintains better context in threads vs scattered messages.

**Archive Dead Channels:**
```
Quarterly review:
1. Find inactive channels
2. Archive if not used in 60 days
3. Keeps Ion's index relevant
```

---

## Writing for Ion

### Decision Documentation

**❌ Vague:**
```
Bob: "Let's go with option B"
Alice: "👍"
```

**✅ Clear:**
```
Bob: "Decision: We're using PostgreSQL for the mobile backend.

Reasoning:
- Better ACID compliance than MongoDB
- Team has more PostgreSQL experience
- Proven at scale (Instagram, Reddit)

Trade-offs accepted:
- Slightly slower for unstructured data
- More rigid schema

Owner: @engineering-team
Timeline: Implement by March 1"
```

**When Ion sees this:**
```
Future query: @ion what database are we using for mobile?

Ion: "Based on #engineering discussion (Feb 21):
PostgreSQL was selected for the mobile backend.
Key reasons: ACID compliance, team expertise, scalability.
Owner: @engineering-team, Timeline: March 1"
```

### Feature Discussions

**❌ Scattered:**
```
[50 messages across 3 days with no summary]
```

**✅ Structured:**
```
Start thread with:
"Feature Discussion: Bulk Actions

User need: [customer quote or data]
Use cases: [1, 2, 3]
Success criteria: [metrics]
Dependencies: [other features/teams]
Timeline: [target date]

@ion help us prioritize this"

[Discussion in thread]

End thread with:
"Summary: [decision]
Next steps: [actions]"
```

### Technical Discussions

**Include Context:**
```
❌ "Should we cache this?"

✅ "Should we cache user profiles?

Context:
- 10k requests/minute to /api/users/:id
- 95% are repeat requests
- User data changes ~1x/day
- Current p99 latency: 200ms
- Target: <50ms

Options:
1. Redis with 24hr TTL
2. In-memory LRU cache
3. CDN edge caching

@ion what's your recommendation based on our architecture?"
```

---

## Command Usage Patterns

### Product Managers

**Morning Routine:**
```
Monday 8:00 AM in #product:

@ion what were the key decisions last week?
[Review summary]

@ion what are the top customer requests?
[Use for sprint planning]

/ion roadmap
[Share with team for alignment]
```

**During Sprint Planning:**
```
/ion prioritize

[Ion suggests based on:
 - Customer impact (#customer-feedback)
 - Business goals (#product)
 - Technical effort (#engineering)
 - Design readiness (#design)]

Discuss with team
Make final call
```

**Writing PRDs:**
```
Option 1 (Slack):
/ion prd [feature name]
[Get draft in thread]
[Copy to Notion/Docs]

Option 2 (Cursor):
New file: prd-feature-name.md
Prompt: "Generate PRD for [feature] using #product and 
#customer-feedback context"
[Edit inline]
[Commit to Git]
```

### Engineers

**Starting a Task:**
```
1. Read ticket in Jira/Linear
2. In Slack: @ion what's the context for this feature?
3. Ion pulls from #product, #design, #engineering
4. Open Cursor
5. Prompt MCP: "Generate implementation plan for [feature]"
6. Code with full context
```

**Code Reviews:**
```
During PR review:

@ion what's our error handling pattern?
@ion how did we implement auth in [similar feature]?
@ion what accessibility standards apply here?

Use Ion's answers in review comments
```

**Documentation:**
```
After shipping feature:

In Cursor:
Prompt: "Generate README for [feature] based on 
implementation and #product requirements"

Result: Docs that match both code AND product intent
```

### Designers

**Design Review Process:**
```
1. Post Figma link in #design
2. /ion design-review [link]
3. Ion reviews against:
   - Accessibility standards
   - Design system patterns
   - User feedback from #customer-feedback
   - Technical constraints from #engineering
4. Iterate based on feedback
5. Final review with team
```

**Component Documentation:**
```
In Cursor:
Prompt: "Generate component spec for [component] based on 
Figma design and #design discussions"

Includes:
- Props/variants
- Accessibility requirements
- Usage examples
- Edge cases discussed in Slack
```

---

## Slack vs Cursor

### Decision Matrix

| Scenario | Use Slack | Use Cursor | Why |
|----------|-----------|------------|-----|
| Quick question | ✅ | ❌ | Faster, mobile-friendly |
| Need team input | ✅ | ❌ | Collaborative discussion |
| Generate 3-page doc | ❌ | ✅ | Better editing, version control |
| Share with team immediately | ✅ | ❌ | Results visible to all |
| Iterative editing | ❌ | ✅ | Inline editing, undo/redo |
| Mobile/commute | ✅ | ❌ | Slack mobile app |
| Writing code | ❌ | ✅ | IDE integration |
| Meeting notes | ✅ | ❌ | Quick capture in channel |
| Formal documentation | ❌ | ✅ | Structured output |

### Hybrid Workflows

**Research → Draft → Share:**
```
1. Slack: @ion research competitor pricing models
   [Get quick summary]

2. Cursor: "Generate detailed competitive analysis using 
   Ion's research and #research channel"
   [Write full doc]

3. Slack: Post link to doc in #product
   /ion summarize [doc]
   [Team sees executive summary]
```

**Discuss → Document → Decide:**
```
1. Slack thread: Team discusses options (50 messages)

2. Cursor: "Generate decision doc from #product thread 
   [link] with pros/cons"
   [Structured analysis]

3. Slack: Share doc, make final decision
   /ion extract-decision
   [Log in #decisions]
```

---

## Team Workflows

### Product Team Weekly Cadence

**Monday: Planning**
```
#product 9:00 AM

@ion summarize last week's decisions

@ion top customer requests from #customer-feedback

/ion prioritize

Sprint planning meeting uses Ion's insights
```

**Wednesday: Mid-Sprint Check**
```
#product 2:00 PM

@ion what blockers were mentioned in #engineering?

@ion status of [feature] across channels

Course-correct if needed
```

**Friday: Week Review**
```
#product 4:00 PM

/ion summarize (gets full week)

Copy to weekly email
Archive key decisions
```

### Engineering Team Rituals

**Daily Standups:**
```
#engineering async standup

Each person posts update

EOD: /ion summarize

Extract:
- Progress
- Blockers
- Help needed
```

**Sprint Retrospectives:**
```
After sprint:

/ion incident-retro [sprint]

Analyzes:
- What went well (#engineering praise)
- What didn't (blocker mentions)
- Action items (todos @mentioned)
```

**Technical Design Reviews:**
```
Post design doc in #engineering

/ion design-review-tech [link]

Ion checks against:
- Past architecture decisions
- Current tech stack
- Discussed constraints
- Performance requirements
```

### Design Team Collaboration

**Weekly Design Critiques:**
```
#design weekly crit session

Each designer shares work

/ion design-critique [figma-link]

Ion provides:
- Accessibility checklist
- Design system consistency
- User feedback relevance
- Technical feasibility
```

**Handoff Process:**
```
1. Designer: /ion design-handoff [feature]
2. Ion generates spec from #design + Figma
3. Engineering reviews
4. Questions answered in thread
5. /ion summarize → final spec
```

---

## Role Configuration

### Single Role vs Multi-Role

**Single Role (Focused):**
```
/ion set-role product-manager

Benefits:
- Cleaner command list
- More targeted responses
- Less ambiguity

Use when: You have one primary function
```

**Multi-Role (Cross-Functional):**
```
/ion set-role product-manager,product-designer

Benefits:
- Access commands from both roles
- Responses consider multiple perspectives
- Useful for small teams/startups

Use when: You wear multiple hats
```

### Role Hierarchy

**Primary Role:**
```
When you set roles, first one is primary:

/ion set-role product-manager,software-engineer

Primary: Product Manager
Secondary: Software Engineer

Effect:
- PM commands shown first
- Responses default to PM perspective
- Can still use engineering commands
```

**Change Primary:**
```
/ion set-primary-role software-engineer

Now engineering responses come first
```

### Team Role Standards

**Recommended Team Setup:**

```
Product Team:
- Product Manager → product-manager
- Product Designer → product-designer
- Product Analyst → data-analyst

Engineering Team:
- EM → engineering-manager
- Frontend → frontend-engineer
- Backend → backend-engineer
- DevOps → devops-engineer

Go-to-Market:
- Marketing → marketing-manager
- Sales → sales-leader
- CS → customer-success
```

**Why:** Consistent roles = better Ion responses across team

---

## Privacy & Security

### Data Classification

**Public in Ion:**
- Product roadmaps
- Technical architecture
- Design decisions
- Customer feedback (anonymized)
- General team discussions

**Keep Private:**
- Salary/compensation
- Performance reviews
- Legal issues
- M&A discussions
- Customer PII
- Security vulnerabilities (pre-fix)

### Channel Security Levels

**Level 1: Fully Public** (Index freely)
```
#product
#engineering
#design
#marketing
```

**Level 2: Team Only** (Index with care)
```
#customer-feedback (anonymize PII first)
#analytics (aggregate data only)
#research (remove participant names)
```

**Level 3: Restricted** (Never index)
```
#executive
#finance
#hr
#legal
#security-incidents (until resolved)
```

### Removing Data

**Remove Single Channel:**
```
/ion forget-channel #old-project

Effect:
- Stops indexing
- Deletes existing messages
- Cannot be undone
```

**Remove Your Data:**
```
/ion delete-my-data

Effect:
- Removes all your messages
- Removes your role/preferences
- Cannot be undone
- Takes 24-48 hours
```

**Company-Wide Purge:**
```
Contact support for:
- Full workspace data deletion
- Specific date range removal
- User data export (GDPR)
```

---

## Performance Optimization

### Get Faster Responses

**Be Specific:**
```
❌ Slow: @ion tell me about the mobile project
(Ion searches all channels, all time)

✅ Fast: @ion status of mobile app from #engineering this week
(Ion searches one channel, recent messages)
```

**Use Threads:**
```
❌ Slow: Asking follow-ups in main channel
(Ion re-analyzes entire channel each time)

✅ Fast: Ask follow-ups in thread
(Ion maintains thread context)
```

**Limit Scope:**
```
❌ @ion search all discussions about users

✅ @ion search #product for user authentication discussions in February
```

### Reduce Noise

**Archive Inactive Channels:**
```
Quarterly cleanup:
1. List channels by activity
2. Archive if <10 messages/month
3. Ion's index stays focused
```

**Use Topics:**
```
Set channel topics with keywords:

#product: "Product roadmap, feature specs, customer feedback"

Ion uses topics to understand channel purpose
Better search relevance
```

### MCP Performance

**Limit Context:**
```
❌ "Tell me everything about our product"
(MCP loads 1000s of messages)

✅ "Get mobile app requirements from #product this month"
(MCP loads ~100 relevant messages)
```

**Cache Frequently Used:**
```
In Cursor, save common queries:

.cursor/prompts/
  - product-context.md
  - tech-stack.md
  - design-system.md

Reference: "Use product-context.md + current #product"
```

---

## Measuring Success

### Team KPIs

**Adoption:**
```
Track weekly:
- @mentions per user
- Slash commands used
- Channels indexed
- MCP queries (Cursor)

Goal: >10 interactions/user/week
```

**Quality:**
```
Monthly survey:
1. "Ion's responses are accurate" (1-5)
2. "Ion saves me time" (1-5)
3. "I trust Ion's answers" (1-5)

Goal: Avg >4.0 on all metrics
```

**Efficiency:**
```
Measure:
- Time to find past decisions (before/after Ion)
- PRD writing time (with/without Ion)
- Questions answered in Slack (deflection rate)

Goal: 30% time savings on documentation
```

### Individual Productivity

**Track Your Usage:**
```
/ion my-stats

Shows:
- Commands used this week
- Time saved (estimated)
- Most frequent questions
- Suggested workflows
```

**Optimize Based on Patterns:**
```
If you're asking the same question repeatedly:
→ Create a cron summary
→ Pin important answers
→ Document in team wiki
```

---

## Common Mistakes

### ❌ Anti-Patterns

**1. Inviting Ion Everywhere**
```
❌ 50 channels, Ion confused by noise
✅ 10 high-signal channels, focused context
```

**2. Vague Questions**
```
❌ "@ion help"
✅ "@ion how do I generate a PRD for mobile features?"
```

**3. Ignoring Role Setup**
```
❌ No role set → generic responses
✅ Role set → personalized commands
```

**4. Not Using Threads**
```
❌ 10 follow-up questions in main channel
✅ All in one thread with maintained context
```

**5. Expecting Mind Reading**
```
❌ "@ion what should we do?"
✅ "@ion based on customer feedback, should we prioritize 
    feature A or B?"
```

**6. Using Wrong Interface**
```
❌ Generating 10-page spec in Slack
✅ Use Cursor MCP for long documents
```

**7. Never Cleaning Up**
```
❌ 2 years of messages, never archived
✅ Quarterly cleanup of old channels
```

---

## Advanced Tips

### Power User Shortcuts

**Bulk Commands:**
```
In thread with 5 design links:

/ion design-review-all

Reviews all links in thread
```

**Cross-Channel Synthesis:**
```
@ion compare mobile app status across #product, 
#engineering, and #design

Gets holistic view
```

**Time-Bound Queries:**
```
@ion decisions about authentication in Q1 2026

Filters by date automatically
```

### Custom Workflows

**Daily Digest:**
```
Set up cron:
/ion subscribe daily-digest #product

Every morning:
- Top discussions
- New decisions
- Action items
- Blockers

Delivered via DM
```

**Project Dashboards:**
```
Create channel: #project-mobile-app

Pin: /ion project-dashboard mobile-app

Updates daily with:
- Progress across channels
- Recent decisions
- Blockers
- Next milestones
```

---

## Checklist: First 30 Days

**Week 1: Setup**
- [ ] Set your role(s)
- [ ] Invite Ion to 5 core channels
- [ ] Ask 5 test questions
- [ ] Try 3 slash commands
- [ ] Set up Cursor MCP (if applicable)

**Week 2: Build Habits**
- [ ] Use Ion for 1 question daily
- [ ] Generate 1 document (PRD, spec, etc.)
- [ ] Use in 1 team meeting
- [ ] Ask 1 decision-related query
- [ ] Share Ion with 2 teammates

**Week 3: Optimize**
- [ ] Review which channels are most useful
- [ ] Archive 1 low-signal channel
- [ ] Create 1 decision-logging workflow
- [ ] Set up 1 recurring summary
- [ ] Try 1 advanced feature

**Week 4: Scale**
- [ ] Onboard 3 teammates
- [ ] Document your team's workflow
- [ ] Set up team-wide best practices
- [ ] Measure time savings
- [ ] Share success story

---

## Getting Help

**Resources:**
- USER_GUIDE.md - Full feature reference
- QUICKSTART.md - Fast installation
- MCP README - Cursor integration
- Support email: support@ion.app

**Common Issues:**
- Troubleshooting: See USER_GUIDE.md
- Feature requests: #ion-feedback
- Bug reports: support@ion.app

---

**Remember:** Ion gets smarter over time. The more your team uses it, the better it becomes. Start simple, build habits, optimize workflows.

**Your first action:** `/ion set-role` ✨
