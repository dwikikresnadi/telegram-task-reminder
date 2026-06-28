# Simple Daily Task Reminder

A lightweight macOS automation that turns your Telegram messages into a daily task reminder popup. Send tasks to yourself on Telegram, get a sorted morning popup on your Mac every day.

---

## How It Works

1. Send a command to your Telegram bot from your phone
2. The bot saves it to your task list
3. Every morning after 8 AM, a popup appears on your Mac with all your tasks sorted by priority
4. Click OK to dismiss — it won't show again until the next day

---

## Features

- 🔴 🟡 🟢 Priority levels — HIGH, MEDIUM, LOW
- 📬 Catches up missed commands automatically when your Mac wakes or restarts
- ☀️ Morning popup stays open until you click OK
- 🔒 Only responds to your Telegram account — no one else can use your bot
- ⚙️ Runs silently in the background via macOS launchd — no terminal needed after setup

---

## Requirements

- macOS
- Node.js (v18 or later)
- A Telegram account
- A Telegram bot token from [@BotFather](https://t.me/BotFather)

---

## Setup

### 1. Clone the repo

```bash
git clone https://github.com/dwikikresnadi/telegram-task-reminder
cd telegram-task-reminder
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create your config

```bash
cp config.example.json config.json
```

Edit `config.json` and fill in your values:

```json
{
  "token": "YOUR_TELEGRAM_BOT_TOKEN",
  "ownerId": YOUR_TELEGRAM_USER_ID
}
```

- **token** — get this from [@BotFather](https://t.me/BotFather) on Telegram (`/newbot`)
- **ownerId** — your personal Telegram user ID, get it from [@userinfobot](https://t.me/userinfobot)

### 4. Install the background agents

```bash
cp com.user.wamacreminder.*.plist ~/Library/LaunchAgents/
launchctl load ~/Library/LaunchAgents/com.user.wamacreminder.listener.plist
launchctl load ~/Library/LaunchAgents/com.user.wamacreminder.popup.plist
```

That's it — the bot runs automatically in the background from now on.

---

## Telegram Commands

| Command | Action |
|---|---|
| `HIGH: task` | Add a high priority task |
| `MEDIUM: task` | Add a medium priority task |
| `LOW: task` | Add a low priority task |
| `LIST` | Show all tasks sorted by priority |
| `DELETE 2` | Delete task #2 |
| `DELETE ALL` | Clear all tasks |
| `PRIORITY 2 HIGH` | Change task #2 to HIGH priority |
| `HELP` | Show commands in Telegram |

---

## Managing the Bot

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

---

## Notes

- The bot only works while your Mac is on or awake
- If your Mac was off or sleeping, any commands you sent from your phone are processed automatically when it comes back online
- `config.json` is excluded from Git, do on your own.
