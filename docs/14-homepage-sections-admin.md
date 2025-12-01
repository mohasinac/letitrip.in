# Homepage Sections Admin Setup

## Status: ✅ Complete

### Completed

1. **Featured Sections Now Use Admin Curation** ✅

   - Components first check for admin-curated items from `/homepage` API
   - Fallback to `featured: true` query if no curated items exist
   - Admin curation now takes effect on homepage display

2. **Batch APIs Created** ✅

   - `POST /api/products/batch` - Fetch multiple products by IDs
   - `POST /api/auctions/batch` - Fetch multiple auctions by IDs
   - `POST /api/shops/batch` - Fetch multiple shops by IDs
   - `POST /api/categories/batch` - Fetch multiple categories by IDs

3. **Service Methods Added** ✅

   - `productsService.getByIds(ids)` - Batch fetch products
   - `auctionsService.getByIds(ids)` - Batch fetch auctions
   - `shopsService.getByIds(ids)` - Batch fetch shops
   - `categoriesService.getByIds(ids)` - Batch fetch categories

4. **Components Accept Limit Props** ✅

   - `FeaturedProductsSection({ maxProducts })`
   - `FeaturedAuctionsSection({ maxAuctions })`
   - `FeaturedShopsSection({ maxShops, productsPerShop })`
   - `FeaturedCategoriesSection({ maxCategories, productsPerCategory })`

5. **Section Ordering (Phase 4)** ✅
   - Homepage sections now render dynamically based on `sectionOrder` from settings
   - Admin can reorder sections using up/down arrows in `/admin/homepage`
   - Section order is saved to settings and persists

---

## Current Flow (Fixed)

```
Admin: Curates featured items → Saves to homepage.featuredItems
Homepage: Loads FeaturedProductsSection → Checks featuredItems first
If curated items exist → Uses admin-curated products
If no curated items → Falls back to featured=true query
Result: Admin curation displayed ✅
```

---

## Implementation Details

### Featured Sections Components Updated

**FeaturedProductsSection** - `src/components/layout/FeaturedProductsSection.tsx`

```typescript
// First try admin-curated items
const response = await apiService.get("/homepage");
const featuredItems = response.data?.featuredItems?.products || [];

if (activeItems.length > 0) {
  const productIds = activeItems.map((item) => item.itemId);
  curatedProducts = await productsService.getByIds(productIds);
}

// Fallback if no curated items
if (curatedProducts.length === 0) {
  const response = await productsService.list({
    featured: true,
    limit: maxProducts,
  });
  setProducts(response.data);
}
```

### 2. Add Products API for Bulk Fetch

```typescript
// src/services/products.service.ts
async getByIds(ids: string[]): Promise<ProductFE[]> {
  return apiService.post('/products/batch', { ids });
}
```

### 3. Update Homepage Settings Service

```typescript
interface FeaturedItem {
  id: string;
  type: "product" | "auction" | "shop" | "category";
  title: string;
  image?: string;
  order: number;
  isActive: boolean;
}

interface HomepageSettings {
  // ... existing fields
  featuredItems: {
    products: FeaturedItem[];
    auctions: FeaturedItem[];
    shops: FeaturedItem[];
    categories: FeaturedItem[];
  };
}
```

### 4. Create Category Featured Products

Each featured category shows products under it:

```typescript
// FeaturedCategoriesSection
for (const category of featuredCategories) {
  const products = await productsService.list({
    categoryId: category.id,
    limit: settings.sections.featuredCategories.productsPerCategory || 10,
  });
  category.products = products;
}
```

### 5. Create Shop Featured Products

Each featured shop shows products:

```typescript
// FeaturedShopsSection
for (const shop of featuredShops) {
  const products = await productsService.list({
    shopId: shop.id,
    limit: settings.sections.featuredShops.productsPerShop || 10,
  });
  shop.products = products;
}
```

---

## Admin UI Updates

### Featured Sections Page (`/admin/featured-sections`)

Current:

- Single list mixing all types
- Drag to reorder

Update to:

- **Tabbed interface** by type (Products | Categories | Shops | Auctions)
- Search within each type
- Show current items with:
  - Thumbnail
  - Title
  - Active toggle
  - Drag handle for reorder
  - Remove button
- "Add Featured" button opens search modal

### Homepage Settings Page (`/admin/homepage`)

Add:

- Section order drag-and-drop
- Per-section limits input
- Preview button to see homepage

---

## Implementation Checklist

### Phase 1: Fix Data Flow

- [ ] Update FeaturedProductsSection to use featuredItems
- [ ] Update FeaturedAuctionsSection to use featuredItems
- [ ] Update FeaturedShopsSection to use featuredItems
- [ ] Update FeaturedCategoriesSection to use featuredItems
- [ ] Pass section limits from settings to components

### Phase 2: Add Batch APIs

- [ ] Add `POST /api/products/batch` for bulk fetch
- [ ] Add `POST /api/auctions/batch` for bulk fetch
- [ ] Add `POST /api/shops/batch` for bulk fetch
- [ ] Add `POST /api/categories/batch` for bulk fetch

### Phase 3: Category & Shop Products

- [ ] Show products under each featured category
- [ ] Show products under each featured shop
- [ ] Respect `productsPerCategory` and `productsPerShop` limits

### Phase 4: Section Ordering

- [ ] Implement section order from settings
- [ ] Add drag-and-drop to homepage settings

### Phase 5: Dark Mode

- [ ] Verify all featured section components have dark mode
- [ ] Update any missing dark mode classes

---

## File Changes

1. `src/components/layout/FeaturedProductsSection.tsx` - Use featuredItems
2. `src/components/layout/FeaturedAuctionsSection.tsx` - Use featuredItems
3. `src/components/layout/FeaturedShopsSection.tsx` - Use featuredItems + products
4. `src/components/layout/FeaturedCategoriesSection.tsx` - Use featuredItems + products
5. `src/app/page.tsx` - Implement section ordering
6. `src/services/products.service.ts` - Add getByIds
7. `src/app/admin/featured-sections/page.tsx` - Tabbed interface
8. `src/app/admin/homepage/page.tsx` - Section ordering UI
