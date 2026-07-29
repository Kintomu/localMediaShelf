const express = require("express");
const fs = require("fs/promises");
const path = require("path");

const app = express();
const port = process.env.PORT || 3000;
const mediaFilePath = path.join(__dirname, "data", "media.json");

app.get("/api/media", async (request, response) => {
  try {
    const mediaFile = await fs.readFile(mediaFilePath, "utf8");
    const mediaItems = JSON.parse(mediaFile);

    response.json(mediaItems);
  } catch (error) {
    console.error("Unable to read media data:", error);
    response.status(500).json({ error: "Unable to load the media library." });
  }
});

app.use(express.static(path.join(__dirname, "public")));

app.listen(port, () => {
  console.log(`Local Media Shelf is running at http://localhost:${port}`);
});
