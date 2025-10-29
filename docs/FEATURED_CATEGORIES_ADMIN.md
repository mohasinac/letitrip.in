# Featured Categories Admin Page

## Overview
Created a comprehensive admin interface for managing featured categories that appear on the homepage. Admins can now select, reorder, and configure which categories are featured without touching code.

## Features Implemented

### 1. **Featured Categories Management Page**
**Location:** `/admin/settings` (Featured Categories tab)

**Capabilities:**
- ✅ View all categories with product counts
- ✅ Toggle featured status with a switch
- ✅ Reorder featured categories with up/down arrows
- ✅ Toggle active/inactive status
- ✅ Visual warnings for categories exceeding the 6-item limit
- ✅ Batch save all changes at once
- ✅ Reset button to discard unsaved changes
- ✅ Real-time change detection
- ✅ Product and stock count display

### 2. **Batch Update API Endpoint**
**Location:** `/api/admin/categories/batch-update`

**Method:** POST

**Authentication:** Admin role required

**Request Body:**
```typescript
{
  updates: [
    {
      id: string,
      featured?: boolean,
      isActive?: boolean,
      sortOrder?: number
    }
  ]
}
```

**Response:**
```typescript
{
  success: true,
  message: "Updated X categories",
  updatedCount: number
}
```

## User Interface

### Page Structure

```
┌─────────────────────────────────────────────────┐
│  Featured Categories                [Reset] [Save]│
│  Select and order categories...                 │
├─────────────────────────────────────────────────┤
│  💡 Tips: (Info Alert)                          │
│  - Maximum 6 categories shown                   │
│  - Use arrows to reorder                        │
│  - Must be active to appear                     │
├─────────────────────────────────────────────────┤
│  📈 Featured Categories (X/6)                   │
│  ┌───────────────────────────────────────────┐ │
│  │ ↑↓ [Image] Category Name                  │ │
│  │         slug | X products | X in stock    │ │
│  │         [Active ✓] [Featured ✓]          │ │
│  └───────────────────────────────────────────┘ │
│  ...more featured categories...                │
├─────────────────────────────────────────────────┤
│  📁 Available Categories (X)                    │
│  ┌───────────────────────────────────────────┐ │
│  │    [Image] Category Name                  │ │
│  │         slug | X products | X in stock    │ │
│  │         [Active ✓] [Featured ☐]          │ │
│  └───────────────────────────────────────────┘ │
│  ...more available categories...               │
└─────────────────────────────────────────────────┘
```

### Category Card Components

Each category displays:
- **Image:** 60x60px thumbnail or placeholder icon
- **Name:** Category name in bold
- **Slug:** Monospace font for easy identification
- **Chips:**
  - Product count (total products)
  - Stock count (in-stock products) - green if >0
- **Controls:**
  - Active/Inactive toggle switch
  - Featured toggle switch
- **Reorder arrows:** (Only for featured categories)
  - Up arrow (disabled if first)
  - Down arrow (disabled if last)

### Visual Indicators

1. **Featured Section:**
   - Shows count (X/6)
   - Warning chip if exceeds 6 items
   - Yellow border for items beyond position 6

2. **Reordering:**
   - Drag indicator icons (up/down arrows)
   - Disabled state for boundary items
   - Instant visual feedback

3. **Status Changes:**
   - Unsaved changes enable Save/Reset buttons
   - Success/error alerts at top
   - Loading spinner during save

## Integration

### Admin Settings Tab
Added as third tab in `/admin/settings`:
1. Theme
2. Hero Slides
3. **Featured Categories** ⭐ NEW

### Navigation Path
```
Admin Dashboard → Settings → Featured Categories
```

## Usage Workflow

### Featuring a Category
1. Navigate to Admin → Settings → Featured Categories
2. Find category in "Available Categories" section
3. Toggle the "Featured" switch ON
4. Category moves to "Featured Categories" section
5. Click "Save Changes"

### Reordering Featured Categories
1. Click up ↑ arrow to move category higher (left on homepage)
2. Click down ↓ arrow to move category lower (right on homepage)
3. Order changes are reflected immediately
4. Click "Save Changes" to persist

### Disabling a Category
1. Toggle the "Active" switch OFF
2. Category won't appear on homepage even if featured
3. Click "Save Changes"

### Removing from Featured
1. Toggle the "Featured" switch OFF
2. Category moves to "Available Categories"
3. Click "Save Changes"

## Technical Implementation

### Components

**1. FeaturedCategoriesSettings.tsx**
```typescript
// Main component with state management
- fetchCategories() - Loads all categories with counts
- handleToggleFeatured() - Toggles featured status
- handleToggleActive() - Toggles active status
- handleMoveUp() - Moves category up in order
- handleMoveDown() - Moves category down in order
- handleSave() - Batch saves all changes
- handleReset() - Reloads original data
```

**2. CategoryItem Component**
```typescript
// Individual category card with controls
Props:
- category: CategoryWithMeta
- index: number
- totalCount: number
- onToggleFeatured: (id) => void
- onToggleActive: (id) => void
- onMoveUp: (index) => void
- onMoveDown: (index) => void
- isFeatured: boolean
- showWarning?: boolean
```

### API Endpoint

**batch-update/route.ts**
```typescript
- Verifies admin authentication
- Validates request body
- Uses Firestore batch writes
- Updates multiple categories atomically
- Returns success/error response
```

### State Management

**Local State:**
```typescript
categories: CategoryWithMeta[]  // All categories
loading: boolean                // Initial load state
saving: boolean                 // Save operation state
error: string | null            // Error messages
success: string | null          // Success messages
hasChanges: boolean             // Track unsaved changes
```

**Derived State:**
```typescript
featuredCategories = categories.filter(cat => cat.featured)
nonFeaturedCategories = categories.filter(cat => !cat.featured)
```

## Data Flow

```
1. Page Load
   ↓
2. Fetch Categories (/api/admin/categories)
   ↓
3. Sort by featured + sortOrder
   ↓
4. Display in two sections
   ↓
5. User makes changes (local state only)
   ↓
6. hasChanges = true (enables Save button)
   ↓
7. Click Save → Batch Update API
   ↓
8. API validates & updates Firestore
   ↓
9. Success → Refresh data & show message
```

## Database Updates

### Batch Operation
Updates three fields per category:
- `featured: boolean`
- `isActive: boolean`  
- `sortOrder: number`
- `updatedAt: ISO string`

### Firestore Structure
```typescript
categories/{categoryId}
{
  name: string,
  slug: string,
  featured: boolean,     // Controls homepage display
  isActive: boolean,     // Controls visibility
  sortOrder: number,     // Display order (0-based)
  productCount: number,  // Computed from products
  inStockCount: number,  // Computed from products
  ...other fields
}
```

## Error Handling

### Frontend
- Network errors → Alert message
- API errors → Alert message with details
- Loading states → Spinner or disabled buttons
- Validation → Inline feedback

### Backend
- Authentication check → 401 Unauthorized
- Authorization check → 403 Forbidden
- Invalid data → 400 Bad Request
- Server errors → 500 Internal Server Error

### Edge Cases
- No categories → "No categories" message
- All featured → "All featured" message
- Exceeds 6 → Visual warning (won't prevent save)
- Network timeout → Error alert with retry option

## Performance Considerations

### Optimizations
1. **Single API Call:** Batch update instead of multiple requests
2. **Optimistic UI:** Immediate visual feedback before save
3. **Lazy Loading:** Only fetch when tab is accessed
4. **Memoization:** React hooks prevent unnecessary rerenders
5. **Firestore Batch:** Atomic updates for consistency

### Potential Improvements
1. **Drag & Drop:** Replace arrows with drag-and-drop
2. **Preview:** Live preview of how homepage will look
3. **History:** Track changes history
4. **Bulk Actions:** Select multiple categories
5. **Search/Filter:** Filter by name, stock status
6. **Analytics:** Track which featured categories perform best

## Testing Checklist

- [x] Load categories successfully
- [x] Toggle featured status
- [x] Toggle active status
- [x] Reorder with up arrow
- [x] Reorder with down arrow
- [x] Save changes successfully
- [x] Reset discards changes
- [x] Show warning for 7+ featured
- [x] Disable arrows at boundaries
- [x] Display product counts
- [x] Display stock counts
- [x] Show success message
- [x] Show error message
- [x] Handle authentication
- [x] Handle authorization
- [x] Batch update API works
- [x] Changes reflect on homepage

## Files Created/Modified

### New Files
1. `/src/app/admin/settings/featured-categories/page.tsx` - Standalone page
2. `/src/components/admin/settings/FeaturedCategoriesSettings.tsx` - Reusable component
3. `/src/app/api/admin/categories/batch-update/route.ts` - API endpoint

### Modified Files
1. `/src/app/admin/settings/page.tsx` - Added Featured Categories tab

## Related Documentation

- [STOCK_BASED_CATEGORIES.md](./STOCK_BASED_CATEGORIES.md) - Stock-based styling
- [CATEGORY_SEARCH_FEATURE.md](./CATEGORY_SEARCH_FEATURE.md) - Category search
- [MODERN_CATEGORY_STYLING.md](./MODERN_CATEGORY_STYLING.md) - Modern UI

## Access Control

### Required Permissions
- **Role:** Admin
- **Path:** `/admin/settings` or `/admin/settings/featured-categories`
- **API:** Admin authentication via `verifyAdmin()`

### Security
- ✅ RoleGuard component wraps page
- ✅ API verifies admin role
- ✅ Firestore rules should enforce admin-only writes
- ✅ Client-side state isolated (no XSS risk)

## Future Enhancements

### Phase 1 (Current)
- ✅ Basic featured selection
- ✅ Manual ordering with arrows
- ✅ Active/inactive toggle
- ✅ Batch save

### Phase 2 (Planned)
- Drag & drop reordering
- Category preview modal
- Bulk actions (select multiple)
- Search and filters
- Sort options

### Phase 3 (Future)
- Scheduling (feature for date range)
- A/B testing variants
- Analytics integration
- Custom colors per category
- Regional featured categories
- Automated suggestions based on performance

## Troubleshooting

### Categories not saving
1. Check browser console for errors
2. Verify admin authentication
3. Check network tab for API response
4. Verify Firestore permissions

### Categories not showing on homepage
1. Ensure featured = true
2. Ensure isActive = true
3. Check if exceeds 6-item limit
4. Verify homepage fetches correctly
5. Check browser cache

### Order not updating
1. Ensure Save was clicked
2. Check sortOrder values in database
3. Verify batch update completed
4. Refresh page to see changes

### TypeScript errors
If you see "Cannot find module" errors:
1. Restart TypeScript server
2. Delete `.next` folder and rebuild
3. Check import paths are correct
4. Verify file exists at specified path

## Support

For issues or questions:
1. Check console for error messages
2. Verify authentication and permissions
3. Check Firestore rules
4. Review API endpoint logs
5. Contact development team
