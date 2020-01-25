const express = require('express');

const app = express();
const PORT = 3000;

app.get('/api', (req, res) => {
  res.send('Overwatch career app')
});

app.listen(() => console.log(`App running on port ${PORT}`));