const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

const dataFilePath = 'tasks.json';

// Функция для чтения задач из файла
const readTasksFromFile = () => {
  try {
    const data = fs.readFileSync(dataFilePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading tasks from file:', err);
    return [];
  }
};

// Функция для записи задач в файл
const writeTasksToFile = (tasks) => {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(tasks, null, 2));
    console.log('Tasks written to file successfully.');
  } catch (err) {
    console.error('Error writing tasks to file:', err);
  }
};

let tasks = readTasksFromFile();

// Маршрут для получения всех задач
app.get('/tasks', (req, res) => {
  res.json(tasks);
});

// Маршрут для добавления новой задачи
app.post('/tasks', (req, res) => {
  const newTask = req.body;
  newTask.id = "task-" + Date.now(); // Generating unique ID
  tasks.push(newTask);
  writeTasksToFile(tasks);
  res.status(201).json(newTask);
});

// Маршрут для обновления задачи
app.put('/tasks/:id', (req, res) => {
  const taskId = req.params.id;
  const updatedTask = req.body;

  tasks = tasks.map(task => {
    if (task.id === taskId) {
      return { ...task, ...updatedTask };
    }
    return task;
  });

  writeTasksToFile(tasks);
  res.json({ message: 'Task updated successfully' });
});

// Маршрут для удаления задачи
app.delete('/tasks/:id', (req, res) => {
  const taskId = req.params.id;
  tasks = tasks.filter(task => task.id !== taskId);
  writeTasksToFile(tasks);
  res.json({ message: 'Task deleted successfully' });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
