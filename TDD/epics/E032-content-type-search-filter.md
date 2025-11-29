# Epic E032: Content Type Search Filter

## Overview

Enhance the main header search bar to include content type filtering, allowing users to filter search results by type (Products, Auctions, Shops, Categories, Blog) before or during search. This prevents users from being overwhelmed with mixed content types and allows focused searches.

**Note**: This is specifically for the main search bar in the header. Individual page searches remain unchanged.

## Scope

- Add content type filter to header search bar
- Filter tabs/chips for content types
- Update search results page to respect filter
- Persist filter preference
- Mobile-optimized filter UI

---

## Content Types

| Type       | Icon | Description                  | Default |
| ---------- | ---- | ---------------------------- | ------- |
| All        | 🔍   | Search everything            | ✓       |
| Products   | 📦   | Regular product listings     |         |
| Auctions   | 🔨   | Active and upcoming auctions |         |
| Shops      | 🏪   | Seller shops                 |         |
| Categories | 📂   | Category names               |         |
| Blog       | 📝   | Blog posts and articles      |         |

---

## Features

### F032.1: Content Type Filter UI

**Priority**: P0 (Critical)

Add content type selection to search bar.

#### User Stories

**US032.1.1**: Filter Chips in Search Bar

```
As a user using the search bar
I want to select which content type to search
So that I get relevant results only

Acceptance Criteria:
- Filter chips/tabs below search input
- "All" selected by default
- Can select only one type at a time
- Selected type is visually highlighted
- Filter persists during search session
- Filter shown in search results page
```

**US032.1.2**: Search Bar Dropdown Mode

```
As a user on desktop
I want to select content type from dropdown
So that the search bar stays compact

Acceptance Criteria:
- Dropdown trigger next to search input
- Shows currently selected type icon
- Opens dropdown with all type options
- Each option has icon and label
- Closes on selection
- "All" is the default
```

**US032.1.3**: Mobile Filter Mode

```
As a mobile user searching
I want easy access to content filters
So that I can filter on small screens

Acceptance Criteria:
- Horizontal scrollable chips below search
- All chips visible (scrollable if needed)
- Touch-friendly chip size (44px height)
- Active chip clearly highlighted
- Tap to select, tap again returns to "All"
```

---

### F032.2: Search Results Integration

**Priority**: P0 (Critical)

Update search results to use content filter.

#### User Stories

**US032.2.1**: Filtered Search Results

```
As a user who selected a content type
I want results filtered to that type
So that I see only what I'm looking for

Acceptance Criteria:
- Search API accepts contentType parameter
- Results only show selected type
- Result count reflects filtered total
- Empty state shows for no matching results
- Suggestion to try "All" if no results
```

**US032.2.2**: Content Type in URL

```
As a user sharing a search
I want the filter in the URL
So that shared links respect the filter

Acceptance Criteria:
- URL includes ?type=products (or auctions, etc.)
- Loading page with type param applies filter
- Browser back/forward respects filter
- Changing filter updates URL
```

**US032.2.3**: Result Type Indicators

```
As a user viewing mixed results
I want to see what type each result is
So that I can identify them quickly

Acceptance Criteria:
- Each result card shows type badge
- Type icon or label visible
- Color-coded by type
- Consistent across card designs
```

---

### F032.3: Autocomplete Enhancement

**Priority**: P1 (High)

Update autocomplete to respect content filter.

#### User Stories

**US032.3.1**: Filtered Autocomplete

```
As a user typing in search bar
I want suggestions filtered by selected type
So that suggestions are relevant

Acceptance Criteria:
- Autocomplete respects content type filter
- Shows suggestions only from selected type
- When "All", groups suggestions by type
- Shows type icon next to each suggestion
- Recent searches show original type
```

**US032.3.2**: Type-Specific Placeholders

```
As a user with type selected
I want placeholder text to reflect type
So that I know what I'm searching

Acceptance Criteria:
- Placeholder changes based on type
- "Search products..." for Products
- "Search auctions..." for Auctions
- "Search shops..." for Shops
- "Search everything..." for All
```

---

### F032.4: Quick Type Switching

**Priority**: P1 (High)

Allow quick switching between types in results.

#### User Stories

**US032.4.1**: Type Tabs on Results Page

```
As a user viewing search results
I want to switch content types quickly
So that I can explore different results

Acceptance Criteria:
- Tabs at top of results page
- Each tab shows result count for that type
- Switching tabs filters results instantly
- No page reload needed
- Maintains search query
- Updates URL
```

**US032.4.2**: Type Result Counts

```
As a user searching
I want to see how many results per type
So that I know where to look

Acceptance Criteria:
- Each type tab shows count
- Counts fetched with search (facets)
- Zero counts shown but dimmed
- Real-time update on new search
```

---

## API Changes

### Search Endpoint Update

```typescript
// GET /api/search
interface SearchRequest {
  q: string; // Search query
  type?: ContentType; // Content type filter (NEW)
  page?: number;
  pageSize?: number;
  // ... existing filters
}

type ContentType =
  | "all"
  | "products"
  | "auctions"
  | "shops"
  | "categories"
  | "blog";

interface SearchResponse {
  data: SearchResult[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    query: string;
    type: ContentType; // Applied type (NEW)
    facets: {
      // Result counts per type (NEW)
      products: number;
      auctions: number;
      shops: number;
      categories: number;
      blog: number;
    };
  };
}
```

---

## UI Mockups

### Desktop Search Bar

```
┌─────────────────────────────────────────────────────────┐
│  🔍  Search products, auctions, shops...    [🔨 Auctions ▼]  │
└─────────────────────────────────────────────────────────┘
```

### Mobile Search Bar

```
┌─────────────────────────────────────────┐
│  🔍  Search...                    [🔍]  │
├─────────────────────────────────────────┤
│ [All] [Products] [Auctions] [Shops] → │
└─────────────────────────────────────────┘
```

### Search Results Tabs

```
┌──────┬──────────┬──────────┬───────┬──────────┬──────┐
│ All  │ Products │ Auctions │ Shops │ Categories│ Blog │
│ 156  │    82    │    45    │   12  │     8     │   9  │
└──────┴──────────┴──────────┴───────┴──────────┴──────┘
```

---

## Implementation Checklist

### Phase 1: Search Bar Updates (Week 1)

- [ ] Add content type dropdown to desktop search
- [ ] Add content type chips for mobile search
- [ ] Update SearchBar component
- [ ] Store selected type in state
- [ ] Update placeholder text based on type

### Phase 2: API Integration (Week 1)

- [ ] Update search API to accept type parameter
- [ ] Add facets to search response
- [ ] Update search service
- [ ] Add type-specific search logic

### Phase 3: Results Page (Week 2)

- [ ] Add type tabs to search results page
- [ ] Show result counts per type
- [ ] Update URL with type parameter
- [ ] Handle type switching
- [ ] Update empty states

### Phase 4: Autocomplete (Week 2)

- [ ] Filter autocomplete by type
- [ ] Group suggestions by type (for "All")
- [ ] Show type icons in suggestions

### Phase 5: Testing (Week 3)

- [ ] Unit tests for search bar changes
- [ ] API tests for type filtering
- [ ] E2E tests for search flows
- [ ] Mobile tests

---

## Acceptance Criteria

- [ ] Content type filter visible in header search bar
- [ ] Filter works on desktop and mobile
- [ ] Search results filtered by selected type
- [ ] Type tabs on results page with counts
- [ ] URL reflects selected type
- [ ] Autocomplete respects selected type
- [ ] Empty states handle no results per type
- [ ] Filter persists during session
- [ ] Performance acceptable (no slowdown)

---

## Dependencies

- E015: Search & Discovery
- E031: Searchable Dropdowns (for dropdown implementation)

## Related Epics

- E025: Mobile Component Integration

---

## Test Documentation

**Test Cases**: `TDD/resources/search/CONTENT-FILTER-TEST-CASES.md`
