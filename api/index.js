"use strict";

const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const app = express();
const port = 3000;

app.get("/:id", async (req, res) => {
  const { id } = req.params;
  const targetUrl = `https://drakula.app/post/${id}`;
  try {
    const response = await axios.get(targetUrl);
    const $ = cheerio.load(response.data);
    const ogTitle = $('meta[property="og:title"]').attr("content") || "Title not available";
    const ogImage = $('meta[property="og:image"]').attr("content") || "Image not available";
    const ogDescription = $('meta[property="og:description"]').attr("content") || "Description not available";
    const twitterTitle = $('meta[name="twitter:title"]').attr("content") || ogTitle;
    const twitterImage = $('meta[name="twitter:image"]').attr("content") || ogImage;
    const twitterDescription = $('meta[name="twitter:description"]').attr("content") || ogDescription;
    const ogImageURL = new URL(ogImage);
    const ogImagePathParts = ogImageURL.pathname.split('/');
    const videoIdIndex = ogImagePathParts.findIndex(part => part === 'thumbnail.jpg') - 1;
    const videoId = ogImagePathParts[videoIdIndex];
    const mp4Link = `https://vz-629bcc17-285.b-cdn.net/${videoId}/play_720p.mp4`;
    res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <meta name="twitter:player" content="${mp4Link}">
                <meta name="twitter:player:width" content="720">
                <meta name="twitter:player:height" content="1280">
                <meta property="og:title" content="${ogTitle}">
                <meta property="og:image" content="${ogImage}">
                <meta property="og:description" content="${ogDescription}">
                <meta name="twitter:title" content="${twitterTitle}">
                <meta name="twitter:image" content="${twitterImage}">
                <meta name="twitter:description" content="${twitterDescription}">
                <meta name="twitter:card" content="player">
                <meta name="twitter:site" content="@DrakulaApp">
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
    console.error("Error fetching URL:", error);
    res.status(500).send("Error fetching the URL.");
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
