# Search Feature

**Feature path:** `src/features/search/`  
**Service:** `searchService`, `navSuggestionsService`  
**Hook:** `useSearch(searchParams)`, `useNavSuggestions(query, debounceMs)`

---

## Overview

Search is powered by Algolia. Products, pages, and other content are indexed in Algolia and queried client-side. The search index is synced from the admin panel.

---

## Public Search Page

### `SearchView` (`/search?q=...`)

Full search results page:

- `SearchFiltersRow` — active filter chip strip
- `SearchResultsSection` — result cards grid (products, pages)
- `Pagination` — URL-driven page navigation

URL params: `q` (query), `category`, `page`, `sort`.

### `SearchFiltersRow`

Horizontal strip of active filter chips. Each chip has an ✕ to remove that filter from the URL.

### `SearchResultsSection`

Grid of search results. Each result is rendered as a `ProductCard` (product hit) or a page-link card (page hit).

---

## Search Hook

### `useSearch(searchParams)`

Calls `searchService.search(params)` → `GET /api/search`.

**Type:** `SearchResponse` — `{ hits[], nbHits, page, nbPages, facets }`

The API route proxies to Algolia's search API server-side (API key not exposed to client).

---

## Navbar Search

### `Search` Component — `src/components/utility/Search.tsx`

Navbar search bar with real-time suggestions:

- Debounced input (300ms) via `useNavSuggestions(query, 300)`
- Dropdown of product/page suggestions
- Arrow key navigation
- Press Enter → navigate to `/search?q=...`

**Hook:** `useNavSuggestions(query, debounceMs)` → `navSuggestionsService.search(query)` → `GET /api/search?nav=1`  
**Type:** `AlgoliaNavRecord` — `{ objectID, name, slug, type, image? }`

---

## Algolia Index Management

From the admin panel (`/demo/algolia`):

| Action         | Endpoint                                 | Description               |
| -------------- | ---------------------------------------- | ------------------------- |
| Sync Products  | `POST /api/admin/algolia/sync`           | Index all active products |
| Sync Pages     | `POST /api/admin/algolia/sync-pages`     | Index static/blog pages   |
| Clear Products | `POST /api/admin/algolia/clear-products` | Clear product index       |
| Clear Pages    | `POST /api/admin/algolia/clear-pages`    | Clear pages index         |

**Hook:** `useAlgoliaSync` — provides mutation functions for all four operations.

---

## API Routes

| Method | Route                               | Description              |
| ------ | ----------------------------------- | ------------------------ |
| `GET`  | `/api/search`                       | Algolia search proxy     |
| `POST` | `/api/admin/algolia/sync`           | Sync products to Algolia |
| `POST` | `/api/admin/algolia/sync-pages`     | Sync pages to Algolia    |
| `POST` | `/api/admin/algolia/clear-products` | Clear products index     |
| `POST` | `/api/admin/algolia/clear-pages`    | Clear pages index        |
