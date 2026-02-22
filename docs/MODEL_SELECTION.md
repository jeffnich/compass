# Model Selection per Command

Ion supports multiple AI models for different commands.

---

## Supported Models

### OpenAI
- **GPT-4** - Fast, good for most tasks
- **GPT-4 Turbo** - Faster, cheaper, newer knowledge

### Anthropic  
- **Claude 3.5 Sonnet** - Longer context (200K tokens), better reasoning
- **Claude 3 Opus** - Most capable, slower, more expensive

---

## Configuration

### File: `config/models.js`

```javascript
const COMMAND_MODELS = {
  prd: 'anthropic',              // Claude for long-form docs
  summarize: 'openai',           // GPT-4 for quick summaries
  decisions: 'openai',           // GPT-4 for search
  'design-review': 'anthropic',  // Claude for detailed reviews
  'api-spec': 'anthropic',       // Claude for technical specs
  default: 'openai',             // Default for new commands
};
```

### How to Change

**Option 1: Edit config file**

```bash
nano config/models.js
# Change any command's model
# Save and restart bot
```

**Option 2: Use specific model variant**

```javascript
prd: 'anthropic:claude-3-opus-20240229',  // Use Opus instead of Sonnet
summarize: 'openai:gpt-4-turbo',          // Use Turbo instead of GPT-4
```

---

## Default Configuration

| Command | Model | Why |
|---------|-------|-----|
| `/prd` | Claude 3.5 Sonnet | Better for long-form structured documents |
| `/summarize` | GPT-4 | Fast enough for summaries |
| `/decisions` | GPT-4 | Search-based, doesn't need Claude |
| `/design-review` | Claude 3.5 Sonnet | Longer context helps with detailed reviews |
| `/api-spec` | Claude 3.5 Sonnet | Better for technical specifications |

---

## API Keys

### OpenAI (Required)

```bash
OPENAI_API_KEY=sk-...
```

Get from: https://platform.openai.com/api-keys

### Anthropic (Optional)

```bash
ANTHROPIC_API_KEY=sk-ant-...
```

Get from: https://console.anthropic.com/settings/keys

**Note:** If `ANTHROPIC_API_KEY` is not set, commands configured for Claude will fall back to GPT-4.

---

## Cost Comparison

### OpenAI GPT-4

- Input: $30 per 1M tokens
- Output: $60 per 1M tokens
- Speed: ~2-3 seconds

### Anthropic Claude 3.5 Sonnet

- Input: $3 per 1M tokens  
- Output: $15 per 1M tokens
- Speed: ~3-4 seconds

**Claude is 10x cheaper!** But GPT-4 is slightly faster.

---

## When to Use Which

### Use GPT-4 When:
- Speed matters
- Short responses (<500 words)
- Simple queries
- Cost is not a concern

### Use Claude When:
- Long documents (PRDs, specs)
- Need longer context (>8K tokens)
- Complex reasoning
- Cost matters (10x cheaper)

---

## Examples

### Current Setup (Recommended)

```javascript
{
  prd: 'anthropic',           // Long docs → Claude
  summarize: 'openai',        // Quick summary → GPT-4
  'design-review': 'anthropic', // Detailed review → Claude
  'api-spec': 'anthropic',    // Technical spec → Claude
}
```

### All OpenAI (Fastest)

```javascript
{
  prd: 'openai',
  summarize: 'openai',
  'design-review': 'openai',
  'api-spec': 'openai',
}
```

### All Claude (Cheapest)

```javascript
{
  prd: 'anthropic',
  summarize: 'anthropic',
  'design-review': 'anthropic',
  'api-spec': 'anthropic',
}
```

### Mixed (Best of Both)

```javascript
{
  prd: 'anthropic',              // Claude for quality
  summarize: 'openai',           // GPT-4 for speed  
  'design-review': 'anthropic',  // Claude for depth
  'api-spec': 'openai:gpt-4-turbo', // Fast enough
}
```

---

## Adding New Models

Want to add Gemini, Llama, or other models?

### 1. Install SDK

```bash
npm install @google/generative-ai
```

### 2. Add to `services/openai.js`

```javascript
async function generateWithGemini(messages, options = {}) {
  // Implementation here
}
```

### 3. Update router

```javascript
if (model === 'gemini') {
  return await generateWithGemini(messages);
}
```

### 4. Add to config

```javascript
const COMMAND_MODELS = {
  prd: 'gemini:gemini-pro',
  // ...
};
```

---

## Monitoring

### Check Which Models Are Used

```bash
# Logs show model for each command
tail -f ion.log | grep "model:"
```

Example output:
```
Slash command: /prd mobile app [model: anthropic]
Slash command: /summarize [model: openai]
```

### Cost Tracking

Add to `db/command_usage` table:
- Track which model was used
- Calculate cost per command
- Analyze model performance

---

## Testing

### Test Different Models

```javascript
// In handlers/commands.js
await handleSlashCommand('prd', 'test feature', context, 'openai');
await handleSlashCommand('prd', 'test feature', context, 'anthropic');
```

Compare:
- Response quality
- Speed
- Cost

### A/B Testing

Run the same command with both models and compare results.

---

## Troubleshooting

### "Anthropic API error"

**Check:**
1. API key set: `echo $ANTHROPIC_API_KEY`
2. Key valid: https://console.anthropic.com/settings/keys
3. Credits available: Check billing

**Fix:** Add API key to `.env`:
```bash
ANTHROPIC_API_KEY=sk-ant-...
```

### Fallback to OpenAI

If Anthropic key missing, Ion automatically falls back to GPT-4.

Check logs:
```
⚠ ANTHROPIC_API_KEY not set, using OpenAI for all commands
```

---

## Best Practices

### 1. Match Model to Task

- Short queries → GPT-4 (speed)
- Long documents → Claude (quality + cost)

### 2. Start with Defaults

The default config is optimized. Only change if you have specific needs.

### 3. Monitor Costs

Track usage:
```sql
SELECT 
  command_name,
  COUNT(*),
  -- Add cost calculation based on model used
FROM command_usage
GROUP BY command_name;
```

### 4. Update Gradually

Change one command at a time and test before rolling out.

---

## Future Enhancements

### Coming Soon

- [ ] Per-user model preferences
- [ ] Model performance metrics
- [ ] Automatic model selection based on task
- [ ] Cost analytics dashboard
- [ ] Model response caching

---

## Quick Reference

### Change Model for Command

```bash
# 1. Edit config
nano config/models.js

# 2. Change model
prd: 'anthropic',  # or 'openai'

# 3. Restart bot
npm start
```

### Add API Key

```bash
# 1. Edit .env
nano .env

# 2. Add key
ANTHROPIC_API_KEY=sk-ant-...

# 3. Restart bot
npm start
```

### Test Model

In Slack:
```
/prd test feature
# Check logs to see which model was used
```

---

**Last Updated:** Feb 22, 2026  
**Version:** 1.0.0
