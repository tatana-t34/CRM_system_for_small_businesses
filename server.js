const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

// Инициализация базы данных
const db = new sqlite3.Database('./database.sqlite', (err) => {
    if (err) {
        console.error('Database connection error:', err);
    } else {
        console.log('Connected to SQLite database');
        initializeDatabase();
    }
});

function initializeDatabase() {
    db.run(`CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        address TEXT,
        description TEXT NOT NULL,
        departureDate TEXT,
        status TEXT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
}

// Получение всех задач
app.get('/tasks', (req, res) => {
    db.all('SELECT * FROM tasks ORDER BY createdAt DESC', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Добавление новой задачи
app.post('/tasks', (req, res) => {
    const { name, phone, address, description, departureDate, status } = req.body;
    const id = "task-" + Date.now();
    
    db.run(
        'INSERT INTO tasks (id, name, phone, address, description, departureDate, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [id, name, phone, address, description, departureDate, status],
        function(err) {
            if (err) {
                res.status(400).json({ error: err.message });
                return;
            }
            res.status(201).json({ 
                id, 
                name, 
                phone, 
                address, 
                description, 
                departureDate, 
                status 
            });
        }
    );
});

// Обновление задачи
app.put('/tasks/:id', (req, res) => {
    const { name, phone, address, description, departureDate, status } = req.body;
    
    db.run(
        'UPDATE tasks SET name = ?, phone = ?, address = ?, description = ?, departureDate = ?, status = ? WHERE id = ?',
        [name, phone, address, description, departureDate, status, req.params.id],
        function(err) {
            if (err) {
                res.status(400).json({ error: err.message });
                return;
            }
            res.json({ message: 'Task updated successfully' });
        }
    );
});

// Удаление задачи
app.delete('/tasks/:id', (req, res) => {
    db.run(
        'DELETE FROM tasks WHERE id = ?',
        [req.params.id],
        function(err) {
            if (err) {
                res.status(400).json({ error: err.message });
                return;
            }
            res.json({ message: 'Task deleted successfully' });
        }
    );
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

process.on('SIGINT', () => {
    db.close();
    process.exit();
});
