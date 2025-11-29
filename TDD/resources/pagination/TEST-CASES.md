# Sieve Pagination Test Cases

## E026: Sieve-Style Pagination & Filtering

### Unit Tests

#### TC-SIEVE-001: Parse Pagination Parameters

```typescript
describe("parseSieveQuery - Pagination", () => {
  it.todo("should default page to 1 when not specified");
  it.todo("should default pageSize to 20 when not specified");
  it.todo("should cap pageSize at 100");
  it.todo("should parse valid page number");
  it.todo("should parse valid pageSize");
  it.todo("should handle invalid page (return 1)");
  it.todo("should handle negative pageSize (use default)");
});
```

#### TC-SIEVE-002: Parse Sort Parameters

```typescript
describe("parseSieveQuery - Sorting", () => {
  it.todo("should parse single ascending sort");
  it.todo('should parse single descending sort with "-" prefix');
  it.todo("should parse multiple sorts");
  it.todo("should default to createdAt descending");
  it.todo("should ignore invalid field names");
  it.todo("should handle empty sorts parameter");
});
```

#### TC-SIEVE-003: Parse Filter Parameters

```typescript
describe("parseSieveQuery - Filters", () => {
  it.todo("should parse equals operator (==)");
  it.todo("should parse not equals operator (!=)");
  it.todo("should parse greater than operator (>)");
  it.todo("should parse less than operator (<)");
  it.todo("should parse greater than or equal (>=)");
  it.todo("should parse less than or equal (<=)");
  it.todo("should parse contains operator (@=)");
  it.todo("should parse starts with operator (_=)");
  it.todo("should parse ends with operator (_-=)");
  it.todo("should parse case-insensitive contains (@=*)");
  it.todo("should parse null check (==null)");
  it.todo("should parse not null check (!=null)");
  it.todo("should parse AND conditions with comma");
  it.todo("should parse OR conditions with pipe");
  it.todo("should handle escaped characters");
});
```

#### TC-SIEVE-004: Firestore Query Builder

```typescript
describe("applyToFirestore", () => {
  it.todo("should apply equals filter to query");
  it.todo("should apply range filters to query");
  it.todo("should apply orderBy for sorts");
  it.todo("should apply limit for pageSize");
  it.todo("should return filters needing client-side application");
  it.todo("should handle Firestore limitations (composite indexes)");
});
```

### Integration Tests

#### TC-SIEVE-005: Products API with Sieve

```typescript
describe("GET /api/products with Sieve", () => {
  it.todo("should return paginated products with metadata");
  it.todo("should filter by status");
  it.todo("should filter by price range");
  it.todo("should filter by category");
  it.todo("should sort by price ascending");
  it.todo("should sort by createdAt descending");
  it.todo("should return correct totalPages");
  it.todo("should return hasNextPage/hasPreviousPage");
});
```

#### TC-SIEVE-006: Auctions API with Sieve

```typescript
describe("GET /api/auctions with Sieve", () => {
  it.todo("should filter by auction status");
  it.todo("should filter by currentBid range");
  it.todo("should filter ending soon");
  it.todo("should sort by endTime");
  it.todo("should combine multiple filters");
});
```

### Component Tests

#### TC-SIEVE-007: Pagination Component

```typescript
describe("Pagination Component", () => {
  it.todo("should render page numbers");
  it.todo("should highlight current page");
  it.todo("should disable previous on first page");
  it.todo("should disable next on last page");
  it.todo("should show ellipsis for many pages");
  it.todo("should call onPageChange when page clicked");
  it.todo("should support keyboard navigation");
});
```

#### TC-SIEVE-008: PageSizeSelector Component

```typescript
describe("PageSizeSelector Component", () => {
  it.todo("should render page size options");
  it.todo("should show current selection");
  it.todo("should call onChange when option selected");
  it.todo("should persist preference in localStorage");
});
```

#### TC-SIEVE-009: useSieveQuery Hook

```typescript
describe("useSieveQuery Hook", () => {
  it.todo("should initialize with URL params");
  it.todo("should sync state to URL");
  it.todo("should provide setPage function");
  it.todo("should provide setPageSize function");
  it.todo("should provide setSort function");
  it.todo("should provide addFilter function");
  it.todo("should provide removeFilter function");
  it.todo("should reset page to 1 on filter change");
});
```

### E2E Tests

#### TC-SIEVE-010: Products Page Pagination

```typescript
describe("Products Page Pagination E2E", () => {
  it.todo("should display first page of products");
  it.todo("should navigate to next page");
  it.todo("should navigate to specific page");
  it.todo("should update URL with page number");
  it.todo("should restore page from URL on refresh");
});
```

#### TC-SIEVE-011: Admin Table Pagination

```typescript
describe("Admin Users Table E2E", () => {
  it.todo("should paginate user list");
  it.todo("should filter users by role");
  it.todo("should sort users by name");
  it.todo("should combine filters and pagination");
});
```
