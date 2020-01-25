const express = require('express');

const app = express();
const PORT = 3000;

app.get('/api', (req, res) => {
  res.send('you\'re at /api')
});

app.get('/', (req, res) => {
  res.send('you\'re at /')
});

app.listen(() => console.log(`App running on port ${PORT}`));