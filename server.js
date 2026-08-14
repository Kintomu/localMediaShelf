const express = require("express");
const fs = require("fs/promises");
const path = require("path");

const app = express();
const port = process.env.PORT || 3000;
const mediaFilePath = path.join(__dirname, "data", "media.json");

app.use(express.json());

async function readMediaItems() {
  const mediaFile = await fs.readFile(mediaFilePath, "utf8");
  return JSON.parse(mediaFile);
}

async function writeMediaItems(mediaItems) {
  const mediaFile = JSON.stringify(mediaItems, null, 2);
  await fs.writeFile(mediaFilePath, `${mediaFile}\n`, "utf8");
}

async function updateMediaStatus(request, response, statusName) {
  const mediaId = Number(request.params.id);
  const statusValue = request.body[statusName];

  if (!Number.isInteger(mediaId) || mediaId <= 0) {
    return response.status(400).json({ error: "Media ID must be a positive integer." });
  }

  if (typeof statusValue !== "boolean") {
    return response.status(400).json({
      error: `${statusName} must be true or false.`
    });
  }

  try {
    const mediaItems = await readMediaItems();
    const mediaItem = mediaItems.find((item) => item.id === mediaId);

    if (!mediaItem) {
      return response.status(404).json({ error: "Media item not found." });
    }

    mediaItem[statusName] = statusValue;
    await writeMediaItems(mediaItems);

    return response.json(mediaItem);
  } catch (error) {
    console.error(`Unable to update ${statusName} status:`, error);
    return response.status(500).json({ error: "Unable to update media status." });
  }
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

app.post("/api/media/:id/watched", (request, response) => {
  return updateMediaStatus(request, response, "watched");
});

app.post("/api/media/:id/favorite", (request, response) => {
  return updateMediaStatus(request, response, "favorite");
});

app.get("/details/:id", (request, response) => {
  response.sendFile(path.join(__dirname, "public", "details.html"));
});

app.use(express.static(path.join(__dirname, "public")));

app.listen(port, () => {
  console.log(`Local Media Shelf is running at http://localhost:${port}`);
});
