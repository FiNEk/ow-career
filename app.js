const express = require('express');

const app = express();
const PORT = 3000;

app.get('/api', (req, res) => {
  res.send('<h1>you\'re at /api</h1>');
});

app.get('/', (req, res) => {
  res.send('<h1>you\'re at /</h1>');
});

app.listen(PORT, () => console.log(`App running on port ${PORT}`));