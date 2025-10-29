# Category Stock-Based Styling and Featured Categories Update

## Overview

Implemented two major improvements:

1. **Stock-based card styling** - Category cards now appear grey when out of stock, colorful when in stock
2. **Database-driven featured categories** - ModernFeaturedCategories now uses actual database data with admin-controlled featured status

## 1. Stock-Based Category Card Styling

### Implementation Details

#### CategoryPageClient.tsx Changes

**Color Logic:**

```typescript
// Check if category has in-stock products
const hasInStockProducts = category.totalProductCount > 0;

// Generate color based on stock availability
const categoryColor = hasInStockProducts
  ? category.featured
    ? theme.palette.primary.main // Featured with stock = primary color
    : theme.palette.secondary.main // Normal with stock = secondary color
  : theme.palette.grey[400]; // No stock = grey
```

**Visual Styling:**

```typescript
sx={{
  backgroundColor: hasInStockProducts
    ? "background.paper"              // Normal background
    : alpha(theme.palette.grey[100], 0.5), // Faded grey background
  borderColor: hasInStockProducts
    ? "divider"
    : theme.palette.grey[300],        // Lighter border for out of stock
  opacity: hasInStockProducts ? 1 : 0.75, // Reduced opacity for out of stock
}}
```

**Button Logic:**

```typescript
// Show "Explore" only if has products
{
  category.totalProductCount > 0 && (
    <Button href={`/products?category=${category.slug}`}>Explore</Button>
  );
}

// Show subcategories only if no products
{
  category.subcategoryCount > 0 && category.totalProductCount === 0 && (
    <Button href={`/categories/${category.slug}`}>Explore</Button>
  );
}
```

### Visual States

| Condition                        | Background | Border   | Opacity | Color     | Button                    |
| -------------------------------- | ---------- | -------- | ------- | --------- | ------------------------- |
| Has in-stock products (featured) | White      | Divider  | 100%    | Primary   | "Explore" → Products      |
| Has in-stock products (normal)   | White      | Divider  | 100%    | Secondary | "Explore" → Products      |
| No products, has subcategories   | Grey       | Grey-300 | 75%     | Grey-400  | "Explore" → Subcategories |
| No products, no subcategories    | Grey       | Grey-300 | 75%     | Grey-400  | No button                 |

### User Experience

1. **Clear Visual Hierarchy:**

   - Colorful cards = products available to buy
   - Grey cards = coming soon or explore subcategories

2. **Smart Navigation:**

   - Products available → routes to product listing
   - Only subcategories → routes to subcategory view
   - Nothing available → no button shown

3. **Consistent Design:**
   - Same hover effects for all cards
   - Gradual opacity changes
   - Color-coded shadows on hover

## 2. Database-Driven Featured Categories

### ModernFeaturedCategories.tsx Changes

**Props Interface:**

```typescript
interface CategoryWithCount extends Category {
  productCount: number;
  inStockCount?: number;
  outOfStockCount?: number;
}

interface ModernFeaturedCategoriesProps {
  categories: CategoryWithCount[];
}
```

**Component Updates:**

- Changed from hardcoded array to prop-based data
- Added grey styling for out-of-stock categories
- Used actual category images or gradient fallback
- Dynamic product counts from database
- Smart explore button (only shows if products available)
- Returns null if no featured categories

**Key Features:**

```typescript
// Filter only featured and active categories
const featuredCategories = categories.filter(
  (cat) => cat.featured && cat.isActive
);

// Dynamic color based on stock
const hasProducts = (category.inStockCount || 0) > 0;
const categoryColor = hasProducts
  ? theme.palette.primary.main
  : theme.palette.grey[400];

// Conditional rendering
{
  hasProducts && (
    <Button href={`/products?category=${category.slug}`}>Explore</Button>
  );
}
```

### Homepage (page.tsx) Updates

**Server Component:**

- Converted to async server component
- Fetches featured categories on server-side
- Passes data to client component

**Data Fetching:**

```typescript
// Get featured categories from Firestore
const categoriesSnapshot = await db
  .collection("categories")
  .where("featured", "==", true)
  .where("isActive", "==", true)
  .orderBy("sortOrder", "asc")
  .limit(6)  // Maximum 6 featured categories
  .get();

// Fetch product counts for each category
for each category:
  - Total product count (active products)
  - In-stock count (active + inStock = true)
  - Out-of-stock count (active + inStock = false)
```

**Error Handling:**

```typescript
try {
  // Fetch data
} catch (error) {
  console.error("Error fetching featured categories:", error);
  // Continue with empty array - component handles gracefully
}
```

## Admin Control

### How to Feature a Category

Admins can now control which categories appear in the featured section:

1. Go to **Admin → Categories**
2. Edit any category
3. Check the **"Featured"** checkbox
4. Ensure **"Active"** status is enabled
5. Set appropriate **"Sort Order"** (lower numbers appear first)
6. Save changes

**Limits:**

- Maximum 6 featured categories displayed
- Ordered by sortOrder field (ascending)
- Only active categories shown
- Grey appearance if no in-stock products

## Benefits

### 1. Stock-Based Styling

✅ Clear visual feedback on product availability  
✅ Reduces user frustration (no clicking on empty categories)  
✅ Encourages exploration of stocked categories  
✅ Professional appearance with grey = "coming soon"

### 2. Database-Driven Featured Categories

✅ Admin control over homepage content  
✅ Real-time product counts  
✅ No code changes needed to update featured items  
✅ Automatic stock-based styling  
✅ Server-side rendering for better SEO  
✅ Graceful error handling

## Technical Details

### Performance Considerations

1. **Server-Side Rendering:**

   - Data fetched at build time / on request
   - No client-side API calls for featured categories
   - Better initial page load performance
   - SEO-friendly (crawlers see content)

2. **Query Optimization:**

   - Limited to 6 categories (limit clause)
   - Indexed queries (featured + isActive)
   - Count aggregations instead of full document fetches
   - Parallel Promise.all for category counts

3. **Caching Opportunities:**
   - Can implement ISR (Incremental Static Regeneration)
   - Cache product counts for performance
   - Consider revalidation strategies

### Database Queries

**Categories Query:**

```typescript
db.collection("categories")
  .where("featured", "==", true)
  .where("isActive", "==", true)
  .orderBy("sortOrder", "asc")
  .limit(6);
```

**Product Count Queries (per category):**

```typescript
// Total active products
db.collection("products")
  .where("categoryId", "==", category.id)
  .where("status", "==", "active")
  .count();

// In-stock products
db.collection("products")
  .where("categoryId", "==", category.id)
  .where("status", "==", "active")
  .where("inStock", "==", true)
  .count();

// Out-of-stock products
db.collection("products")
  .where("categoryId", "==", category.id)
  .where("status", "==", "active")
  .where("inStock", "==", false)
  .count();
```

**Composite Indexes Required:**

1. `categories`: (featured, isActive, sortOrder)
2. `products`: (categoryId, status, inStock)

## Testing Checklist

### Stock-Based Styling

- [x] Category with products shows colorful card
- [x] Category without products shows grey card
- [x] Featured categories use primary color
- [x] Non-featured categories use secondary color
- [x] Out-of-stock categories use grey color
- [x] Explore button shows only with products
- [x] Subcategories button shows when no products
- [x] Hover effects work on all cards
- [x] Opacity is reduced for grey cards

### Featured Categories

- [x] Homepage fetches featured categories
- [x] Only featured + active categories shown
- [x] Maximum 6 categories displayed
- [x] Categories ordered by sortOrder
- [x] Product counts are accurate
- [x] In-stock counts are correct
- [x] Images display or show gradient fallback
- [x] Explore buttons link correctly
- [x] Section hidden if no featured categories
- [x] Error handling works gracefully
- [x] View All button links to /categories

## Future Enhancements

### Stock-Based Styling

1. Add "Low Stock" warning state (yellow)
2. Show stock count badge
3. Add "Notify Me" button for out-of-stock
4. Animate restocking updates
5. Add preorder functionality

### Featured Categories

1. Add drag-and-drop sort order in admin
2. Implement category scheduling (featured date range)
3. Add A/B testing for featured categories
4. Analytics on featured category performance
5. Custom colors per category
6. Featured category carousel
7. Regional featured categories
8. Seasonal featured categories

## Related Files

### Modified:

- `/src/components/categories/CategoryPageClient.tsx` - Stock-based styling
- `/src/components/home/ModernFeaturedCategories.tsx` - Database-driven component
- `/src/app/page.tsx` - Server-side data fetching

### Dependencies:

- `/src/lib/database/admin.ts` - getAdminDb function
- `/src/types/index.ts` - Category type
- Firestore collections: categories, products

## Migration Notes

### Breaking Changes

None - backwards compatible

### Required Database Changes

**Ensure these fields exist in categories:**

- `featured: boolean` - Controls homepage appearance
- `isActive: boolean` - Controls visibility
- `sortOrder: number` - Controls display order

**Ensure these fields exist in products:**

- `categoryId: string` - Links to category
- `status: string` - Product status (should be "active")
- `inStock: boolean` - Stock availability

### Deployment Steps

1. Verify database indexes are created
2. Deploy code changes
3. Test featured category display
4. Mark 6 categories as featured in admin
5. Verify stock-based styling works
6. Monitor performance and error logs

## Support

If categories aren't showing:

1. Check if categories have `featured: true`
2. Verify categories have `isActive: true`
3. Check sortOrder values
4. Verify products have correct categoryId
5. Check Firestore indexes are built
6. Review server logs for errors
