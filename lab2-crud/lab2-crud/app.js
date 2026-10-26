const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ============ ХРАНИЛИЩЕ ДАННЫХ ============
let movies = [
  { id: 1, title: 'Начало', year: 2010, director: 'Кристофер Нолан', rating: 8.8 },
  { id: 2, title: 'Матрица', year: 1999, director: 'Лана Вачовски', rating: 8.7 },
  { id: 3, title: 'Интерстеллар', year: 2014, director: 'Кристофер Нолан', rating: 8.6 },
  { id: 4, title: 'Криминальное чтиво', year: 1994, director: 'Квентин Тарантино', rating: 8.9 },
  { id: 5, title: 'Бойцовский клуб', year: 1999, director: 'Дэвид Финчер', rating: 8.8 }
];

let nextId = 6;

// ============ ВАЛИДАЦИЯ ============
function validateMovie(body, isUpdate = false) {
  const errors = [];
  const { title, year, director, rating } = body;

  if (!isUpdate || title !== undefined) {
    if (!title || typeof title !== 'string' || title.trim() === '') {
      errors.push('Поле "title" обязательно и должно быть непустой строкой');
    }
  }
  if (!isUpdate || year !== undefined) {
    if (year === undefined || typeof year !== 'number' || isNaN(year)) {
      errors.push('Поле "year" обязательно и должно быть числом');
    }
  }
  if (!isUpdate || director !== undefined) {
    if (!director || typeof director !== 'string' || director.trim() === '') {
      errors.push('Поле "director" обязательно и должно быть непустой строкой');
    }
  }
  if (!isUpdate || rating !== undefined) {
    if (rating === undefined || typeof rating !== 'number' || isNaN(rating)) {
      errors.push('Поле "rating" обязательно и должно быть числом');
    } else if (rating < 0 || rating > 10) {
      errors.push('Поле "rating" должно быть в диапазоне от 0 до 10');
    }
  }

  return errors;
}

// ============ CRUD ============

// GET /movies – все фильмы (поиск, сортировка, пагинация)
app.get('/movies', (req, res) => {
  let result = [...movies];
  const { search, sort, order, page, limit } = req.query;

  // Поиск по названию
  if (search) {
    const s = search.toLowerCase();
    result = result.filter(m => m.title.toLowerCase().includes(s));
  }

  // Сортировка
  if (sort) {
    const sortOrder = order === 'desc' ? -1 : 1;
    if (result.length > 0 && result[0].hasOwnProperty(sort)) {
      result.sort((a, b) => {
        if (a[sort] < b[sort]) return -1 * sortOrder;
        if (a[sort] > b[sort]) return 1 * sortOrder;
        return 0;
      });
    } else {
      return res.status(400).json({ error: `Невозможно сортировать по полю "${sort}"` });
    }
  }

  // Пагинация
  const total = result.length;
  let pageNum = parseInt(page) || 1;
  let limitNum = parseInt(limit) || 10;
  if (pageNum < 1) pageNum = 1;
  if (limitNum < 1) limitNum = 10;

  const start = (pageNum - 1) * limitNum;
  const paginated = result.slice(start, start + limitNum);

  res.json({
    count: paginated.length,
    total: total,
    page: pageNum,
    limit: limitNum,
    movies: paginated
  });
});

// GET /movies/:id – один фильм
app.get('/movies/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const movie = movies.find(m => m.id === id);
  if (!movie) return res.status(404).json({ error: 'Фильм не найден' });
  res.json(movie);
});

// POST /movies – создать фильм
app.post('/movies', (req, res) => {
  const errors = validateMovie(req.body, false);
  if (errors.length > 0) return res.status(400).json({ errors });

  const { title, year, director, rating } = req.body;
  const newMovie = {
    id: nextId++,
    title: title.trim(),
    year: year,
    director: director.trim(),
    rating: rating
  };
  movies.push(newMovie);
  res.status(201).json(newMovie);
});

// PUT /movies/:id – обновить фильм
app.put('/movies/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = movies.findIndex(m => m.id === id);
  if (index === -1) return res.status(404).json({ error: 'Фильм не найден' });

  const errors = validateMovie(req.body, true);
  if (errors.length > 0) return res.status(400).json({ errors });

  const { title, year, director, rating } = req.body;
  movies[index] = {
    id: id,
    title: title !== undefined ? title.trim() : movies[index].title,
    year: year !== undefined ? year : movies[index].year,
    director: director !== undefined ? director.trim() : movies[index].director,
    rating: rating !== undefined ? rating : movies[index].rating
  };
  res.json(movies[index]);
});

// DELETE /movies/:id – удалить фильм
app.delete('/movies/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = movies.findIndex(m => m.id === id);
  if (index === -1) return res.status(404).json({ error: 'Фильм не найден' });

  movies.splice(index, 1);
  res.status(204).send(); // 204 No Content
});

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Маршрут не найден' });
});

app.listen(port, () => {
  console.log(`Сервер запущен на http://localhost:${port}`);
});