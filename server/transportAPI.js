const express = require('express');
const cors = require('cors');
const app = express();
const port = 3002;

const routes = [
  [
    { latitude: 45.727073937005436, longitude: 21.276126083094514 },
    { latitude: 45.72926084389645, longitude: 21.2686802708622 },
    { latitude: 45.73354453672023, longitude: 21.258573707289397 },
    { latitude: 45.737094061197595, longitude: 21.25059145325732 },
  ],
  [
    { latitude: 45.73664476679134, longitude: 21.25795143480112 },
    { latitude: 45.74159733158845, longitude: 21.255987241205673 },
  ],
  // Add more routes as needed
];

let currentIndex = 0;

app.use(cors());

app.get('/markers', (req, res) => {
  const currentRoutes = routes.map((route) => route[currentIndex]);
  currentIndex = (currentIndex + 1) % routes[0].length;
  res.json(currentRoutes);
});

app.listen(port, () => {
  console.log(`Server listening at http://192.168.100.20:${port}`);
});
