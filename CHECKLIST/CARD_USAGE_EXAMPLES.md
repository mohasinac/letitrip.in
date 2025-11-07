# Card Components - Usage Examples

Quick reference guide for using card components in justforview.in.

---

## Import Components

```typescript
import {
  ProductCard,
  ShopCard,
  CategoryCard,
  ProductCardSkeleton,
  ShopCardSkeleton,
  CategoryCardSkeleton,
  CardGrid,
  ProductQuickView,
} from "@/components/cards";
```

---

## Basic Examples

### Product Card

```tsx
<ProductCard
  id="prod-123"
  name="Sony WH-1000XM5 Headphones"
  slug="sony-wh-1000xm5"
  price={29990}
  originalPrice={34990}
  image="/products/sony-headphones.jpg"
  rating={4.8}
  reviewCount={256}
  shopName="TechZone Japan"
  shopSlug="techzone-japan"
  inStock={true}
  onAddToCart={(id) => console.log("Add to cart:", id)}
  onToggleFavorite={(id) => console.log("Favorite:", id)}
  onQuickView={(id) => console.log("Quick view:", id)}
/>
```

### Shop Card

```tsx
<ShopCard
  id="shop-456"
  name="TechZone Japan"
  slug="techzone-japan"
  logo="/shops/techzone-logo.jpg"
  banner="/shops/techzone-banner.jpg"
  description="Premium Japanese electronics"
  rating={4.9}
  reviewCount={1024}
  productCount={256}
  location="Tokyo, Japan"
  isVerified={true}
  isFeatured={true}
  categories={["Electronics", "Audio", "Cameras"]}
  onFollow={(id) => console.log("Follow:", id)}
  showBanner={true}
/>
```

### Category Card

```tsx
// Large variant (homepage featured)
<CategoryCard
  id="cat-789"
  name="Electronics"
  slug="electronics"
  image="/categories/electronics.jpg"
  description="Latest gadgets from Japan"
  productCount={1580}
  isFeatured={true}
  variant="large"
/>

// Compact variant (category grid)
<CategoryCard
  id="cat-790"
  name="Audio"
  slug="audio"
  image="/categories/audio.jpg"
  productCount={420}
  variant="compact"
/>
```

---

## Grid Layouts

### Product Grid (Default)

```tsx
<CardGrid>
  {products.map((product) => (
    <ProductCard key={product.id} {...product} />
  ))}
</CardGrid>
```

### Shop Grid (2 columns on tablet, 3 on desktop)

```tsx
<CardGrid columns={{ xs: 1, sm: 2, md: 2, lg: 3 }}>
  {shops.map((shop) => (
    <ShopCard key={shop.id} {...shop} />
  ))}
</CardGrid>
```

### Category Grid (6 columns desktop)

```tsx
<CardGrid columns={{ xs: 2, sm: 3, md: 4, lg: 6 }} gap="md">
  {categories.map((category) => (
    <CategoryCard key={category.id} {...category} variant="compact" />
  ))}
</CardGrid>
```

---

## Loading States

### Product Loading

```tsx
function ProductGrid({ products, isLoading }) {
  return (
    <CardGrid>
      {isLoading
        ? Array.from({ length: 8 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))
        : products.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
    </CardGrid>
  );
}
```

### Shop Loading

```tsx
{
  isLoading ? (
    <CardGrid columns={{ xs: 1, sm: 2, lg: 3 }}>
      {Array.from({ length: 6 }).map((_, i) => (
        <ShopCardSkeleton key={i} showBanner />
      ))}
    </CardGrid>
  ) : (
    <CardGrid columns={{ xs: 1, sm: 2, lg: 3 }}>
      {shops.map((shop) => (
        <ShopCard key={shop.id} {...shop} />
      ))}
    </CardGrid>
  );
}
```

---

## Quick View Modal

### With State Management

```tsx
import { useState } from "react";

function ProductListing({ products }) {
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  return (
    <>
      <CardGrid>
        {products.map((product) => (
          <ProductCard
            key={product.id}
            {...product}
            onQuickView={() => setQuickViewProduct(product)}
          />
        ))}
      </CardGrid>

      {quickViewProduct && (
        <ProductQuickView
          product={quickViewProduct}
          isOpen={!!quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
          onAddToCart={(id, quantity) => {
            console.log("Add to cart:", id, quantity);
            setQuickViewProduct(null);
          }}
        />
      )}
    </>
  );
}
```

---

## Advanced Patterns

### Product Card with All Features

```tsx
<ProductCard
  id="prod-123"
  name="Sony WH-1000XM5 Wireless Headphones"
  slug="sony-wh-1000xm5"
  price={29990}
  originalPrice={34990}
  image="/products/sony-headphones.jpg"
  rating={4.8}
  reviewCount={256}
  shopName="TechZone Japan"
  shopSlug="techzone-japan"
  inStock={true}
  isFeatured={true}
  condition="new"
  onAddToCart={handleAddToCart}
  onToggleFavorite={handleToggleFavorite}
  onQuickView={handleQuickView}
  isFavorite={favoriteIds.includes("prod-123")}
  showShopName={true}
  compact={false}
/>
```

### Shop Card with Full Details

```tsx
<ShopCard
  id="shop-456"
  name="TechZone Japan"
  slug="techzone-japan"
  logo="/shops/techzone-logo.jpg"
  banner="/shops/techzone-banner.jpg"
  description="Premium Japanese electronics and gadgets"
  rating={4.9}
  reviewCount={1024}
  productCount={256}
  location="Tokyo, Japan"
  isVerified={true}
  isFeatured={true}
  categories={["Electronics", "Audio", "Cameras", "Gaming"]}
  onFollow={handleFollow}
  isFollowing={followedShops.includes("shop-456")}
  showBanner={true}
  compact={false}
/>
```

### Category Card - All Variants

```tsx
// Large (homepage hero sections)
<CategoryCard
  id="cat-1"
  name="Electronics"
  slug="electronics"
  image="/categories/electronics.jpg"
  description="Latest gadgets from Japan"
  productCount={1580}
  isFeatured={true}
  showOnHomepage={true}
  subcategoryCount={12}
  variant="large"
/>

// Default (category listing)
<CategoryCard
  id="cat-2"
  name="Audio Equipment"
  slug="audio-equipment"
  image="/categories/audio.jpg"
  productCount={420}
  parentCategory="Electronics"
  subcategoryCount={8}
  variant="default"
/>

// Compact (full grid)
<CategoryCard
  id="cat-3"
  name="Headphones"
  slug="headphones"
  image="/categories/headphones.jpg"
  productCount={156}
  variant="compact"
/>
```

---

## Real-World Integration

### Homepage Featured Products

```tsx
export function FeaturedProducts() {
  const { data: products, isLoading } = useFeaturedProducts();

  return (
    <section className="py-12">
      <h2 className="text-3xl font-bold mb-8">Featured Products</h2>
      <CardGrid>
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))
          : products?.map((product) => (
              <ProductCard
                key={product.id}
                {...product}
                onAddToCart={handleAddToCart}
                onToggleFavorite={handleToggleFavorite}
                onQuickView={handleQuickView}
                isFavorite={favorites.includes(product.id)}
              />
            ))}
      </CardGrid>
    </section>
  );
}
```

### Shop Directory Page

```tsx
export function ShopDirectory() {
  const { data: shops, isLoading } = useShops();
  const { followedShops, toggleFollow } = useFollowShops();

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-bold mb-8">All Shops</h1>
      <CardGrid columns={{ xs: 1, sm: 2, md: 2, lg: 3 }} gap="lg">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <ShopCardSkeleton key={i} showBanner />
            ))
          : shops?.map((shop) => (
              <ShopCard
                key={shop.id}
                {...shop}
                isFollowing={followedShops.includes(shop.id)}
                onFollow={toggleFollow}
                showBanner
              />
            ))}
      </CardGrid>
    </div>
  );
}
```

### Category Browse Page

```tsx
export function CategoryBrowse() {
  const { featured, all } = useCategories();

  return (
    <div className="space-y-12">
      {/* Featured Categories */}
      <section>
        <h2 className="text-3xl font-bold mb-6">Featured Categories</h2>
        <CardGrid columns={{ xs: 1, sm: 2, md: 3 }} gap="lg">
          {featured.map((cat) => (
            <CategoryCard key={cat.id} {...cat} variant="large" />
          ))}
        </CardGrid>
      </section>

      {/* All Categories */}
      <section>
        <h2 className="text-3xl font-bold mb-6">Browse All</h2>
        <CardGrid columns={{ xs: 2, sm: 3, md: 4, lg: 6 }}>
          {all.map((cat) => (
            <CategoryCard key={cat.id} {...cat} variant="compact" />
          ))}
        </CardGrid>
      </section>
    </div>
  );
}
```

### Search Results with Quick View

```tsx
export function SearchResults({ query }) {
  const { data: results, isLoading } = useSearch(query);
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  return (
    <>
      <div className="mb-4">
        <h2 className="text-2xl font-bold">
          {results?.length || 0} results for "{query}"
        </h2>
      </div>

      <CardGrid>
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))
          : results?.map((product) => (
              <ProductCard
                key={product.id}
                {...product}
                onQuickView={() => setQuickViewProduct(product)}
                onAddToCart={handleAddToCart}
              />
            ))}
      </CardGrid>

      {quickViewProduct && (
        <ProductQuickView
          product={quickViewProduct}
          isOpen={true}
          onClose={() => setQuickViewProduct(null)}
          onAddToCart={(id, quantity) => {
            handleAddToCart(id, quantity);
            setQuickViewProduct(null);
          }}
        />
      )}
    </>
  );
}
```

---

## Tips & Best Practices

### Performance

1. **Use Skeletons During Load**

   ```tsx
   {
     isLoading ? <ProductCardSkeleton /> : <ProductCard {...product} />;
   }
   ```

2. **Memoize Handlers**

   ```tsx
   const handleAddToCart = useCallback((id) => {
     // Add to cart logic
   }, []);
   ```

3. **Lazy Load Images**

   - Next.js Image component handles this automatically
   - Provide proper `sizes` attribute for responsive images

4. **Virtualize Long Lists**
   - For 100+ items, use `react-window` or `react-virtual`

### Responsive Design

1. **Adjust Columns by Screen Size**

   ```tsx
   <CardGrid columns={{ xs: 1, sm: 2, md: 3, lg: 4, xl: 5 }}>
   ```

2. **Use Compact Mode on Mobile**

   ```tsx
   const isMobile = useMediaQuery("(max-width: 640px)");
   <ProductCard {...product} compact={isMobile} />;
   ```

3. **Hide Optional Info on Small Screens**
   ```tsx
   <ProductCard {...product} showShopName={!isMobile} />
   ```

### Accessibility

1. **Provide Meaningful Labels**

   - Action buttons have `aria-label` attributes
   - Images have descriptive `alt` text

2. **Support Keyboard Navigation**

   - All interactive elements are focusable
   - Escape key closes modals

3. **Maintain Focus Management**
   - Quick View traps focus when open
   - Focus returns to trigger on close

---

## Common Patterns

### Infinite Scroll Product Grid

```tsx
function InfiniteProductGrid() {
  const { data, fetchNextPage, hasNextPage, isLoading } = useInfiniteProducts();

  return (
    <>
      <CardGrid>
        {data?.pages.map((page, i) => (
          <React.Fragment key={i}>
            {page.products.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </React.Fragment>
        ))}
        {isLoading && <ProductCardSkeleton />}
      </CardGrid>

      {hasNextPage && (
        <button onClick={() => fetchNextPage()}>Load More</button>
      )}
    </>
  );
}
```

### Filtered Product Listing

```tsx
function FilteredProducts({ filters }) {
  const { data: products, isLoading } = useProducts(filters);

  if (isLoading) {
    return (
      <CardGrid>
        {Array.from({ length: 12 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </CardGrid>
    );
  }

  if (!products?.length) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No products found</p>
      </div>
    );
  }

  return (
    <CardGrid>
      {products.map((product) => (
        <ProductCard key={product.id} {...product} />
      ))}
    </CardGrid>
  );
}
```

### Shop Products Tab

```tsx
function ShopProductsTab({ shopId }) {
  const { data: products, isLoading } = useShopProducts(shopId);

  return (
    <div>
      <h3 className="text-xl font-bold mb-4">Products</h3>
      <CardGrid columns={{ xs: 2, sm: 3, md: 4 }}>
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} compact />
            ))
          : products?.map((product) => (
              <ProductCard
                key={product.id}
                {...product}
                compact
                showShopName={false}
              />
            ))}
      </CardGrid>
    </div>
  );
}
```

---

## Troubleshooting

### Images Not Loading

- Check Next.js Image domains in `next.config.js`
- Verify image URLs are valid
- Check network tab for errors

### Grid Not Responsive

- Add Tailwind classes to safelist in config
- Verify breakpoint values in CardGrid props

### Hover Effects Not Working

- Ensure parent has `group` class
- Check Tailwind CSS configuration
- Inspect element to verify classes

### Quick View Not Closing

- Check `isOpen` prop is toggling
- Verify `onClose` is called
- Check for console errors

---

**For complete documentation, see `/CHECKLIST/PHASE_2.3_COMPLETION.md`**
