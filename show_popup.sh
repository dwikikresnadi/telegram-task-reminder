#!/bin/bash

TASKS_FILE="$(dirname "$0")/tasks.json"
SHOWN_FILE="$(dirname "$0")/.popup_last_shown"

# Only run at or after 8:00 AM
CURRENT_HOUR=$(date +%H)
CURRENT_MIN=$(date +%M)
CURRENT_TIME=$((10#$CURRENT_HOUR * 60 + 10#$CURRENT_MIN))
TRIGGER_TIME=$((8 * 60))

if [ "$CURRENT_TIME" -lt "$TRIGGER_TIME" ]; then
  exit 0
fi

# Only show once per day
TODAY=$(date +%Y-%m-%d)
if [ -f "$SHOWN_FILE" ] && [ "$(cat "$SHOWN_FILE")" = "$TODAY" ]; then
  exit 0
fi

# Build task list
if [ ! -f "$TASKS_FILE" ]; then
  TASK_LIST="No tasks yet! Add via WhatsApp. 🎉"
else
  HIGH=$(python3 -c "
import json
tasks = json.load(open('$TASKS_FILE'))
items = [t for t in tasks if not t.get('done') and t.get('priority') == 'HIGH']
for t in items: print('🔴 HIGH: ' + t['text'])
" 2>/dev/null)

  MEDIUM=$(python3 -c "
import json
tasks = json.load(open('$TASKS_FILE'))
items = [t for t in tasks if not t.get('done') and t.get('priority') == 'MEDIUM']
for t in items: print('🟡 MEDIUM: ' + t['text'])
" 2>/dev/null)

  LOW=$(python3 -c "
import json
tasks = json.load(open('$TASKS_FILE'))
items = [t for t in tasks if not t.get('done') and t.get('priority') == 'LOW']
for t in items: print('🟢 LOW: ' + t['text'])
" 2>/dev/null)

  TASK_LIST=""
  [ -n "$HIGH" ]   && TASK_LIST="$HIGH"
  [ -n "$MEDIUM" ] && TASK_LIST="$TASK_LIST
$MEDIUM"
  [ -n "$LOW" ]    && TASK_LIST="$TASK_LIST
$LOW"
  TASK_LIST=$(echo "$TASK_LIST" | sed '/^$/d')

  [ -z "$TASK_LIST" ] && TASK_LIST="All tasks done! 🎉"
fi

COMMANDS="💬 WhatsApp Commands:
• LIST — show all tasks
• HIGH/MEDIUM/LOW: task — add task
• DELETE 2 — delete task #2
• DELETE ALL — clear all tasks
• PRIORITY 2 HIGH — change priority
• HELP — show commands"

# Show popup — stays open until user clicks OK
osascript -e "display dialog \"Good morning! Here are your tasks:\n\n$TASK_LIST\n\n─────────────────\n$COMMANDS\" with title \"Daily Task Reminder\" buttons {\"OK\"} default button \"OK\""

# Mark today as shown only AFTER user clicks OK
echo "$TODAY" > "$SHOWN_FILE"
