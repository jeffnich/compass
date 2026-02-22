# Adding New Slash Commands to Ion

This guide shows you how to add new slash commands to your Ion Slack bot.

---

## Overview

Adding a new command requires 3 steps:
1. **Register with Slack** - Add to the app manifest
2. **Add the prompt** - Define what the command does
3. **Add the handler** - Write the command logic

Total time: ~5 minutes per command

---

## Step 1: Register with Slack

### Edit the Slack App Manifest

**File:** `slack-app-manifest.yaml`

Add your new command to the `slash_commands` section:

```yaml
slash_commands:
  - command: /ion-help
    description: Show Ion help and available commands
    should_escape: false
  - command: /prd
    description: Generate Product Requirements Document
    usage_hint: "[feature description]"
    should_escape: false
  # ... existing commands ...
  
  # ADD YOUR NEW COMMAND HERE:
  - command: /user-story
    description: Generate user story from feature description
    usage_hint: "[feature description]"
    should_escape: false
```

### Update Slack App Settings

1. Go to https://api.slack.com/apps
2. Select your Ion app
3. Go to "App Manifest"
4. Paste the updated YAML
5. Click "Save Changes"

**Note:** Slack will validate the manifest. Fix any errors before proceeding.

---

## Step 2: Add the Prompt

### Edit OpenAI Service

**File:** `services/openai.js`  
**Location:** Lines 74-79 (the `commandPrompts` object)

Add your command's prompt:

```javascript
const commandPrompts = {
  prd: `Generate a Product Requirements Document for: ${input}\n\nInclude: Overview, Goals, User Stories, Requirements, Success Metrics, Timeline.`,
  
  summarize: `Summarize the key points and decisions from this discussion.`,
  
  decisions: `Search for and list product/technical decisions related to: ${input}`,
  
  'design-review': `Provide a design review for: ${input}\n\nConsider: UX, accessibility, consistency, technical feasibility.`,
  
  'api-spec': `Generate an API specification for: ${input}\n\nInclude: endpoints, parameters, responses, auth.`,
  
  // ADD YOUR NEW COMMAND PROMPT HERE:
  'user-story': `Generate a user story for: ${input}\n\nFormat:\nAs a [role], I want [goal], so that [benefit].\n\nAcceptance Criteria:\n- [criterion 1]\n- [criterion 2]\n- [criterion 3]`,
};
```

### Prompt Tips

- Use `${input}` to include what the user typed after the command
- Be specific about format and structure
- Include examples if helpful
- Keep it concise but detailed enough for GPT-4

---

## Step 3: Add the Command Handler

### Edit Command Registry

**File:** `commands/registry.js`  
**Location:** After the existing command handlers (around line 160+)

Add the full handler:

```javascript
// /user-story - Generate user story
app.command('/user-story', async ({ command, ack, respond }) => {
  await ack();
  
  // Validate input (optional but recommended)
  if (!command.text.trim()) {
    return respond({
      text: '❓ Please describe the feature.\n\nExample: `/user-story password reset`',
      response_type: 'ephemeral',
    });
  }
  
  try {
    // Show loading message
    await respond({
      text: '⚡ Generating user story...',
      response_type: 'in_channel',
    });
    
    // Call the command handler
    const response = await handleSlashCommand('user-story', command.text, {
      channel: command.channel_id,
      user: command.user_id,
    });
    
    // Send final response
    await respond({
      text: response,
      response_type: 'in_channel',
    });
  } catch (error) {
    console.error('Error in /user-story command:', error);
    await respond({
      text: '❌ Failed to generate user story. Please try again.',
      response_type: 'ephemeral',
    });
  }
});
```

### Handler Template

Copy this template for any new command:

```javascript
app.command('/YOUR-COMMAND', async ({ command, ack, respond }) => {
  await ack();
  
  if (!command.text.trim()) {
    return respond({
      text: '❓ [YOUR VALIDATION MESSAGE]',
      response_type: 'ephemeral',
    });
  }
  
  try {
    await respond({
      text: '⚡ [YOUR LOADING MESSAGE]...',
      response_type: 'in_channel',
    });
    
    const response = await handleSlashCommand('YOUR-COMMAND', command.text, {
      channel: command.channel_id,
      user: command.user_id,
    });
    
    await respond({
      text: response,
      response_type: 'in_channel',
    });
  } catch (error) {
    console.error('Error in /YOUR-COMMAND command:', error);
    await respond({
      text: '❌ [YOUR ERROR MESSAGE]',
      response_type: 'ephemeral',
    });
  }
});
```

### Update CORE_COMMANDS Array

At the top of `registry.js`, add your command to the array:

```javascript
const CORE_COMMANDS = [
  'ion-help',
  'prd',
  'summarize',
  'decisions',
  'design-review',
  'api-spec',
  'user-story', // ADD HERE
];
```

---

## Step 4: Restart the Bot

After making all changes:

```bash
cd ~/.openclaw/workspace/ion-slack-bot
npm start
```

Watch the console output for:
```
✅ Registered 7 slash commands  # Should increment
```

---

## Testing Your New Command

1. **In Slack:** Type `/user-story password reset feature`
2. **Expected:** Bot shows loading message, then generates response
3. **Debug:** Check console logs if something fails

---

## Command Options

### response_type

- `'in_channel'` - Everyone can see the response
- `'ephemeral'` - Only the user who typed the command can see it

### When to use ephemeral

- Error messages
- Validation errors
- Help text
- Private information

### When to use in_channel

- Generated content (PRDs, user stories, etc.)
- Summaries
- Search results
- Content meant to be shared

---

## Examples of Good Commands

### Simple Command (No Input Required)

```javascript
'standup': `Generate a standup summary format with sections: Yesterday, Today, Blockers.`,
```

### Command with Context

```javascript
'meeting-notes': `Generate structured meeting notes from this conversation. Include: Attendees, Topics, Decisions, Action Items.`,
```

### Research Command

```javascript
'competitor': `Research and summarize information about: ${input}. Include: Market position, key features, strengths, weaknesses.`,
```

### Technical Command

```javascript
'test-cases': `Generate test cases for: ${input}. Include: Happy path, edge cases, error scenarios, performance tests.`,
```

---

## Troubleshooting

### Command not appearing in Slack

- Check Slack manifest was saved successfully
- Restart the bot
- Reinstall the app: OAuth & Permissions → Reinstall

### Command returns error

- Check console logs for OpenAI errors
- Verify prompt is in `commandPrompts` object
- Ensure command name matches exactly (including hyphens)

### Bot doesn't respond

- Check bot is running: `npm start`
- Verify tokens in `.env`
- Check Socket Mode is enabled in Slack app settings

### OpenAI timeout

- Reduce prompt complexity
- Add timeout handling in handler
- Check OpenAI API key is valid

---

## Best Practices

### Naming Commands

- Use lowercase
- Use hyphens for multi-word commands: `/design-review` not `/designReview`
- Be descriptive but concise: `/api-spec` not `/generateapispecification`
- Avoid generic names that might conflict with other apps

### Writing Prompts

- Be specific about format and structure
- Include examples in the prompt when helpful
- Use `${input}` to reference user's text
- Test prompts in ChatGPT first to validate output

### Error Handling

- Always validate input when required
- Provide helpful error messages
- Use try/catch blocks
- Log errors to console for debugging

### Response Formatting

- Use Slack markdown:
  - `*bold*` for emphasis
  - `` `code` `` for technical terms
  - `> quote` for quotes
  - Bullet points with `-` or `•`
- Keep responses scannable
- Break into sections with headers

---

## Advanced: Custom Logic

If you need more than just a prompt, you can add custom logic in the handler:

```javascript
app.command('/estimate', async ({ command, ack, respond, client }) => {
  await ack();
  
  try {
    // Custom logic before calling OpenAI
    const userProfile = await client.users.info({ user: command.user_id });
    const userName = userProfile.user.real_name;
    
    // Fetch team data, calculate complexity, etc.
    const complexity = calculateComplexity(command.text);
    
    // Build custom prompt
    const customPrompt = `User ${userName} requested estimate for: ${command.text}\nComplexity: ${complexity}`;
    
    const response = await handleSlashCommand('estimate', customPrompt, {
      channel: command.channel_id,
      user: command.user_id,
    });
    
    await respond({
      text: response,
      response_type: 'in_channel',
    });
  } catch (error) {
    console.error('Error:', error);
    await respond({
      text: '❌ Failed to estimate. Please try again.',
      response_type: 'ephemeral',
    });
  }
});
```

---

## Quick Reference

### Files to Edit

1. `slack-app-manifest.yaml` - Register command with Slack
2. `services/openai.js` - Add prompt (line ~74)
3. `commands/registry.js` - Add handler logic

### Restart Command

```bash
cd ~/.openclaw/workspace/ion-slack-bot && npm start
```

### Test in Slack

```
/your-command [arguments]
```

---

## Need Help?

- Check existing commands in `commands/registry.js` for examples
- Review Slack's [slash commands docs](https://api.slack.com/interactivity/slash-commands)
- Test prompts in ChatGPT before adding to Ion
- Read `USER_GUIDE.md` for usage examples

---

**Updated:** Feb 22, 2026  
**Version:** 1.0
