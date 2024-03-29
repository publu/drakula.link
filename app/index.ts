const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const port = 3000;

app.get('*', (req, res) => {
    res.send('Hello from Express on Vercel!');
});

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
        const twitterTitle = $('meta[name="twitter:title"]').attr('content') || ogTitle; // Fallback to ogTitle if twitter:title is not available
        const twitterImage = $('meta[name="twitter:image"]').attr('content') || ogImage; // Fallback to ogImage if twitter:image is not available
        const twitterDescription = $('meta[name="twitter:description"]').attr('content') || ogDescription; // Fallback to ogDescription if twitter:description is not available

        // Render or send the data as you need
        // For simplicity, this example just sends a simple HTML page with meta tags for Open Graph and Twitter Cards
        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <meta property="og:title" content="${ogTitle}">
                <meta property="og:image" content="${ogImage}">
                <meta property="og:description" content="${ogDescription}">
                <meta name="twitter:title" content="${twitterTitle}">
                <meta name="twitter:image" content="${twitterImage}">
                <meta name="twitter:description" content="${twitterDescription}">
                <title>Document</title>
            </head>
            <body>
                <div style="border:1px solid #ccc; padding:10px;">
                    <h3>${ogTitle}</h3>
                    <img src="${ogImage}" alt="OG Image" style="max-width:100%;height:auto;">
                    <p>${ogDescription}</p>
                    <a href="${targetUrl}" target="_blank">Go to site</a>
                </div>
            </body>
            </html>
        `);
    } catch (error) {
        console.error('Error fetching URL:', error);
        res.status(500).send('Error fetching the URL.');
    }
});

module.exports = app;