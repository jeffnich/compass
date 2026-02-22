# Add /ion Command to Slack

The `/ion` meta-command has been built, but you need to register it in Slack.

## Quick Setup (2 minutes)

1. **Go to Slack API Apps**  
   https://api.slack.com/apps

2. **Select Ion App**  
   Click on your Ion app from the list

3. **Go to Slash Commands**  
   Left sidebar → Features → Slash Commands

4. **Click "Create New Command"**

5. **Fill in the form:**
   - **Command:** `/ion`
   - **Request URL:** (leave blank - Socket Mode handles it)
   - **Short Description:** `Run Ion commands dynamically`
   - **Usage Hint:** `[command] [args]`

6. **Save**

7. **Reinstall App**  
   Slack will prompt you to reinstall — click "Reinstall App"

8. **Done!**

## Test It

In Slack:

```
/ion
```

You should see a list of available commands.

```
/ion fe-doc authentication flow
```

This will run your new `fe-doc` command!

---

## How It Works

**Before:**
- Each command needed manual Slack registration
- Limited to 50 slash commands
- Admin UI changes didn't work immediately

**Now:**
- `/ion [command]` routes to any command in config
- Unlimited commands (via admin UI)
- Works immediately after saving

**Hybrid Model:**
- Keep `/prd`, `/summarize`, etc. as native (better UX)
- Route everything else through `/ion`
- Best of both worlds

---

## Examples

```bash
# Native commands (still work)
/prd mobile app redesign
/summarize

# Meta-command (works for ANY command)
/ion fe-doc authentication flow
/ion prd mobile app redesign
/ion user-story shopping cart
```

Both work! Native commands have better auto-complete, but `/ion` gives unlimited extensibility.

---

## Next Steps

After adding `/ion` to Slack:

1. Test it: `/ion`
2. Try your new command: `/ion fe-doc [topic]`
3. Add more commands via admin UI
4. They'll work immediately via `/ion`

No more Slack manifest updates needed! 🚀
