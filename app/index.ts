const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const port = 3000;

// Dynamic route
app.get('/:id', async (req, res) => {
    const { id } = req.params;
    // Construct your URL using the dynamic part of the path
    const targetUrl = `https://drakula.app/post/${id}`;

    try {
        const response = await axios.get(targetUrl);
        const $ = cheerio.load(response.data);
        const ogTitle = $('meta[property="og:title"]').attr('content') || 'Title not available';
        const ogImage = $('meta[property="og:image"]').attr('content') || 'Image not available';
        const ogDescription = $('meta[property="og:description"]').attr('content') || 'Description not available';

        // Render or send the data as you need
        // For simplicity, this example just sends a simple HTML page
        res.send(`
            <div style="border:1px solid #ccc; padding:10px;">
                <h3>${ogTitle}</h3>
                <img src="${ogImage}" alt="OG Image" style="max-width:100%;height:auto;">
                <p>${ogDescription}</p>
                <a href="${targetUrl}" target="_blank">Go to site</a>
            </div>
        `);
    } catch (error) {
        console.error('Error fetching URL:', error);
        res.status(500).send('Error fetching the URL.');
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
