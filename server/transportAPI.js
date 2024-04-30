const express = require('express');
const app = express();
const port = 3000;
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const paymentRoutes = require('./paymentRoutes');

app.use('/payments', paymentRoutes);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Server is running at http://192.168.1.101:${port}`); //CALAFAT
 // console.log(`Server is running at http://192.168.100.20:${port}`); TIMISOARA
});
