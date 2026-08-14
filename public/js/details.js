const detailsStatus = document.querySelector("#details-status");
const mediaDetails = document.querySelector("#media-details");
const mediaTitle = document.querySelector("#media-title");
const mediaType = document.querySelector("#media-type");
const mediaGenre = document.querySelector("#media-genre");
const watchedStatus = document.querySelector("#watched-status");
const favoriteStatus = document.querySelector("#favorite-status");

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

function renderMediaDetails(mediaItem) {
  mediaTitle.textContent = mediaItem.title;
  mediaType.textContent = formatMediaType(mediaItem.type);
  mediaGenre.textContent = mediaItem.genre;
  watchedStatus.textContent = mediaItem.watched ? "Yes" : "No";
  favoriteStatus.textContent = mediaItem.favorite ? "Yes" : "No";

  document.title = `${mediaItem.title} | Local Media Shelf`;
  detailsStatus.hidden = true;
  mediaDetails.hidden = false;
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

loadMediaDetails();
