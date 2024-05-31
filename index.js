const express = require('express');
const puppeteer = require('puppeteer');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

// Serve the search form
app.get('/', (req, res) => {
  res.send(`
    <form action="/search" method="post">
      <input type="text" name="query" placeholder="Enter search term">
      <button type="submit">Search</button>
    </form>
  `);
});

// Handle the search and display results
app.post('/search', async (req, res) => {
  const searchQuery = req.body.query;

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('https://www.google.com');
  await page.type('input[name="q"]', searchQuery);
  await page.keyboard.press('Enter');
  await page.waitForSelector('h3');

  const results = await page.evaluate(() => {
    const anchors = Array.from(document.querySelectorAll('h3'));
    return anchors.map(anchor => anchor.innerText);
  });

  await browser.close();

  res.send(`
    <h1>Search Results for "${searchQuery}"</h1>
    <ul>${results.map(result => `<li>${result}</li>`).join('')}</ul>
  `);
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
