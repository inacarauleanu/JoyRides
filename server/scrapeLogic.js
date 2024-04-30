const puppeteer = require('puppeteer');
const fs = require('fs/promises');

async function scrapeUrls(urls, filename) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    let previousData = {};
    let allData = {};

    const fetchData = async () => {
        for (let p = 0; p < urls.length; p++) {
            const url = urls[p];
            await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 0 });
            await page.waitForSelector('table');

            const data = await page.evaluate(() => {
                const transportData = [];
                const tables = document.querySelectorAll('table');

                for (let i = 0; i < tables.length; i += 3) {
                    const line = tables[i].querySelector('td').innerText.trim();
                    const stations = Array.from(tables[i + 1].querySelectorAll('tr td')).map(td => td.innerText.trim());
                    const arrivalTimes = Array.from(tables[i + 2].querySelectorAll('tr td')).map(td => td.innerText.trim());

                    const stops = [];
                    for (let j = 1; j < stations.length; j++) {
                        stops.push({
                            stop_name: stations[j],
                            arrival_time: arrivalTimes[j]
                        });
                    }

                    transportData.push({
                        line,
                        stops
                    });
                }

                return transportData;
            });
            allData[url] = data;

            const hasChanges = !areObjectsEqual(previousData[url], data);

            if (hasChanges) {
                console.log('Changes detected, scraping data for URL:', url);
                data.forEach(obj => console.log(obj));
                previousData[url] = data;
                await saveDataToJson(allData, filename);
            } else {
                console.log('No changes detected for URL:', url);
            }
        }
    };

    function areObjectsEqual(obj1, obj2) {
        if (!obj1 || !obj2) {
            return false;
        }

        const str1 = JSON.stringify(obj1);
        const str2 = JSON.stringify(obj2);

        return str1 === str2;
    }

    async function saveDataToJson(data, filename) {
        try {
            const jsonData = JSON.stringify(data, null, 2);
            await fs.writeFile(filename, jsonData);
            console.log('All data saved to', filename);
        } catch (error) {
            console.error('Error saving data to JSON file:', error);
        }
    }

    await fetchData();
    setInterval(fetchData, 30000); // Check for changes every 30 seconds
}

module.exports = scrapeUrls;
