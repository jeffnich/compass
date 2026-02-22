# How to Add/Edit Commands

**Super simple!** Just edit one JSON file.

---

## File Location

```
config/commands.json
```

---

## Add a New Command

### 1. Edit the JSON file

```bash
nano config/commands.json
```

### 2. Add your command

```json
{
  "existing-command": { ... },
  
  "your-command": {
    "description": "What your command does",
    "usage_hint": "[optional args]",
    "model": "openai",
    "prompt": "Your prompt here. Use {input} for user's text.",
    "enabled": true
  }
}
```

### 3. Add to Slack manifest

Edit `slack-app-manifest.yaml`:

```yaml
slash_commands:
  - command: /your-command
    description: What your command does
    usage_hint: "[optional args]"
    should_escape: false
```

### 4. Update Slack app

1. Go to https://api.slack.com/apps
2. Select Ion app
3. App Manifest → paste updated YAML
4. Save changes

### 5. Test

The bot auto-reloads the config - **no restart needed!**

```
/your-command test input
```

---

## Edit Existing Command

### Change the Prompt

```bash
nano config/commands.json
```

Find your command and edit the `prompt` field:

```json
{
  "prd": {
    "prompt": "Your new improved prompt here. {input} gets replaced with user text."
  }
}
```

**Save the file** - changes take effect immediately (no restart)!

### Change the Model

```json
{
  "prd": {
    "model": "anthropic"  // or "openai"
  }
}
```

### Disable a Command

```json
{
  "old-command": {
    "enabled": false
  }
}
```

---

## Complete Example

Let's add `/user-story` command:

### 1. Edit `config/commands.json`

```json
{
  "prd": { ... },
  "summarize": { ... },
  
  "user-story": {
    "description": "Generate user story from feature description",
    "usage_hint": "[feature description]",
    "model": "anthropic",
    "prompt": "Generate a user story for: {input}\n\nFormat:\nAs a [role], I want [goal], so that [benefit].\n\nAcceptance Criteria:\n- [criterion 1]\n- [criterion 2]\n- [criterion 3]",
    "enabled": true
  }
}
```

### 2. Edit `slack-app-manifest.yaml`

```yaml
slash_commands:
  - command: /user-story
    description: Generate user story from feature description
    usage_hint: "[feature description]"
    should_escape: false
```

### 3. Update Slack app

- Go to https://api.slack.com/apps
- Select Ion → App Manifest
- Paste updated YAML → Save

### 4. Test in Slack

```
/user-story password reset feature
```

**Done!** No code changes, no bot restart.

---

## Field Reference

```json
{
  "command-name": {
    "description": "Required - Shows in Slack command list",
    "usage_hint": "Optional - Example args shown to users",
    "model": "Required - 'openai' or 'anthropic'",
    "prompt": "Required - Use {input} for user's text",
    "enabled": "Optional - false to disable, default true"
  }
}
```

### Prompt Placeholders

- `{input}` - Replaced with user's input text
- `{user}` - (Future) User ID
- `{channel}` - (Future) Channel name

---

## Available Models

### `"openai"`
- Model: GPT-4
- Speed: Fast (2-3 seconds)
- Cost: $30-60 per 1M tokens
- Best for: Quick tasks, summaries

### `"anthropic"` or `"claude"`
- Model: Claude 3.5 Sonnet
- Speed: Medium (3-4 seconds)  
- Cost: $3-15 per 1M tokens (10x cheaper!)
- Best for: Long documents, technical specs

---

## Tips

### Good Prompts

✅ **Be specific:**
```json
"prompt": "Generate a detailed PRD for: {input}\n\nInclude: Overview, Goals, Requirements, Success Metrics."
```

❌ **Too vague:**
```json
"prompt": "Help with {input}"
```

### Use {input}

✅ **Correct:**
```json
"prompt": "Analyze this feature: {input}"
```

❌ **Won't work:**
```json
"prompt": "Analyze this feature"  // Where does user input go?
```

### Choose Right Model

- Long documents → `"anthropic"` (cheaper + better)
- Quick tasks → `"openai"` (faster)

---

## Hot Reload

The bot automatically reloads `commands.json` when you save it!

**No restart needed** for:
- ✅ Changing prompts
- ✅ Changing models
- ✅ Enabling/disabling commands

**Restart needed** for:
- ❌ Adding NEW commands to Slack (need manifest update)
- ❌ Changing command descriptions (need manifest update)

---

## Validate Config

Check if your JSON is valid:

```bash
cd ~/.openclaw/workspace/ion-slack-bot
node -e "console.log(require('./config/loader').validateConfig())"
```

Returns empty array `[]` if valid, or list of errors.

---

## Common Mistakes

### Invalid JSON

❌ **Wrong:**
```json
{
  "command": {
    "model": "openai",  // Extra comma on last item
  }
}
```

✅ **Right:**
```json
{
  "command": {
    "model": "openai"
  }
}
```

### Missing {input}

❌ **Wrong:**
```json
{
  "prompt": "Generate a PRD"  // Where does user input go?
}
```

✅ **Right:**
```json
{
  "prompt": "Generate a PRD for: {input}"
}
```

### Invalid Model

❌ **Wrong:**
```json
{
  "model": "gpt4"  // Not recognized
}
```

✅ **Right:**
```json
{
  "model": "openai"  // or "anthropic"
}
```

---

## Quick Reference

### Add Command

1. Edit `config/commands.json`
2. Edit `slack-app-manifest.yaml`
3. Update Slack app
4. Test!

### Edit Prompt/Model

1. Edit `config/commands.json`
2. Save
3. Test! (changes apply immediately)

### Disable Command

```json
{ "enabled": false }
```

---

## Example Commands

### Technical Spec

```json
{
  "tech-spec": {
    "description": "Generate technical specification",
    "usage_hint": "[feature or component]",
    "model": "anthropic",
    "prompt": "Generate a detailed technical specification for: {input}\n\nInclude:\n- Architecture\n- Data models\n- API contracts\n- Security considerations\n- Performance requirements",
    "enabled": true
  }
}
```

### Meeting Notes

```json
{
  "meeting-notes": {
    "description": "Generate structured meeting notes",
    "model": "openai",
    "prompt": "Generate structured meeting notes from this discussion.\n\nFormat:\n**Attendees:**\n- ...\n\n**Topics:**\n- ...\n\n**Decisions:**\n- ...\n\n**Action Items:**\n- ...",
    "enabled": true
  }
}
```

### Code Review

```json
{
  "code-review": {
    "description": "Review code with best practices",
    "usage_hint": "[code or description]",
    "model": "anthropic",
    "prompt": "Review this code: {input}\n\nCheck for:\n- Best practices\n- Security issues\n- Performance problems\n- Code smells\n- Suggestions for improvement",
    "enabled": true
  }
}
```

---

## That's It!

Edit one JSON file, update Slack manifest, done!

No code changes. No complex deployments. Just edit and test.

---

**Last Updated:** Feb 22, 2026
