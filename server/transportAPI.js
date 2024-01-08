const express = require('express');
const app = express();
const port = 3000;

const busStopsData = require('./busStops.json');

app.get('/busStops', (req, res) => {
  res.json(busStopsData);
});

app.listen(port, () => {
  console.log(`Server is running at http://192.168.100.20:${port}`);
});
