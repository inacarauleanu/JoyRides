const express = require('express');
const scrapeUrls = require('./scrapeLogic'); // Assuming you've renamed the function from scrapeData to scrapeUrls
const fs = require('fs/promises');

const app = express();
const PORT = process.env.PORT || 3001;

let tramData = {}; // Object to store scraped tram data
let trolsData = {}; // Object to store scraped trols data
let busesData = {}; // Object to store scraped buses data

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
        await scrapeUrls(tramUrls, 'scraped_data_trams.json');
        res.sendFile(__dirname + '/scraped_data_trams.json'); // Send the JSON file as response
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
        await scrapeUrls(trolsUrls, 'scraped_data_trols.json');
        res.sendFile(__dirname + '/scraped_data_trols.json');
    } catch (error) {
        console.error('Error scraping trols data:', error);
        res.status(500).send('Internal server error');
    }
});

app.get('/scrape/buses', async (req, res) => {
    try {
        const busesUrls = [
            'http://sys.ratt.ro:41979/s_timpi/trasee.php?param1=2246',
            'http://sys.ratt.ro:41979/s_timpi/trasee.php?param1=2226',
            'http://sys.ratt.ro:41979/s_timpi/trasee.php?param1=1066',
            'http://sys.ratt.ro:41979/s_timpi/trasee.php?param1=1146',
            'http://sys.ratt.ro:41979/s_timpi/trasee.php?param1=3066',
            'http://sys.ratt.ro:41979/s_timpi/trasee.php?param1=1226',
            'http://sys.ratt.ro:41979/s_timpi/trasee.php?param1=1546',
            'http://sys.ratt.ro:41979/s_timpi/trasee.php?param1=1046',
            'http://sys.ratt.ro:41979/s_timpi/trasee.php?param1=886',
            'http://sys.ratt.ro:41979/s_timpi/trasee.php?param1=1406',
            'http://sys.ratt.ro:41979/s_timpi/trasee.php?param1=1550',
            'http://sys.ratt.ro:41979/s_timpi/trasee.php?param1=1551',
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
            'http://sys.ratt.ro:41979/s_timpi/trasee.php?param1=3606',
            'http://sys.ratt.ro:41979/s_timpi/trasee.php?param1=3646',
            'http://sys.ratt.ro:41979/s_timpi/trasee.php?param1=3306',
            'http://sys.ratt.ro:41979/s_timpi/trasee.php?param1=3307',
            'http://sys.ratt.ro:41979/s_timpi/trasee.php?param1=2646',
            'http://sys.ratt.ro:41979/s_timpi/trasee.php?param1=2506',
            'http://sys.ratt.ro:41979/s_timpi/trasee.php?param1=2606',
            'http://sys.ratt.ro:41979/s_timpi/trasee.php?param1=3326',
            'http://sys.ratt.ro:41979/s_timpi/trasee.php?param1=3366',
            'http://sys.ratt.ro:41979/s_timpi/trasee.php?param1=3406',
            'http://sys.ratt.ro:41979/s_timpi/trasee.php?param1=3426',
            'http://sys.ratt.ro:41979/s_timpi/trasee.php?param1=3486',
            'http://sys.ratt.ro:41979/s_timpi/trasee.php?param1=3466',
            'http://sys.ratt.ro:41979/s_timpi/trasee.php?param1=3546'
        ];
        await scrapeUrls(busesUrls, 'scraped_data_buses.json');
        res.sendFile(__dirname + '/scraped_data_buses.json');
    } catch (error) {
        console.error('Error scraping trols data:', error);
        res.status(500).send('Internal server error');
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
