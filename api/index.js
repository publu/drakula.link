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
    
    res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <meta name="twitter:player" content="https://drakula.link/embed/${videoId}">
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
                <meta name="twitter:player:stream" content="https://vz-629bcc17-285.b-cdn.net/${videoId}/play_720p.mp4" />
                <meta name="twitter:player:stream:content_type" content="video/mp4" />
            </head>
            <body>
                <div style="border:1px solid #ccc; padding:10px;">
                    <a id="redirectLink" href="${targetUrl}" target="_blank">Go to site</a>
                    <h3>${ogTitle}</h3>
                    <img src="${ogImage}" alt="OG Image" style="max-width:100%;height:auto;">
                    <p>${ogDescription}</p>
                </div>
            </body>
            <script>
              let countdown = 3;
              const targetUrl = "${targetUrl}"; // Use template literals for consistency
              const intervalId = setInterval(() => {
                if(countdown > 0) { // Correct logical operation for countdown check
                  if(countdown == 3) {
                    document.getElementById('redirectLink').textContent = 'Go to site (redirecting in 3...)';
                  } else if(countdown == 2) {
                    document.getElementById('redirectLink').textContent = 'Go to site (redirecting in 2...)';
                  } else if(countdown == 1) {
                    document.getElementById('redirectLink').textContent = 'Go to site (redirecting in 1...)';
                  }
                  countdown--;
                } else {
                  clearInterval(intervalId);
                  window.location.href = targetUrl; // Correctly using the variable
                }
              }, 1000);
            </script>
            </html>
        `);
  } catch (error) {
    console.error("Error fetching URL:", error);
    res.status(500).send("Error fetching the URL.");
  }
});

app.get('/embed/:id', (req, res) => {
  const { id } = req.params;
  const videoUrl = `https://vz-629bcc17-285.b-cdn.net/${id}/play_720p.mp4`;

  res.send(`
    <!DOCTYPE html>
    <html>
    <body>

    <style type="text/css">
    video {
       width:100%;
       max-width:600px;
       height:auto;
    }
    </style>

    <video width="100%" controls>
      <source src="${videoUrl}" type="video/mp4">
    Your browser does not support video
    </video>

    </body>
    </html>
  `);
});


app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
