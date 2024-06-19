const express = require('express');
const scrapeUrls = require('./scrapeLogic'); // Assuming you've renamed the function from scrapeData to scrapeUrls
const fs = require('fs/promises');

const app = express();
const PORT = process.env.PORT || 3001;

let tramData = {}; // Object to store scraped tram data
let trolsData = {}; // Object to store scraped trols data
let busesData = {}; // Object to store scraped buses data

const transformKeys = (data) => {
    const transformedData = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        const transformedKey = key.replace(/[.#$/\[\]]/g, '_'); 
        transformedData[transformedKey] = data[key];
      }
    }
    return transformedData;
  };


  const writeToDatabaseTrams = async () => {
    try {
      const db = getDatabase();
      const transformedData = transformKeys(scraped_data_trams)
      await set(ref(db, 'trams/'), {
        transformedData
      });
      console.log("s-a scris pentru trams");
    } catch (error) {
      console.error('Error writing to Firebase Realtime Database:', error);
    }
  };


const scrapeTrams = async () => {
    try {
      const fetchData = async () => {
        const response = await fetch('http://192.168.1.102:3001/scrape/trams');
        const data = await response.json();
        setBusStops(data);
        console.log('Scraping completed successfully for trams');
        await writeToDatabaseTrams();
      };
  
      await fetchData();

      const interval = setInterval(fetchData, 60000);
  
      return () => clearInterval(interval);
    } catch (error) {
      console.error('Error scraping trams data:', error);
    }
  };

const updateServerData = (data) => {
    // Update server's data here
    console.log('Updating server data with scraped data:');
};

// Endpoint to scrape tram data
app.get('/scrape/trams', async (req, res) => {
    try {
        const tramUrls = [
            'http://sys.ratt.ro:41979/s_timpi/trasee.php?param1=1106',
            'http://sys.ratt.ro:41979/s_timpi/trasee.php?param1=1126',
            'http://sys.ratt.ro:41979/s_timpi/trasee.php?param1=1266',
            'http://sys.ratt.ro:41979/s_timpi/trasee.php?param1=2846',
            'http://sys.ratt.ro:41979/s_timpi/trasee.php?param1=1558',
            'http://sys.ratt.ro:41979/s_timpi/trasee.php?param1=2406'
        ];
        const data = await scrapeUrls(tramUrls, updateServerData, 'scraped_data_trams.json');
        res.json(data); // Send the JSON file as response
        //res.sendFile(__dirname + '/scraped_data_trams.json');
    } catch (error) {
        console.error('Error scraping trams data:', error);
        res.status(500).send('Internal server error');
    }
});

// Endpoint to scrape trols data
app.get('/scrape/trols', async (req, res) => {
    try {
        const trolsUrls = [
            'http://sys.ratt.ro:41979/s_timpi/trasee.php?param1=990',
            'http://sys.ratt.ro:41979/s_timpi/trasee.php?param1=2786',
            'http://sys.ratt.ro:41979/s_timpi/trasee.php?param1=1006',
            'http://sys.ratt.ro:41979/s_timpi/trasee.php?param1=989',
            'http://sys.ratt.ro:41979/s_timpi/trasee.php?param1=1206',
            'http://sys.ratt.ro:41979/s_timpi/trasee.php?param1=1086',
            'http://sys.ratt.ro:41979/s_timpi/trasee.php?param1=1166'
        ];
        const data = await scrapeUrls(trolsUrls, updateServerData, 'scraped_data_trols.json');
        res.json(data); // Send the JSON file as response
       // res.sendFile(__dirname + '/scraped_data_trols.json');
    } catch (error) {
        console.error('Error scraping trols data:', error);
        res.status(500).send('Internal server error');
    }
});

app.get('/scrape/buses', async (req, res) => {
    try {
        const busesUrls = [
            'http://sys.ratt.ro:41979/s_timpi/trasee.php?param1=1552',
            'http://sys.ratt.ro:41979/s_timpi/trasee.php?param1=1926',
            'http://sys.ratt.ro:41979/s_timpi/trasee.php?param1=1928',
            'http://sys.ratt.ro:41979/s_timpi/trasee.php?param1=2026',
            'http://sys.ratt.ro:41979/s_timpi/trasee.php?param1=1547',
            'http://sys.ratt.ro:41979/s_timpi/trasee.php?param1=2766',
            'http://sys.ratt.ro:41979/s_timpi/trasee.php?param1=2906',
            'http://sys.ratt.ro:41979/s_timpi/trasee.php?param1=3566',
            'http://sys.ratt.ro:41979/s_timpi/trasee.php?param1=3086',
            'http://sys.ratt.ro:41979/s_timpi/trasee.php?param1=1746',
            'http://sys.ratt.ro:41979/s_timpi/trasee.php?param1=1986',
            'http://sys.ratt.ro:41979/s_timpi/trasee.php?param1=2006',

        ];
        const data = await scrapeUrls(busesUrls, updateServerData, 'scraped_data_buses.json');
        res.json(data); // Send the JSON file as response
        //res.sendFile(__dirname + '/scraped_data_buses.json');
    } catch (error) {
        console.error('Error scraping trols data:', error);
        res.status(500).send('Internal server error');
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port http://192.168.100.20:${PORT}`);
});
