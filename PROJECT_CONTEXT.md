# Trial Project Task Reminder — Project Context

## What This Is
A local macOS automation system that turns WhatsApp self-messages into a daily task reminder.
Built in Claude Code CLI session on 2026-06-27.

## Project Location
`~/Documents/Trial Project Task Reminder/`

## File Structure
```
├── index.js                                — WhatsApp listener + command handler
├── taskStore.js                            — JSON task storage (read/write/delete/priority)
├── tasks.json                              — live task data (auto-generated)
├── show_popup.sh                           — original bash popup (replaced, kept for reference)
├── show_popup.js                           — morning popup script (Node.js, replaces bash version)
├── package.json                            — npm config (whatsapp-web.js, qrcode-terminal)
├── com.user.wamacreminder.listener.plist   — launchd: keeps listener alive on login
├── com.user.wamacreminder.popup.plist      — launchd: runs popup check every 5 min
├── .last_seen_timestamp                    — tracks last processed message (catch-up)
├── .popup_last_shown                       — tracks if today's popup already fired
└── PROJECT_CONTEXT.md                      — this file
```

## How It Works
1. User sends self-message on WhatsApp with a command format
2. `index.js` (running via launchd) picks it up and processes it
3. Tasks saved to `tasks.json`
4. Every 5 min, launchd runs `show_popup.js` — shows macOS popup after 8 AM if not shown today
5. Popup stays open until user clicks OK, then marks today as done

## WhatsApp Commands
| Command | Action |
|---|---|
| `HIGH: task` / `MEDIUM: task` / `LOW: task` | Add task |
| `LIST` | Show all tasks sorted by priority |
| `DELETE 2` | Delete task #2 |
| `DELETE ALL` | Clear all tasks |
| `PRIORITY 2 HIGH` | Change task #2 priority |
| `HELP` | Show commands in WhatsApp |

## Bot Reply Format
All replies come formatted as:
```
🤖 *TaskBot*
──────────────
[reply content]
```

## launchd Agents
Both installed at `~/Library/LaunchAgents/`
- **Listener**: runs `node index.js` on login, auto-restarts if crashed
- **Popup**: runs `show_popup.js` every 5 minutes, script self-checks if past 8 AM and not shown today

## launchd Commands
```bash
# Check status
launchctl list | grep wamacreminder

# Stop
launchctl unload ~/Library/LaunchAgents/com.user.wamacreminder.listener.plist
launchctl unload ~/Library/LaunchAgents/com.user.wamacreminder.popup.plist

# Start
launchctl load ~/Library/LaunchAgents/com.user.wamacreminder.listener.plist
launchctl load ~/Library/LaunchAgents/com.user.wamacreminder.popup.plist
```

## Key Behaviors
- **Mac asleep at 8 AM**: popup fires within 5 min of wake-up
- **Mac fully off**: on restart, listener catches up missed commands from last 50 self-messages (silent, no reply spam)
- **Junk messages filtered**: only valid commands are processed, random self-messages ignored
- **Session persistence**: Telegram polling handles reconnection automatically — no token re-entry needed

## Git Setup
All code is in Git. Sensitive data is excluded via `.gitignore`.

**For anyone cloning this repo — setup steps:**
```bash
git clone <repo-url>
cd "Trial Project Task Reminder"

# 1. Install dependencies
npm install

# 2. Create your config (never committed to Git)
cp config.example.json config.json
# Edit config.json and fill in:
#   "token"   → your Telegram bot token from @BotFather
#   "ownerId" → your Telegram user ID from @userinfobot

# 3. Install launchd agents (macOS only)
cp com.user.wamacreminder.*.plist ~/Library/LaunchAgents/
launchctl load ~/Library/LaunchAgents/com.user.wamacreminder.listener.plist
launchctl load ~/Library/LaunchAgents/com.user.wamacreminder.popup.plist
```

**Files excluded from Git (`.gitignore`):**
- `config.json` — your bot token and user ID
- `node_modules/` — restored via `npm install`
- `tasks.json` — your live task data
- `*.log`, `.popup_last_shown`, `.last_seen_timestamp` — runtime state

## Revision Log
| Date | Change |
|---|---|
| 2026-06-27 | Initial build — WhatsApp listener, taskStore, bash popup, launchd agents |
| 2026-06-27 | Popup rewritten from bash to Node.js (`show_popup.js`) — bash blocked by macOS TCC in ~/Documents |
| 2026-06-27 | `index.js` — Chrome SingletonLock cleanup on startup to prevent crash-loop on restart |
| 2026-06-27 | Popup emoji fix — switched from env var to temp `.applescript` file to preserve UTF-8 encoding |
| 2026-06-27 | Sleep/wake fix — `disconnected` handler now calls `client.destroy()` + `process.exit(1)` so launchd restarts cleanly; Chrome processes killed on startup (`pkill`) not just lock files; `protocolTimeout` raised to 120s; `unhandledRejection` handler added to catch ProtocolError timeouts |
| 2026-06-27 | Migrated from WhatsApp to Telegram — replaced whatsapp-web.js + Puppeteer/Chrome with node-telegram-bot-api; bot replies now appear as incoming messages (left bubble); no Chrome, no QR scan |
| 2026-06-27 | Pushed to GitHub — https://github.com/dwikikresnadi/telegram-task-reminder; config.json excluded via .gitignore; config.example.json + README.md added |

## !! HIGH MATTERS — Update This Section in Future Convos !!
- Project is now Telegram-based — WhatsApp/Chrome code is gone
- Repo: https://github.com/dwikikresnadi/telegram-task-reminder
- `config.json` is NEVER committed — token + ownerId stay local only
- Popup is `show_popup.js` (Node.js) — do NOT revert to bash version
- **Rule:** Every revision, feature, or bug fix must be logged in the Revision Log above AND updated in Claude memory (`project_whatsapp_reminder.md`)
