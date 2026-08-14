const detailsStatus = document.querySelector("#details-status");
const mediaDetails = document.querySelector("#media-details");
const mediaTitle = document.querySelector("#media-title");
const mediaType = document.querySelector("#media-type");
const mediaGenre = document.querySelector("#media-genre");
const watchedStatus = document.querySelector("#watched-status");
const favoriteStatus = document.querySelector("#favorite-status");
const tmdbStatus = document.querySelector("#tmdb-status");
const tmdbContent = document.querySelector("#tmdb-content");
const tmdbPoster = document.querySelector("#tmdb-poster");
const tmdbTitle = document.querySelector("#tmdb-title");
const tmdbOverview = document.querySelector("#tmdb-overview");
const tmdbReleaseDate = document.querySelector("#tmdb-release-date");
const tmdbRating = document.querySelector("#tmdb-rating");
const watchedButton = document.querySelector("#watched-button");
const favoriteButton = document.querySelector("#favorite-button");
const actionStatus = document.querySelector("#action-status");

let currentMediaItem = null;

function getMediaIdFromPath() {
  const pathParts = window.location.pathname.split("/");
  return pathParts[pathParts.length - 1];
}

function formatMediaType(type) {
  return type === "tv" ? "TV Show" : "Movie";
}

function showDetailsError(message) {
  detailsStatus.classList.add("status-message--error");
  detailsStatus.textContent = message;
}

function showTmdbError(message) {
  tmdbContent.hidden = true;
  tmdbStatus.hidden = false;
  tmdbStatus.classList.add("status-message--error");
  tmdbStatus.textContent = message;
}

function formatRating(rating) {
  return typeof rating === "number" ? `${rating.toFixed(1)} / 10` : "Not available";
}

function renderTmdbMetadata(metadata) {
  tmdbTitle.textContent = metadata.title;
  tmdbOverview.textContent = metadata.overview || "No overview is available.";
  tmdbReleaseDate.textContent = metadata.releaseDate || "Not available";
  tmdbRating.textContent = formatRating(metadata.rating);
  tmdbContent.classList.toggle(
    "tmdb-content--no-poster",
    !metadata.posterPath
  );

  if (metadata.posterPath) {
    tmdbPoster.src = `https://image.tmdb.org/t/p/w500${metadata.posterPath}`;
    tmdbPoster.alt = `${metadata.title} poster`;
    tmdbPoster.hidden = false;
  } else {
    tmdbPoster.removeAttribute("src");
    tmdbPoster.alt = "";
    tmdbPoster.hidden = true;
  }

  tmdbStatus.hidden = true;
  tmdbContent.hidden = false;
}

function updateStatusButtons(mediaItem) {
  watchedButton.textContent = mediaItem.watched
    ? "Mark as unwatched"
    : "Mark as watched";
  favoriteButton.textContent = mediaItem.favorite
    ? "Remove from favorites"
    : "Add to favorites";
}

function renderMediaDetails(mediaItem) {
  currentMediaItem = mediaItem;
  mediaTitle.textContent = mediaItem.title;
  mediaType.textContent = formatMediaType(mediaItem.type);
  mediaGenre.textContent = mediaItem.genre;
  watchedStatus.textContent = mediaItem.watched ? "Yes" : "No";
  favoriteStatus.textContent = mediaItem.favorite ? "Yes" : "No";
  updateStatusButtons(mediaItem);

  document.title = `${mediaItem.title} | Local Media Shelf`;
  detailsStatus.hidden = true;
  mediaDetails.hidden = false;
}

async function loadTmdbMetadata(mediaItem) {
  const searchParameters = new URLSearchParams({
    query: mediaItem.title,
    type: mediaItem.type
  });

  try {
    const response = await fetch(`/api/tmdb/search?${searchParameters}`);

    if (response.status === 404) {
      showTmdbError("No TMDB match was found for this title.");
      return;
    }

    if (!response.ok) {
      showTmdbError("TMDB metadata is currently unavailable.");
      return;
    }

    const metadata = await response.json();
    renderTmdbMetadata(metadata);
  } catch (error) {
    console.error("Unable to load TMDB metadata:", error);
    showTmdbError("TMDB metadata is currently unavailable.");
  }
}

function setStatusButtonsDisabled(isDisabled) {
  watchedButton.disabled = isDisabled;
  favoriteButton.disabled = isDisabled;
}

async function updateMediaStatus(statusName, statusValue) {
  const mediaId = getMediaIdFromPath();
  const requestBody = {};
  requestBody[statusName] = statusValue;

  setStatusButtonsDisabled(true);
  actionStatus.classList.remove("status-message--error");
  actionStatus.textContent = `Saving ${statusName} status...`;

  try {
    const response = await fetch(
      `/api/media/${encodeURIComponent(mediaId)}/${statusName}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody)
      }
    );

    if (!response.ok) {
      throw new Error(`Status update failed with code ${response.status}.`);
    }

    const updatedMediaItem = await response.json();
    renderMediaDetails(updatedMediaItem);
    actionStatus.textContent = `${statusName} status saved.`;
  } catch (error) {
    console.error(`Unable to update ${statusName} status:`, error);
    actionStatus.classList.add("status-message--error");
    actionStatus.textContent = "Sorry, the status could not be saved.";
  } finally {
    setStatusButtonsDisabled(false);
  }
}

async function loadMediaDetails() {
  const mediaId = getMediaIdFromPath();

  try {
    const response = await fetch(`/api/media/${encodeURIComponent(mediaId)}`);

    if (response.status === 400) {
      showDetailsError("The media ID in the address is invalid.");
      return;
    }

    if (response.status === 404) {
      showDetailsError("That media item could not be found.");
      return;
    }

    if (!response.ok) {
      showDetailsError("Sorry, the media details could not be loaded.");
      return;
    }

    const mediaItem = await response.json();
    renderMediaDetails(mediaItem);
    await loadTmdbMetadata(mediaItem);
  } catch (error) {
    console.error("Unable to load media details:", error);
    showDetailsError("Sorry, the media details could not be loaded.");
  }
}

watchedButton.addEventListener("click", () => {
  if (currentMediaItem) {
    updateMediaStatus("watched", !currentMediaItem.watched);
  }
});

favoriteButton.addEventListener("click", () => {
  if (currentMediaItem) {
    updateMediaStatus("favorite", !currentMediaItem.favorite);
  }
});

tmdbPoster.addEventListener("error", () => {
  tmdbPoster.hidden = true;
  tmdbContent.classList.add("tmdb-content--no-poster");
});

loadMediaDetails();
