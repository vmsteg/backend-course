const express = require('express');
const app = express();
const port = 3000;

// Логирование запросов
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Текстовый эндпоинт
app.get('/', (req, res) => {
  res.send('Добро пожаловать на базовый сервер!');
});

// JSON-эндпоинт 1
app.get('/api/status', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// JSON-эндпоинт 2
app.get('/api/info', (req, res) => {
  res.json({ author: 'Student', version: '1.0.0' });
});

// Эндпоинт с параметром
app.get('/api/users/:id', (req, res) => {
  res.json({ message: 'Информация о пользователе', userId: req.params.id });
});

// Обработка 404
app.use((req, res) => {
  res.status(404).json({ error: 'Маршрут не найден' });
});

app.listen(port, () => {
  console.log(`Сервер запущен на http://localhost:${port}`);
});