const appStatus = document.querySelector("#app-status");
const mediaGrid = document.querySelector("#media-grid");
const searchInput = document.querySelector("#search-input");

let allMediaItems = [];

function filterMedia(mediaItems, searchTerm) {
  const normalizedSearchTerm = searchTerm.trim().toLowerCase();

  if (normalizedSearchTerm === "") {
    return mediaItems;
  }

  return mediaItems.filter((mediaItem) => {
    return mediaItem.title.toLowerCase().includes(normalizedSearchTerm);
  });
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
loadMediaItems();
