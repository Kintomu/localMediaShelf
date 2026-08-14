const detailsStatus = document.querySelector("#details-status");
const mediaDetails = document.querySelector("#media-details");
const mediaTitle = document.querySelector("#media-title");
const mediaType = document.querySelector("#media-type");
const mediaGenre = document.querySelector("#media-genre");
const watchedStatus = document.querySelector("#watched-status");
const favoriteStatus = document.querySelector("#favorite-status");
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

loadMediaDetails();
