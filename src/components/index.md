# Components Index

## Loading Skeletons

### Skeleton Components

**Directory**: [skeletons/](skeletons/)
**Status**: ✅ Complete

Loading skeleton components that match the layout of actual components for seamless loading states.

**Components**:

- **ProductCardSkeleton** - Skeleton for product card in grid view
  - Matches ProductCard layout with image, title, price, rating, shop name, and actions
  - ProductCardSkeletonGrid for grid layouts (configurable count)
- **ProductListSkeleton** - Skeleton for product list view
  - Horizontal layout with image, details, price, rating, shop info, and actions
  - ProductListSkeletonList for list layouts (configurable count)
- **UserProfileSkeleton** - Skeleton for user profile page
  - Profile header with avatar, user info, and stats
  - Personal and address information sections
  - Recent activity section
- **OrderCardSkeleton** - Skeleton for order cards
  - Order header with ID, date, and status badge
  - Order items with images and details
  - Order footer with total and actions
  - OrderCardSkeletonList for multiple orders (configurable count)

**Features**:

- ✅ Tailwind CSS animate-pulse animation
- ✅ Matches actual component dimensions and spacing
- ✅ Gray color scheme (gray-200) for neutral appearance
- ✅ Configurable count for grid/list variants
- ✅ Responsive design matching actual components
- ✅ No dependencies beyond Tailwind CSS

**Usage**:

```tsx
import { ProductCardSkeletonGrid, ProductListSkeletonList } from "@/components/skeletons";

// Product grid loading state
<ProductCardSkeletonGrid count={8} />

// Product list loading state
<ProductListSkeletonList count={5} />

// Single skeletons
<ProductCardSkeleton />
<OrderCardSkeleton />
<UserProfileSkeleton />
```

---

## Error Handling

### ErrorBoundary

**File**: [error-boundary.tsx](error-boundary.tsx)
**Status**: ✅ Complete

React 19 Error Boundary implementation with:

- Class component with componentDidCatch lifecycle
- Error logging integration via logServiceError
- Reset functionality (resetErrorBoundary method)
- Default error fallback UI with error display
- Custom fallback support via props
- Development mode error details (stack trace)
- Section-specific error boundary wrapper

**Usage**:

```tsx
// Global app wrapper
<ErrorBoundary>
  <App />
</ErrorBoundary>

// With custom fallback
<ErrorBoundary fallback={(error, reset) => <CustomUI error={error} onReset={reset} />}>
  <Component />
</ErrorBoundary>

// Section-specific boundary
<SectionErrorBoundary sectionName="Product List">
  <ProductList />
</SectionErrorBoundary>
```

**Features**:

- Integrates with typed error system (isAppError)
- Error logger integration
- Graceful error recovery with retry
- User-friendly error messages
- Development vs production modes
- Go home and contact support actions

---

## Search Components

### Search Bar, Filters, and Results

**Directory**: [search/](search/)
**Status**: ✅ Complete (Task 12.2 - January 11, 2026)

Advanced search components integrated with the search service featuring autocomplete, filtering, and result display.

**Components**:

- **SearchBar** - Advanced search input with autocomplete
  - Real-time autocomplete suggestions
  - Search history display (last 5 searches)
  - Trending searches display (top 5)
  - Keyboard navigation (arrow keys, enter, escape)
  - Debounced input (300ms)
  - Clear button
  - Loading indicator
  - Click-outside to close
  - Suggestion icons by type (product/shop/category/keyword)
  - Result counts for each suggestion
- **SearchFilters** - Collapsible filter panel
  - Sort options (relevance, price asc/desc, rating, newest, popular)
  - Price range (min/max inputs)
  - Minimum rating filter (1-4 stars with "& up")
  - Availability toggle (In Stock Only)
  - Category dropdown
  - Shop dropdown
  - Search options (Fuzzy Matching, Exact Match Only)
  - Expandable sections
  - Clear all filters button
  - Active filters indicator
- **SearchResults** - Results display with pagination
  - Separate sections for categories, shops, products
  - Result counts per section
  - Grid layouts (responsive)
  - Loading state with spinner
  - Empty state with clear action
  - Pagination controls (previous/next + page numbers)
  - Results per page info
  - Click handlers for products, shops, categories

**Type Integration**:

All components use types from `@/services/search.service`:

- `AdvancedSearchFilters` - Filter configuration
- `SearchSuggestion` - Autocomplete suggestion format
- Plus types from frontend types (ProductFE, ShopCardFE, CategoryFE)

**Features**:

- ✅ Full integration with advanced search service
- ✅ Autocomplete with debouncing (300ms delay)
- ✅ Search history persistence (localStorage, max 50)
- ✅ Trending searches from server
- ✅ Keyboard navigation in autocomplete
- ✅ Real-time suggestion updates
- ✅ Advanced filtering (price, rating, availability, category, shop, sort)
- ✅ Fuzzy matching and exact match options
- ✅ Collapsible filter sections
- ✅ Clear filters functionality
- ✅ Pagination with page numbers
- ✅ Loading and empty states
- ✅ Responsive grid layouts
- ✅ Click tracking integration ready

**Usage**:

```tsx
import { SearchBar, SearchFilters, SearchResults } from "@/components/search";
import { searchService } from "@/services/search.service";
import type { AdvancedSearchFilters } from "@/services/search.service";

function SearchPage() {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<AdvancedSearchFilters>({ q: "" });
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (searchQuery: string) => {
    setQuery(searchQuery);
    setLoading(true);
    const data = await searchService.advancedSearch({
      ...filters,
      q: searchQuery,
    });
    setResults(data);
    setLoading(false);
  };

  return (
    <div className="container mx-auto py-8">
      <SearchBar
        initialQuery={query}
        onSearch={handleSearch}
        showTrending
        showHistory
        autoFocus
      />

      <div className="grid grid-cols-4 gap-6 mt-6">
        <aside className="col-span-1">
          <SearchFilters
            filters={filters}
            onFiltersChange={setFilters}
            categories={categories}
            shops={shops}
          />
        </aside>

        <main className="col-span-3">
          <SearchResults
            products={results?.products}
            shops={results?.shops}
            categories={results?.categories}
            total={results?.total || 0}
            loading={loading}
            query={query}
            currentPage={filters.page}
            pageSize={filters.limit}
            onPageChange={(page) => setFilters({ ...filters, page })}
            onProductClick={(product) => {
              searchService.trackClick(query, product.id, "product");
              router.push(`/products/${product.slug}`);
            }}
          />
        </main>
      </div>
    </div>
  );
}
```
