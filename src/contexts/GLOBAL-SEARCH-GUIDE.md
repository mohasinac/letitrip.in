# GlobalSearchContext - Documentation

## Overview

**GlobalSearchContext** is a site-wide search management context that centralizes global search functionality, making it accessible from any component in the application.

## Files Created/Modified

### Created

- [src/contexts/GlobalSearchContext.tsx](src/contexts/GlobalSearchContext.tsx) - Context, provider, and hook

### Modified

- [src/app/layout.tsx](src/app/layout.tsx) - Added GlobalSearchProvider wrapper
- [src/components/layout/SearchBar.tsx](src/components/layout/SearchBar.tsx) - Integrated useGlobalSearch hook

## Component Hierarchy

```
RootLayout
├── I18nProvider
│   └── ThemeProvider
│       └── AuthProvider
│           └── GlobalSearchProvider ← NEW
│               └── LoginRegisterProvider
│                   └── ComparisonProvider
│                       └── ViewingHistoryProvider
│                           └── Children
```

## API Reference

### GlobalSearchProvider

Wraps the entire app to provide search context to all components.

```tsx
import { GlobalSearchProvider } from "@/contexts/GlobalSearchContext";

<GlobalSearchProvider>{children}</GlobalSearchProvider>;
```

### useGlobalSearch Hook

Access global search from any component.

```tsx
import { useGlobalSearch } from "@/contexts/GlobalSearchContext";

const MyComponent = () => {
  const {
    searchQuery, // Current search query string
    searchResults, // Array of SearchResult items
    isSearching, // Whether search is active
    isLoading, // Whether API call is in progress
    error, // Error message if search failed
    handleSearch, // Async function to perform search
    clearSearch, // Function to clear all search state
    setSearchQuery, // Function to update search query
  } = useGlobalSearch();

  // Perform search
  const performSearch = async () => {
    await handleSearch("laptop", "product");
  };

  // Clear search
  const clear = () => clearSearch();

  return <div>{/* Your component JSX */}</div>;
};
```

## SearchResult Interface

```tsx
interface SearchResult {
  id: string;
  title: string;
  description?: string;
  image?: string;
  type: "product" | "auction" | "shop" | "blog" | "category";
  path: string;
  price?: number;
  rating?: number;
}
```

## Usage Example

### In Header/SearchBar Component

```tsx
const { searchQuery, setSearchQuery, handleSearch } = useGlobalSearch();

const onSearch = async () => {
  await handleSearch(searchQuery, "product");
  // Results available in searchResults
};
```

### On Search Results Page

```tsx
import { useGlobalSearch } from "@/contexts/GlobalSearchContext";

export default function SearchResultsPage() {
  const { searchQuery, searchResults, isLoading, error } = useGlobalSearch();

  return (
    <div>
      <h1>Results for "{searchQuery}"</h1>
      {isLoading && <p>Searching...</p>}
      {error && <p>Error: {error}</p>}
      <div className="results">
        {searchResults.map((result) => (
          <SearchResultCard key={result.id} result={result} />
        ))}
      </div>
    </div>
  );
}
```

## Features

✅ **Global State** - Search state accessible from any component  
✅ **API Integration** - Calls `/api/search` endpoint with query and type filters  
✅ **Loading States** - Distinguishes between searching and loading  
✅ **Error Handling** - Captures and provides error messages  
✅ **Clear Method** - Resets all search state  
✅ **Type Safety** - Full TypeScript support with SearchResult interface

## How SearchBar Uses It

The SearchBar component now:

1. Gets `searchQuery`, `setSearchQuery`, and `handleSearch` from context
2. Maintains local state only for UI concerns (suggestions, content type, selected index)
3. Calls `handleGlobalSearch()` when user submits search
4. Navigates to results page while storing results in global context

This separation allows the search results page to display results without needing to fetch again.

## Current Search Flow

```
User types in SearchBar
          ↓
[Local] Shows suggestions (searchNavigationRoutes)
          ↓
User presses Enter/clicks Search
          ↓
[Global] handleSearch() called with query + type
          ↓
API request to /api/search
          ↓
Results stored in global searchResults
          ↓
Navigate to /search?q=...&type=...
          ↓
SearchResultsPage reads from useGlobalSearch()
```

## Integration Points

- **Header**: SearchBar component
- **Search Results Page**: `/app/search/page.tsx` (can use useGlobalSearch to display results)
- **Any Page**: Any component can call `useGlobalSearch()` to access search state

## Notes

- Filters **do NOT persist** between page navigations (as required)
- Global search is **separate from** list-level filters (handled by useResourceListState)
- Each search overwrites previous results
- Clear search manually or with `clearSearch()` function

## Next Steps

1. Ensure `/api/search` endpoint exists and returns results matching SearchResult interface
2. Update search results page to use `useGlobalSearch()` hook
3. Optionally add search history/suggestions context if needed later
