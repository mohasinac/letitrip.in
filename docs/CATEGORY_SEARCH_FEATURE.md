# Category Search Feature

## Overview

Added comprehensive search functionality to both the admin panel and public categories page, allowing users to search for categories by name, slug, and description.

## Implementation Details

### 1. Admin Panel - Tree View (`CategoryTreeView.tsx`)

**Location:** `/src/components/admin/categories/CategoryTreeView.tsx`

**Features:**

- Search bar with icon at the top of the tree view
- Real-time filtering as users type
- Searches through: category name and slug
- Intelligent tree filtering:
  - Shows categories that match the search term
  - Shows parent categories if their children match
  - Auto-expands tree nodes when search is active
  - Maintains hierarchy visibility
- Smooth search experience with instant feedback

**Implementation:**

```typescript
// Search state
const [searchTerm, setSearchTerm] = useState("");

// Recursive matching logic
const matchesSearch = useMemo(() => {
  if (!searchTerm) return true;

  const searchLower = searchTerm.toLowerCase();
  const directMatch =
    category.name.toLowerCase().includes(searchLower) ||
    category.slug.toLowerCase().includes(searchLower);

  if (directMatch) return true;

  // Check if any descendant matches
  return hasMatchingDescendant(children);
}, [category, searchTerm, children, allCategories]);
```

### 2. Admin Panel - List View (`CategoryListView.tsx`)

**Location:** `/src/components/admin/categories/CategoryListView.tsx`

**Features:**

- Already had search functionality implemented
- Search bar with pagination
- Searches through: category name and slug
- Integrated with table pagination
- Shows filtered results count

### 3. Public Categories Page (`CategoryPageClient.tsx`)

**Location:** `/src/components/categories/CategoryPageClient.tsx`

**Features:**

- Prominent search bar below the page header
- Searches through: category name, slug, and description
- Real-time filtering of displayed categories
- Result count indicator showing:
  - Number of categories found when searching
  - "No categories found" message when no results
- Enhanced UX with styled input field
- Clear visual feedback with search results count

**Implementation:**

```typescript
// Search state
const [searchTerm, setSearchTerm] = useState("");

// Filter logic
const displayCategories = useMemo(() => {
  let categories: CategoryWithCounts[];

  // Get base categories (root or subcategories)
  if (!currentCategory) {
    categories = allCategories.filter(
      (cat) => !cat.parentIds || cat.parentIds.length === 0
    );
  } else {
    categories = allCategories.filter((cat) =>
      cat.parentIds?.includes(currentCategory.id)
    );
  }

  // Apply search filter
  if (searchTerm) {
    const searchLower = searchTerm.toLowerCase();
    categories = categories.filter(
      (cat) =>
        cat.name.toLowerCase().includes(searchLower) ||
        cat.slug.toLowerCase().includes(searchLower) ||
        cat.description?.toLowerCase().includes(searchLower)
    );
  }

  return categories;
}, [allCategories, currentCategory, searchTerm]);
```

## User Experience

### Admin Panel

1. **Tree View:**

   - Type in the search bar to filter the category tree
   - Matching categories and their ancestors remain visible
   - Tree auto-expands to show matching results
   - Clear the search to see all categories again

2. **List View:**
   - Type in the search bar to filter the table
   - Results update instantly
   - Pagination resets to first page on search
   - Shows total filtered count

### Public Page

1. Users can search categories while browsing
2. Search works on both root categories and subcategories
3. Result count provides immediate feedback
4. Empty state message adapts to show "no results" when searching
5. Clear search to return to normal view

## Search Fields

| Location        | Searches In             |
| --------------- | ----------------------- |
| Admin Tree View | Name, Slug              |
| Admin List View | Name, Slug              |
| Public Page     | Name, Slug, Description |

## Technical Notes

- All search is **case-insensitive**
- Search is **instant** (no debouncing needed for this dataset size)
- Uses React `useMemo` for performance optimization
- Search state is local to each component (independent searches)
- Tree view uses recursive descendant matching for intelligent filtering
- Public page includes description in search for better discoverability

## Future Enhancements

Potential improvements:

1. Add search debouncing for very large datasets
2. Add fuzzy search capabilities
3. Highlight matching text in results
4. Add advanced filters (active/inactive, featured, product count ranges)
5. Add keyboard shortcuts (Ctrl+K to focus search)
6. Save recent searches
7. Add search suggestions/autocomplete
8. Cross-category search (search all categories regardless of hierarchy level)

## Testing Checklist

- [x] Admin tree view search filters correctly
- [x] Admin tree view shows matching descendants
- [x] Admin tree view auto-expands on search
- [x] Admin list view search works with pagination
- [x] Public page search filters root categories
- [x] Public page search filters subcategories
- [x] Public page shows result count
- [x] Empty states show appropriate messages
- [x] Search is case-insensitive
- [x] Clearing search restores original view
- [x] No TypeScript errors
- [x] No console errors

## Related Files

### Modified Files:

1. `/src/components/admin/categories/CategoryTreeView.tsx`
2. `/src/components/categories/CategoryPageClient.tsx`

### Unchanged Files (Already Had Search):

1. `/src/components/admin/categories/CategoryListView.tsx`

### Dependencies Added:

- `TextField` from MUI
- `InputAdornment` from MUI
- `Search as SearchIcon` from MUI icons
- `useState` from React

## Screenshots Locations

When testing, verify:

- Search bar appearance and styling
- Result filtering behavior
- Result count display
- Empty state messages
- Tree expansion behavior (admin)
- Pagination reset (admin list view)
