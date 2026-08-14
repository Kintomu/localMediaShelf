const express = require("express");
const fs = require("fs/promises");
const path = require("path");

const app = express();
const port = process.env.PORT || 3000;
const mediaFilePath = path.join(__dirname, "data", "media.json");

async function readMediaItems() {
  const mediaFile = await fs.readFile(mediaFilePath, "utf8");
  return JSON.parse(mediaFile);
}

app.get("/api/media", async (request, response) => {
  try {
    const mediaItems = await readMediaItems();

    response.json(mediaItems);
  } catch (error) {
    console.error("Unable to read media data:", error);
    response.status(500).json({ error: "Unable to load the media library." });
  }
});

app.get("/api/media/:id", async (request, response) => {
  const mediaId = Number(request.params.id);

  if (!Number.isInteger(mediaId) || mediaId <= 0) {
    return response.status(400).json({ error: "Media ID must be a positive integer." });
  }

  try {
    const mediaItems = await readMediaItems();
    const mediaItem = mediaItems.find((item) => item.id === mediaId);

    if (!mediaItem) {
      return response.status(404).json({ error: "Media item not found." });
    }

    return response.json(mediaItem);
  } catch (error) {
    console.error("Unable to read media data:", error);
    return response.status(500).json({ error: "Unable to load the media item." });
  }
});

app.use(express.static(path.join(__dirname, "public")));

app.listen(port, () => {
  console.log(`Local Media Shelf is running at http://localhost:${port}`);
});
