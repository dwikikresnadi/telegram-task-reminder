#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const DIR = __dirname;
const TASKS_FILE = path.join(DIR, 'tasks.json');
const SHOWN_FILE = path.join(DIR, '.popup_last_shown');

// Only run at or after 8:00 AM
const now = new Date();
if (now.getHours() < 8) process.exit(0);

// Only show once per day
const today = now.toISOString().slice(0, 10);
try {
  if (fs.readFileSync(SHOWN_FILE, 'utf8').trim() === today) process.exit(0);
} catch {}

// Build task list
let taskList;
try {
  const tasks = JSON.parse(fs.readFileSync(TASKS_FILE, 'utf8'));
  const active = tasks.filter(t => !t.done);
  const high   = active.filter(t => t.priority === 'HIGH').map(t => `🔴 HIGH: ${t.text}`);
  const medium = active.filter(t => t.priority === 'MEDIUM').map(t => `🟡 MEDIUM: ${t.text}`);
  const low    = active.filter(t => t.priority === 'LOW').map(t => `🟢 LOW: ${t.text}`);
  const all = [...high, ...medium, ...low];
  taskList = all.length ? all.join('\n') : 'All tasks done! 🎉';
} catch {
  taskList = 'No tasks yet! Add via WhatsApp. 🎉';
}

const commands =
  '💬 WhatsApp Commands:\n' +
  '• LIST — show all tasks\n' +
  '• HIGH/MEDIUM/LOW: task — add task\n' +
  '• DELETE 2 — delete task #2\n' +
  '• DELETE ALL — clear all tasks\n' +
  '• PRIORITY 2 HIGH — change priority\n' +
  '• HELP — show commands';

const message = `Good morning! Here are your tasks:\n\n${taskList}\n\n─────────────────\n${commands}`;

// Build AppleScript with newlines as `& return &` and quotes escaped — preserves emoji correctly
function toAppleScriptStr(str) {
  return str
    .split('\n')
    .map(line => '"' + line.replace(/\\/g, '\\\\').replace(/"/g, '" & quote & "') + '"')
    .join(' & return & ');
}

const script = `display dialog ${toAppleScriptStr(message)} with title "Daily Task Reminder" buttons {"OK"} default button "OK"`;
const tmpScript = path.join(DIR, '.popup_tmp.applescript');

try {
  fs.writeFileSync(tmpScript, script, 'utf8');
  execSync(`osascript "${tmpScript}"`);
  fs.writeFileSync(SHOWN_FILE, today);
} catch {
  // User dismissed or osascript error — don't mark shown, will retry in 5 min
} finally {
  try { fs.unlinkSync(tmpScript); } catch {}
}
