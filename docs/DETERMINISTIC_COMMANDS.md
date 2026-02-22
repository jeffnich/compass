# Deterministic (Non-AI) Commands

Some commands don't need AI - they can return fixed or data-driven responses.

---

## What is Deterministic?

**Deterministic = Same input → Same output (no AI)**

Examples:
- `/status` - Show bot stats
- `/channels` - List channels
- `/help` - Show help text
- `/search [query]` - Database search (no AI interpretation)

vs.

**Non-deterministic = AI-generated responses**
- `/prd` - AI generates unique PRD each time
- `/summarize` - AI interprets and summarizes

---

## How to Add Deterministic Commands

### Example 1: Simple Fixed Response

```javascript
// In commands/registry.js

app.command('/status', async ({ command, ack, respond }) => {
  await ack();
  
  // Query database for stats
  const messageCount = await query('SELECT COUNT(*) FROM messages');
  const channelCount = await query('SELECT COUNT(DISTINCT channel_id) FROM messages');
  
  await respond({
    text: `📊 *Ion Status*\n\n` +
          `Messages indexed: ${messageCount.rows[0].count}\n` +
          `Channels: ${channelCount.rows[0].count}\n` +
          `Uptime: ${process.uptime()} seconds`,
    response_type: 'ephemeral',
  });
});
```

**No AI needed!** Just database queries + formatting.

### Example 2: Database Search (No AI)

```javascript
app.command('/search', async ({ command, ack, respond }) => {
  await ack();
  
  if (!command.text.trim()) {
    return respond({
      text: 'Usage: `/search [keyword]`',
      response_type: 'ephemeral',
    });
  }
  
  // Direct database search (no embeddings, no AI)
  const results = await query(
    `SELECT text, channel_id, slack_created_at 
     FROM messages 
     WHERE text ILIKE $1 
     ORDER BY slack_created_at DESC 
     LIMIT 10`,
    [`%${command.text}%`]
  );
  
  const formatted = results.rows
    .map(r => `• ${r.text.substring(0, 100)}... (${r.slack_created_at})`)
    .join('\n');
  
  await respond({
    text: `🔍 Search results for "${command.text}":\n\n${formatted}`,
    response_type: 'in_channel',
  });
});
```

**Pure SQL search** - instant, deterministic, free!

### Example 3: List Data

```javascript
app.command('/channels', async ({ command, ack, respond }) => {
  await ack();
  
  const channels = await query(
    `SELECT channel_id, COUNT(*) as count 
     FROM messages 
     GROUP BY channel_id 
     ORDER BY count DESC`
  );
  
  const list = channels.rows
    .map(c => `• ${c.channel_id}: ${c.count} messages`)
    .join('\n');
  
  await respond({
    text: `📋 *Indexed Channels*\n\n${list}`,
    response_type: 'ephemeral',
  });
});
```

### Example 4: Template Response

```javascript
app.command('/template', async ({ command, ack, respond }) => {
  await ack();
  
  const template = `
📝 *PRD Template*

**Overview**
Brief description of the feature.

**Goals**
- Goal 1
- Goal 2

**User Stories**
- As a [user], I want [goal] so that [benefit]

**Requirements**
- Requirement 1
- Requirement 2

**Success Metrics**
- Metric 1
- Metric 2
  `;
  
  await respond({
    text: template,
    response_type: 'ephemeral',
  });
});
```

---

## Mix Deterministic + AI

You can make a command **optionally** use AI:

```javascript
app.command('/prd', async ({ command, ack, respond }) => {
  await ack();
  
  // If user types "/prd template", return template
  if (command.text.trim() === 'template') {
    return respond({
      text: PRD_TEMPLATE,  // Fixed template
      response_type: 'ephemeral',
    });
  }
  
  // Otherwise, use AI
  const response = await handleSlashCommand('prd', command.text, {
    channel: command.channel_id,
    user: command.user_id,
  });
  
  await respond({
    text: response,
    response_type: 'in_channel',
  });
});
```

**Usage:**
- `/prd template` → Instant template (no AI)
- `/prd mobile app` → AI-generated PRD

---

## Real-World Examples

### `/status` - Bot Statistics

```javascript
app.command('/status', async ({ command, ack, respond }) => {
  await ack();
  
  const stats = await query(`
    SELECT 
      (SELECT COUNT(*) FROM messages) as messages,
      (SELECT COUNT(DISTINCT channel_id) FROM messages) as channels,
      (SELECT COUNT(*) FROM users) as users,
      (SELECT COUNT(*) FROM command_usage) as commands_run
  `);
  
  const s = stats.rows[0];
  
  await respond({
    text: `📊 *Ion Status*\n\n` +
          `💬 Messages: ${s.messages}\n` +
          `📢 Channels: ${s.channels}\n` +
          `👥 Users: ${s.users}\n` +
          `⚡ Commands: ${s.commands_run}\n` +
          `🤖 Uptime: ${Math.floor(process.uptime() / 60)} minutes`,
    response_type: 'ephemeral',
  });
});
```

### `/recent` - Show Recent Messages

```javascript
app.command('/recent', async ({ command, ack, respond }) => {
  await ack();
  
  const limit = parseInt(command.text) || 10;
  
  const messages = await query(
    `SELECT text, user_id, slack_created_at 
     FROM messages 
     WHERE channel_id = $1 
     ORDER BY slack_created_at DESC 
     LIMIT $2`,
    [command.channel_id, limit]
  );
  
  const formatted = messages.rows
    .reverse()
    .map(m => `[${m.slack_created_at.toLocaleTimeString()}] ${m.user_id}: ${m.text}`)
    .join('\n');
  
  await respond({
    text: `📜 *Last ${limit} messages*\n\n${formatted}`,
    response_type: 'ephemeral',
  });
});
```

### `/count` - Count Keywords

```javascript
app.command('/count', async ({ command, ack, respond }) => {
  await ack();
  
  if (!command.text.trim()) {
    return respond({
      text: 'Usage: `/count [keyword]`',
      response_type: 'ephemeral',
    });
  }
  
  const result = await query(
    `SELECT COUNT(*) 
     FROM messages 
     WHERE text ILIKE $1 AND channel_id = $2`,
    [`%${command.text}%`, command.channel_id]
  );
  
  await respond({
    text: `📊 "${command.text}" mentioned ${result.rows[0].count} times in this channel`,
    response_type: 'ephemeral',
  });
});
```

---

## Benefits of Deterministic Commands

### 1. Instant Response

No AI = no API call = instant response (< 100ms)

### 2. Free

No OpenAI/Anthropic costs

### 3. Predictable

Same input always gives same output

### 4. Offline-Capable

Works even if AI APIs are down

### 5. Simple

Just database queries + formatting

---

## When to Use Which

### Use Deterministic When:

- ✅ Listing data (channels, users, stats)
- ✅ Searching database (keyword search)
- ✅ Showing templates/help
- ✅ Counting/aggregating
- ✅ Status/health checks

### Use AI When:

- ✅ Generating unique content (PRDs, specs)
- ✅ Summarizing (condensing information)
- ✅ Interpreting user intent
- ✅ Making recommendations
- ✅ Complex reasoning

---

## Complete Example

Let's add `/stats` command:

### 1. Add to `commands/registry.js`

```javascript
const { query } = require('../db/client');

// ... existing commands ...

// /stats - Show channel statistics
app.command('/stats', async ({ command, ack, respond }) => {
  await ack();
  
  const stats = await query(`
    SELECT 
      COUNT(*) as total_messages,
      COUNT(DISTINCT user_id) as unique_users,
      MIN(slack_created_at) as first_message,
      MAX(slack_created_at) as last_message
    FROM messages
    WHERE channel_id = $1
  `, [command.channel_id]);
  
  const s = stats.rows[0];
  const daysSince = Math.floor(
    (new Date() - new Date(s.first_message)) / (1000 * 60 * 60 * 24)
  );
  
  await respond({
    text: `📊 *Channel Statistics*\n\n` +
          `💬 Total messages: ${s.total_messages}\n` +
          `👥 Unique users: ${s.unique_users}\n` +
          `📅 First message: ${s.first_message.toLocaleDateString()}\n` +
          `⏱️ Days active: ${daysSince}\n` +
          `📈 Avg messages/day: ${Math.floor(s.total_messages / daysSince)}`,
    response_type: 'ephemeral',
  });
});
```

### 2. Add to manifest

Edit `slack-app-manifest.yaml`:

```yaml
slash_commands:
  - command: /stats
    description: Show channel statistics
    should_escape: false
```

### 3. Update Slack app

1. Go to https://api.slack.com/apps
2. Select Ion app
3. App Manifest → Paste updated YAML
4. Save changes

### 4. Restart bot

```bash
npm start
```

### 5. Test

```
/stats
```

**Result:**
```
📊 Channel Statistics

💬 Total messages: 1,234
👥 Unique users: 15
📅 First message: 2/15/2024
⏱️ Days active: 7
📈 Avg messages/day: 176
```

**Instant, free, deterministic!**

---

## Hybrid Commands

Combine deterministic + AI in one command:

```javascript
app.command('/analyze', async ({ command, ack, respond }) => {
  await ack();
  
  // Part 1: Deterministic stats
  const stats = await query(`
    SELECT COUNT(*), AVG(LENGTH(text)) as avg_length
    FROM messages 
    WHERE channel_id = $1
  `, [command.channel_id]);
  
  // Part 2: AI analysis
  await respond({
    text: '📊 Analyzing channel...',
    response_type: 'in_channel',
  });
  
  const aiAnalysis = await handleSlashCommand('summarize', '', {
    channel: command.channel_id,
    user: command.user_id,
  });
  
  // Combine both
  await respond({
    text: `📊 *Channel Analysis*\n\n` +
          `**Stats:**\n` +
          `• Messages: ${stats.rows[0].count}\n` +
          `• Avg length: ${Math.floor(stats.rows[0].avg_length)} chars\n\n` +
          `**AI Summary:**\n${aiAnalysis}`,
    response_type: 'in_channel',
  });
});
```

---

## Performance Comparison

| Command Type | Response Time | Cost | Predictable |
|-------------|---------------|------|-------------|
| Deterministic | <100ms | Free | ✅ Yes |
| AI (OpenAI) | 2-4 seconds | $0.01-0.10 | ❌ No |
| AI (Anthropic) | 3-5 seconds | $0.001-0.01 | ❌ No |

**For stats/search/lists: Always use deterministic!**

---

## Quick Reference

### Template for Deterministic Command

```javascript
app.command('/yourcommand', async ({ command, ack, respond }) => {
  await ack();
  
  // Validate input (optional)
  if (!command.text.trim()) {
    return respond({
      text: 'Usage: `/yourcommand [args]`',
      response_type: 'ephemeral',
    });
  }
  
  // Query database or compute result
  const result = await query('SELECT ...');
  
  // Format response
  const formatted = result.rows.map(...).join('\n');
  
  // Send response
  await respond({
    text: formatted,
    response_type: 'ephemeral', // or 'in_channel'
  });
});
```

---

## Summary

✅ **Deterministic commands are instant** - No AI API calls  
✅ **Free** - No token costs  
✅ **Predictable** - Same input → same output  
✅ **Simple** - Just queries + formatting  
✅ **Mix with AI** - Best of both worlds  

**Use deterministic for stats, search, and lists. Use AI for generation and reasoning.**

---

**Last Updated:** Feb 22, 2026
