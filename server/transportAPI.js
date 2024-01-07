const express = require('express');
const cors = require('cors');

const app = express();
const port = 3000; // You can change the port if needed

app.use(cors());

const routes = [
    [ //8
        { latitude: 45.727073937005436,  longitude: 21.276126083094514 },
      { latitude: 45.72926084389645,  longitude: 21.2686802708622 },
      { latitude: 45.73354453672023,  longitude: 21.258573707289397},
      { latitude: 45.737094061197595, longitude:25059145325732},
      
      // Add more coordinates to define your first route
    ],
    [
      { latitude: 45.73664476679134, longitude: 21.25795143480112 },
      { latitude: 45.74159733158845, longitude: 21.255987241205673 },
      // Add more coordinates to define your second route
    ],
    // Add more routes as needed
  ];

// Sample data for initial coordinates
let vehicles = [
  { vehicleId: 1, routeIndex: 0},
  { vehicleId: 2, routeIndex: 1 },
  // Add more vehicles as needed
];

// API endpoint to get vehicle coordinates
app.get('/api/vehicles', (req, res) => {
    const updatedVehicles = vehicles.map(vehicle => {
      const route = routes[vehicle.routeIndex];
      const { latitude, longitude } = route[vehicle.routeIndex];
      const nextIndex = (vehicle.routeIndex + 1) % route.length;
  
      return {
        ...vehicle,
        latitude,
        longitude,
        routeIndex: nextIndex,
      };
    });
  
    vehicles = updatedVehicles;
  
    res.json(updatedVehicles);
  });

// Update vehicle coordinates every 10 seconds

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
