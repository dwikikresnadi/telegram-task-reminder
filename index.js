const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');

const { token, ownerId } = require('./config.json');
const {
  addTask,
  getTasksSortedByPriority,
  deleteTaskByIndex,
  deleteAllTasks,
  changeTaskPriority
} = require('./taskStore');

const ICONS = { HIGH: '🔴', MEDIUM: '🟡', LOW: '🟢' };
const VALID_PRIORITIES = ['HIGH', 'MEDIUM', 'LOW'];
const COMMAND_PATTERN = /^(HIGH:|MEDIUM:|LOW:|LIST|HELP|DELETE|PRIORITY)\s*/i;

const bot = new TelegramBot(token, { polling: true });

function esc(text) {
  return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function buildTaskList() {
  const tasks = getTasksSortedByPriority();
  if (tasks.length === 0) return '✅ No pending tasks!';
  return tasks
    .map((t, i) => `${i + 1}. ${ICONS[t.priority] || '🟡'} [${t.priority}] ${esc(t.text)}`)
    .join('\n');
}

function helpText() {
  return (
    '📖 <b>Commands:</b>\n\n' +
    '• <code>LIST</code> — show all tasks\n' +
    '• <code>HIGH: task</code> / <code>MEDIUM: task</code> / <code>LOW: task</code> — add task\n' +
    '• <code>DELETE 2</code> — delete task #2\n' +
    '• <code>DELETE ALL</code> — clear all tasks\n' +
    '• <code>PRIORITY 2 HIGH</code> — change task #2 priority\n' +
    '• <code>HELP</code> — show this message'
  );
}

async function processMessage(chatId, text) {
  if (!text || !COMMAND_PATTERN.test(text.trim())) return;

  const upper = text.trim().toUpperCase();

  if (upper === 'LIST') {
    await bot.sendMessage(chatId, buildTaskList());
    return;
  }

  if (upper === 'HELP') {
    await bot.sendMessage(chatId, helpText(), { parse_mode: 'HTML' });
    return;
  }

  if (upper === 'DELETE ALL') {
    deleteAllTasks();
    await bot.sendMessage(chatId, '🗑️ All tasks deleted.');
    return;
  }

  const deleteMatch = upper.match(/^DELETE\s+(\d+)$/);
  if (deleteMatch) {
    const index = parseInt(deleteMatch[1], 10) - 1;
    const deleted = deleteTaskByIndex(index);
    await bot.sendMessage(chatId, deleted
      ? `🗑️ Deleted: "${deleted.text}"`
      : '❌ Task number not found. Send LIST to see current tasks.'
    );
    return;
  }

  const priorityMatch = upper.match(/^PRIORITY\s+(\d+)\s+(HIGH|MEDIUM|LOW)$/);
  if (priorityMatch) {
    const index = parseInt(priorityMatch[1], 10) - 1;
    const newPriority = priorityMatch[2];
    const updated = changeTaskPriority(index, newPriority);
    await bot.sendMessage(chatId, updated
      ? `✏️ Updated to [${newPriority}]: "${updated.text}"`
      : '❌ Task number not found. Send LIST to see current tasks.'
    );
    return;
  }

  // ADD TASK
  let priority = 'MEDIUM';
  let taskText = text.trim();
  for (const p of VALID_PRIORITIES) {
    if (upper.startsWith(`${p}:`)) {
      priority = p;
      taskText = text.trim().slice(p.length + 1).trim();
      break;
    }
  }

  addTask(taskText, priority);
  console.log(`[${priority}] Saved: "${taskText}"`);
  await bot.sendMessage(chatId, `✅ Saved [${priority}]: ${taskText}`);
}

bot.on('message', async (msg) => {
  if (msg.from.id !== ownerId) return;
  const text = msg.text || '';
  try {
    await processMessage(msg.chat.id, text);
  } catch (err) {
    console.error('Error:', err.message);
  }
});

bot.on('polling_error', (err) => {
  console.error('Polling error:', err.message);
});

console.log('🤖 TaskBot is running on Telegram...');
