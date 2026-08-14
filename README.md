# Local Media Shelf

Local Media Shelf is a small browser-based catalog for organizing media stored
on a local computer. It can scan a folder, import supported entries into a
private JSON catalog, search the library, display title details, look up movie
and TV metadata from TMDB, and track watched and favorite status.

## Features

- Scan an absolute folder path and preview supported media before importing it.
- Recognize top-level `.iso` and `.mp4` files and Blu-ray folders containing a
  `BDMV` directory.
- Store imported catalog data locally without committing personal file paths.
- Browse and search imported titles from a responsive library page.
- Open a details page for each title.
- Display metadata from TMDB through a server-side API request.
- Save watched and favorite status in JSON storage.
- Clear the catalog with a confirmation step without changing source files.
- Show user-friendly validation and request errors.

## Capstone Requirements

| Requirement | Implementation |
| --- | --- |
| External API integration | The Express server provides `/api/tmdb/search` and keeps the TMDB API key out of browser code. |
| Responsive design | The layout uses CSS Grid, Flexbox, and a media query at `48rem`. |
| Two pages or routes | `/` displays the library and `/details/:id` displays one title. |
| Analyze arrays or objects | `filterMedia(mediaItems, searchTerm)` searches the loaded media array and the UI renders the results. |
| Validate user input | The server validates IDs, boolean status values, TMDB searches, and absolute scan paths before processing them. |
| Function with multiple parameters and a return value | `filterMedia(mediaItems, searchTerm)` takes two parameters and returns a determined list. |
| Persist application data | Imports and watched/favorite updates are saved to a local JSON file. |
| Node.js web server and API | Express serves the pages and provides GET, POST, and DELETE API routes. |

## Requirements

- Node.js 20 or newer
- npm
- A TMDB API key for metadata lookups

## Getting a TMDB API Key

1. Open the official [TMDB Getting Started guide](https://developer.themoviedb.org/docs/getting-started).
2. Create a TMDB account or sign in to an existing account.
3. Open the **API** page from the account settings sidebar. You can also go
   directly to [TMDB API Settings](https://www.themoviedb.org/settings/api)
   after signing in.
4. Complete the API registration form and accept TMDB's terms of use.
5. Copy the value labeled **API Key (v3 auth)**. This project sends that key as
   the `api_key` parameter from the Express server.
6. Keep the key private and paste it into the local `.env` file as shown below.

## Setup

1. Clone the repository and open the project directory.
2. Install the dependencies:

   ```bash
   npm install
   ```

3. Copy `.env.example` to a new `.env` file.
4. Replace the placeholder with your TMDB API key:

   ```env
   TMDB_API_KEY=your_tmdb_api_key_here
   ```

5. Start the Express server:

   ```bash
   npm start
   ```

6. Open `http://localhost:3000` in a browser.

The `.env` file is ignored by Git so the API key stays local. TMDB requests are
sent by the Express server rather than directly from the browser.

## Using the Library

1. Enter an absolute folder path, such as `E:\Media\Backup`.
2. Select **Scan folder** to preview supported entries.
3. Select **Import all candidates** to save new entries to the catalog.
4. Search the library or open a title to view its details and TMDB metadata.
5. Use the details-page buttons to update watched or favorite status.

Imported records are stored in `data/media.local.json`. This file is created
locally and ignored by Git because it can contain private file paths. The
checked-in `data/media.json` file is an empty starting catalog.

The **Delete all media** action clears catalog records only. A confirmation is
required, and files in the scanned directory are not changed.

## Manual Test Checklist

1. Confirm the library page loads at `http://localhost:3000`.
2. Submit an empty or invalid scan path and confirm a clear error appears.
3. Scan a media folder and confirm a preview appears before anything is saved.
4. Import the preview and confirm the library refreshes with the new titles.
5. Search for part of a title and confirm the cards are filtered.
6. Open a title and confirm its details and TMDB metadata load.
7. Change watched and favorite status, refresh, and confirm both values persist.
8. Cancel the delete-all confirmation and confirm the catalog remains intact.
9. Confirm deletion and verify the catalog becomes empty while source files
   remain unchanged.

## AI Usage

OpenAI Codex was used as a planning and coding assistant for this project. AI
assistance included project structure suggestions, small code examples,
debugging help, test planning, and README drafting. I reviewed and manually
tested each change before including it in the project.
