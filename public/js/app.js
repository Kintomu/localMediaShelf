const appStatus = document.querySelector("#app-status");
const mediaGrid = document.querySelector("#media-grid");
const searchInput = document.querySelector("#search-input");
const scanForm = document.querySelector("#scan-form");
const scanPathInput = document.querySelector("#scan-path");
const scanButton = document.querySelector("#scan-button");
const scanStatus = document.querySelector("#scan-status");
const scanPreview = document.querySelector("#scan-preview");
const scanResults = document.querySelector("#scan-results");
const importButton = document.querySelector("#import-button");

let allMediaItems = [];
let scannedDirectoryPath = "";

function filterMedia(mediaItems, searchTerm) {
  const normalizedSearchTerm = searchTerm.trim().toLowerCase();

  if (normalizedSearchTerm === "") {
    return mediaItems;
  }

  return mediaItems.filter((mediaItem) => {
    return mediaItem.title.toLowerCase().includes(normalizedSearchTerm);
  });
}

function formatScanSourceType(sourceType) {
  if (sourceType === "iso") {
    return "ISO";
  }

  if (sourceType === "mp4") {
    return "MP4";
  }

  return "Blu-ray folder";
}

function renderScanPreview(candidates) {
  scanResults.replaceChildren();

  if (candidates.length === 0) {
    scanPreview.hidden = true;
    scanStatus.textContent = "No supported media was found in that folder.";
    return;
  }

  candidates.forEach((candidate) => {
    const listItem = document.createElement("li");
    const title = document.createElement("span");
    const sourceType = document.createElement("span");

    title.textContent = candidate.title;
    sourceType.className = "scan-source-type";
    sourceType.textContent = formatScanSourceType(candidate.sourceType);

    listItem.append(title, sourceType);
    scanResults.append(listItem);
  });

  importButton.textContent = `Import all ${candidates.length} candidates`;
  scanPreview.hidden = false;
  scanStatus.textContent = `Found ${candidates.length} candidates. Nothing has been saved yet.`;
}

async function handleScanSubmit(event) {
  event.preventDefault();

  const directoryPath = scanPathInput.value.trim();

  scannedDirectoryPath = "";
  scanStatus.classList.remove("status-message--error");
  scanPreview.hidden = true;

  if (directoryPath === "") {
    scanStatus.classList.add("status-message--error");
    scanStatus.textContent = "Enter an absolute folder path before scanning.";
    return;
  }

  scanButton.disabled = true;
  scanStatus.textContent = "Scanning folder...";

  try {
    const response = await fetch("/api/media/scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ directoryPath })
    });
    const scanData = await response.json();

    if (!response.ok) {
      throw new Error(scanData.error || "The folder could not be scanned.");
    }

    scannedDirectoryPath = scanData.directoryPath;
    renderScanPreview(scanData.candidates);
  } catch (error) {
    console.error("Unable to scan media folder:", error);
    scanStatus.classList.add("status-message--error");
    scanStatus.textContent = error.message;
  } finally {
    scanButton.disabled = false;
  }
}

async function handleImportClick() {
  if (scannedDirectoryPath === "") {
    scanStatus.classList.add("status-message--error");
    scanStatus.textContent = "Scan a folder before importing media.";
    return;
  }

  scanStatus.classList.remove("status-message--error");
  scanButton.disabled = true;
  importButton.disabled = true;
  scanStatus.textContent = "Importing media...";

  try {
    const response = await fetch("/api/media/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ directoryPath: scannedDirectoryPath })
    });
    const importData = await response.json();

    if (!response.ok) {
      throw new Error(importData.error || "The media could not be imported.");
    }

    scanStatus.textContent = `Imported ${importData.importedCount} new items. Library now has ${importData.totalCount} items.`;
    await loadMediaItems();
  } catch (error) {
    console.error("Unable to import media:", error);
    scanStatus.classList.add("status-message--error");
    scanStatus.textContent = error.message;
  } finally {
    scanButton.disabled = false;
    importButton.disabled = false;
  }
}

function createStatusBadge(label, isActive) {
  const badge = document.createElement("span");
  badge.className = "media-card__status";
  badge.textContent = `${label}: ${isActive ? "Yes" : "No"}`;

  if (isActive) {
    badge.classList.add("media-card__status--active");
  }

  return badge;
}

function createMediaCard(mediaItem) {
  const card = document.createElement("a");
  card.className = "media-card";
  card.href = `/details/${mediaItem.id}`;

  const title = document.createElement("h3");
  title.textContent = mediaItem.title;

  const details = document.createElement("p");
  const mediaType = mediaItem.type === "tv" ? "TV Show" : "Movie";
  details.className = "media-card__details";
  details.textContent = `${mediaType} · ${mediaItem.genre}`;

  const statuses = document.createElement("div");
  statuses.className = "media-card__statuses";
  statuses.append(
    createStatusBadge("Watched", mediaItem.watched),
    createStatusBadge("Favorite", mediaItem.favorite)
  );

  card.append(title, details, statuses);

  return card;
}

function renderMediaItems(
  mediaItems,
  emptyMessage = "Your media library is empty."
) {
  mediaGrid.replaceChildren();

  if (mediaItems.length === 0) {
    appStatus.textContent = emptyMessage;
    return;
  }

  mediaItems.forEach((mediaItem) => {
    mediaGrid.append(createMediaCard(mediaItem));
  });

  appStatus.textContent = `Showing ${mediaItems.length} media items.`;
}

function handleSearchInput(event) {
  const searchTerm = event.target.value;
  const filteredMediaItems = filterMedia(allMediaItems, searchTerm);

  renderMediaItems(filteredMediaItems, "No titles match your search.");
}

async function loadMediaItems() {
  try {
    const response = await fetch("/api/media");

    if (!response.ok) {
      throw new Error(`Media request failed with status ${response.status}.`);
    }

    allMediaItems = await response.json();
    renderMediaItems(allMediaItems);
  } catch (error) {
    console.error("Unable to load media items:", error);
    appStatus.classList.add("status-message--error");
    appStatus.textContent = "Sorry, the media library could not be loaded.";
  }
}

searchInput.addEventListener("input", handleSearchInput);
scanForm.addEventListener("submit", handleScanSubmit);
importButton.addEventListener("click", handleImportClick);
loadMediaItems();
