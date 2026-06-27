const fs = require('fs');
const path = require('path');

const TASKS_FILE = path.join(__dirname, 'tasks.json');

function loadTasks() {
  if (!fs.existsSync(TASKS_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(TASKS_FILE, 'utf8'));
  } catch {
    return [];
  }
}

function saveTasks(tasks) {
  fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2));
}

function addTask(text, priority = 'MEDIUM') {
  const tasks = loadTasks();
  tasks.push({
    id: Date.now(),
    text,
    priority,
    createdAt: new Date().toISOString(),
    done: false
  });
  saveTasks(tasks);
}

function clearDoneTasks() {
  const tasks = loadTasks().filter(t => !t.done);
  saveTasks(tasks);
}

function getTasksSortedByPriority() {
  const order = { HIGH: 0, MEDIUM: 1, LOW: 2 };
  return loadTasks()
    .filter(t => !t.done)
    .sort((a, b) => (order[a.priority] ?? 1) - (order[b.priority] ?? 1));
}

function deleteTaskByIndex(index) {
  const sorted = getTasksSortedByPriority();
  const target = sorted[index];
  if (!target) return null;
  const tasks = loadTasks().filter(t => t.id !== target.id);
  saveTasks(tasks);
  return target;
}

function deleteAllTasks() {
  saveTasks([]);
}

function changeTaskPriority(index, newPriority) {
  const sorted = getTasksSortedByPriority();
  const target = sorted[index];
  if (!target) return null;
  const tasks = loadTasks().map(t =>
    t.id === target.id ? { ...t, priority: newPriority } : t
  );
  saveTasks(tasks);
  return { ...target, priority: newPriority };
}

module.exports = {
  addTask,
  getTasksSortedByPriority,
  clearDoneTasks,
  loadTasks,
  deleteTaskByIndex,
  deleteAllTasks,
  changeTaskPriority
};
