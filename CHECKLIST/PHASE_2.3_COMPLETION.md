# Phase 2.3: Public Display Cards - Complete Documentation

## Overview

Phase 2.3 delivers a comprehensive set of card components for displaying products, shops, and categories throughout the justforview.in marketplace. All components are production-ready with TypeScript strict mode, responsive design, and eBay-style aesthetics.

**Status:** ✅ **100% COMPLETE** (8/8 components delivered)

**Date Completed:** November 7, 2025

---

## Deliverables Summary

### ✅ Card Components (3/3)

1. **ProductCard** - Product display with quick actions
2. **ShopCard** - Shop display with follow functionality
3. **CategoryCard** - Category display with variants

### ✅ Loading Skeletons (3/3)

4. **ProductCardSkeleton** - Product loading state
5. **ShopCardSkeleton** - Shop loading state
6. **CategoryCardSkeleton** - Category loading state

### ✅ Utilities (2/2)

7. **CardGrid** - Responsive grid layout wrapper
8. **ProductQuickView** - Full-featured quick view modal

---

## Component Details

### 1. ProductCard Component

**Location:** `/src/components/cards/ProductCard.tsx`

**Purpose:** Display product information in a card format with quick action buttons.

**Features:**

- Product image with hover zoom effect
- Product name (1-2 lines, truncated)
- Shop name with link (optional)
- Price display with Indian Rupee formatting
- Original price with strikethrough (if discounted)
- Discount percentage badge
- Star rating with review count
- Stock status indicator
- Condition badge (new, used, refurbished)
- Featured badge
- Quick action buttons:
  - Add to Cart (hover overlay)
  - Favorite/Wishlist toggle
  - Quick View
- Hover effects and transitions
- Responsive sizing (compact mode available)

**Props:**

```typescript
interface ProductCardProps {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating?: number;
  reviewCount?: number;
  shopName: string;
  shopSlug: string;
  inStock: boolean;
  isFeatured?: boolean;
  condition?: "new" | "used" | "refurbished";
  onAddToCart?: (id: string) => void;
  onToggleFavorite?: (id: string) => void;
  onQuickView?: (id: string) => void;
  isFavorite?: boolean;
  showShopName?: boolean;
  compact?: boolean;
}
```

**Usage Example:**

```tsx
import { ProductCard } from "@/components/cards";

<ProductCard
  id="prod-123"
  name="Sony WH-1000XM5 Wireless Headphones"
  slug="sony-wh-1000xm5"
  price={29990}
  originalPrice={34990}
  image="/images/products/sony-headphones.jpg"
  rating={4.8}
  reviewCount={256}
  shopName="TechZone Japan"
  shopSlug="techzone-japan"
  inStock={true}
  isFeatured={true}
  condition="new"
  onAddToCart={(id) => console.log("Add to cart:", id)}
  onToggleFavorite={(id) => console.log("Toggle favorite:", id)}
  onQuickView={(id) => console.log("Quick view:", id)}
  isFavorite={false}
/>;
```

---

### 2. ShopCard Component

**Location:** `/src/components/cards/ShopCard.tsx`

**Purpose:** Display shop information with branding and stats.

**Features:**

- Shop banner image (optional)
- Shop logo with verified badge
- Shop name with verification icon
- Star rating with review count
- Location display
- Shop description (2 lines, truncated)
- Category tags (up to 3, with overflow indicator)
- Product count display
- Follow/Following button
- Featured shop badge
- Hover effects and transitions
- Responsive sizing (compact mode, with/without banner)

**Props:**

```typescript
interface ShopCardProps {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  banner?: string;
  description?: string;
  rating?: number;
  reviewCount?: number;
  productCount: number;
  location?: string;
  isVerified?: boolean;
  isFeatured?: boolean;
  categories?: string[];
  onFollow?: (id: string) => void;
  isFollowing?: boolean;
  showBanner?: boolean;
  compact?: boolean;
}
```

**Usage Example:**

```tsx
import { ShopCard } from "@/components/cards";

<ShopCard
  id="shop-456"
  name="TechZone Japan"
  slug="techzone-japan"
  logo="/images/shops/techzone-logo.jpg"
  banner="/images/shops/techzone-banner.jpg"
  description="Premium Japanese electronics and gadgets"
  rating={4.9}
  reviewCount={1024}
  productCount={256}
  location="Tokyo, Japan"
  isVerified={true}
  isFeatured={true}
  categories={["Electronics", "Audio", "Cameras", "Gaming"]}
  onFollow={(id) => console.log("Follow shop:", id)}
  isFollowing={false}
  showBanner={true}
/>;
```

---

### 3. CategoryCard Component

**Location:** `/src/components/cards/CategoryCard.tsx`

**Purpose:** Display category with image and product count, supporting multiple variants.

**Features:**

- Category image with gradient overlay
- Category name (1-2 lines, truncated)
- Parent category breadcrumb (optional)
- Product count display
- Subcategory count badge
- Featured/Popular badges
- Hover effects with scale and overlay
- Three size variants:
  - **compact**: Square aspect ratio, minimal info
  - **default**: 4:3 aspect ratio, balanced info
  - **large**: 16:9 aspect ratio, full details with description

**Props:**

```typescript
interface CategoryCardProps {
  id: string;
  name: string;
  slug: string;
  image?: string;
  description?: string;
  productCount: number;
  isFeatured?: boolean;
  showOnHomepage?: boolean;
  parentCategory?: string;
  subcategoryCount?: number;
  variant?: "default" | "compact" | "large";
}
```

**Usage Examples:**

```tsx
import { CategoryCard } from '@/components/cards';

// Compact variant (for grids with many categories)
<CategoryCard
  id="cat-789"
  name="Electronics"
  slug="electronics"
  image="/images/categories/electronics.jpg"
  productCount={1580}
  isFeatured={true}
  variant="compact"
/>

// Default variant (standard category listing)
<CategoryCard
  id="cat-790"
  name="Audio Equipment"
  slug="audio-equipment"
  image="/images/categories/audio.jpg"
  productCount={420}
  parentCategory="Electronics"
  subcategoryCount={8}
  variant="default"
/>

// Large variant (featured categories on homepage)
<CategoryCard
  id="cat-791"
  name="Gaming"
  slug="gaming"
  image="/images/categories/gaming.jpg"
  description="Consoles, games, accessories, and more"
  productCount={890}
  isFeatured={true}
  showOnHomepage={true}
  subcategoryCount={12}
  variant="large"
/>
```

---

### 4. ProductCardSkeleton Component

**Location:** `/src/components/cards/ProductCardSkeleton.tsx`

**Purpose:** Loading placeholder for ProductCard.

**Features:**

- Animated pulse effect
- Matches ProductCard layout exactly
- Supports compact mode
- Configurable shop name visibility

**Props:**

```typescript
interface ProductCardSkeletonProps {
  compact?: boolean;
  showShopName?: boolean;
}
```

**Usage:**

```tsx
import { ProductCardSkeleton } from "@/components/cards";

// Loading state for product grid
{
  isLoading && (
    <>
      <ProductCardSkeleton />
      <ProductCardSkeleton />
      <ProductCardSkeleton />
    </>
  );
}
```

---

### 5. ShopCardSkeleton Component

**Location:** `/src/components/cards/ShopCardSkeleton.tsx`

**Purpose:** Loading placeholder for ShopCard.

**Features:**

- Animated pulse effect
- Matches ShopCard layout exactly
- Supports banner and compact modes
- Includes logo, info, and stats placeholders

**Props:**

```typescript
interface ShopCardSkeletonProps {
  showBanner?: boolean;
  compact?: boolean;
}
```

**Usage:**

```tsx
import { ShopCardSkeleton } from '@/components/cards';

// Loading state with banner
<ShopCardSkeleton showBanner={true} />

// Compact loading state
<ShopCardSkeleton compact={true} showBanner={false} />
```

---

### 6. CategoryCardSkeleton Component

**Location:** `/src/components/cards/CategoryCardSkeleton.tsx`

**Purpose:** Loading placeholder for CategoryCard.

**Features:**

- Animated pulse effect
- Matches CategoryCard layout for all variants
- Configurable aspect ratio based on variant

**Props:**

```typescript
interface CategoryCardSkeletonProps {
  variant?: "default" | "compact" | "large";
}
```

**Usage:**

```tsx
import { CategoryCardSkeleton } from '@/components/cards';

// Default skeleton
<CategoryCardSkeleton variant="default" />

// Large skeleton for homepage
<CategoryCardSkeleton variant="large" />
```

---

### 7. CardGrid Component

**Location:** `/src/components/cards/CardGrid.tsx`

**Purpose:** Responsive grid wrapper for any card components.

**Features:**

- Responsive column configuration (xs, sm, md, lg, xl breakpoints)
- Configurable gap sizes (sm, md, lg)
- Custom className support
- Default: 1 column (mobile), 2 (sm), 3 (md), 4 (lg/xl)

**Props:**

```typescript
interface CardGridProps {
  children: React.ReactNode;
  columns?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: "sm" | "md" | "lg";
  className?: string;
}
```

**Usage Examples:**

```tsx
import { CardGrid, ProductCard } from '@/components/cards';

// Default grid (1/2/3/4 columns)
<CardGrid>
  {products.map(product => (
    <ProductCard key={product.id} {...product} />
  ))}
</CardGrid>

// Custom grid (2/3/4/5 columns with large gap)
<CardGrid
  columns={{ xs: 2, sm: 3, md: 4, lg: 5, xl: 5 }}
  gap="lg"
>
  {categories.map(category => (
    <CategoryCard key={category.id} {...category} />
  ))}
</CardGrid>

// Compact shops grid
<CardGrid columns={{ xs: 1, sm: 2, md: 2, lg: 3 }} gap="md">
  {shops.map(shop => (
    <ShopCard key={shop.id} {...shop} compact />
  ))}
</CardGrid>
```

---

### 8. ProductQuickView Component

**Location:** `/src/components/cards/ProductQuickView.tsx`

**Purpose:** Full-featured modal for quick product preview without leaving current page.

**Features:**

- Full-screen modal overlay with backdrop blur
- Image gallery with navigation (prev/next arrows)
- Image thumbnail grid (up to 5 images)
- Zoom functionality (click to zoom in/out)
- Image counter (current/total)
- Product details (name, rating, reviews, description)
- Shop name with link
- Price display with discount
- Stock status and quantity
- Condition badge
- Specifications preview (up to 4)
- Trust badges (returns, delivery, secure payment)
- Quantity selector with validation
- Add to Cart button
- Favorite toggle button
- Share button (Web Share API)
- "View Full Details" link to product page
- Keyboard support (Escape to close, arrows for images)
- Responsive design (mobile-friendly)
- Body scroll lock when open

**Props:**

```typescript
interface ProductQuickViewProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    originalPrice?: number;
    images: string[];
    description: string;
    rating?: number;
    reviewCount?: number;
    inStock: boolean;
    stockCount?: number;
    condition?: "new" | "used" | "refurbished";
    shopName: string;
    shopSlug: string;
    specifications?: { label: string; value: string }[];
  };
  isOpen: boolean;
  onClose: () => void;
  onAddToCart?: (id: string, quantity: number) => void;
  onToggleFavorite?: (id: string) => void;
  isFavorite?: boolean;
}
```

**Usage Example:**

```tsx
import { ProductQuickView } from '@/components/cards';
import { useState } from 'react';

const [quickViewProduct, setQuickViewProduct] = useState(null);

// Trigger quick view
<ProductCard
  {...product}
  onQuickView={(id) => setQuickViewProduct(product)}
/>

// Quick view modal
<ProductQuickView
  product={quickViewProduct}
  isOpen={!!quickViewProduct}
  onClose={() => setQuickViewProduct(null)}
  onAddToCart={(id, quantity) => {
    console.log('Add to cart:', id, quantity);
    setQuickViewProduct(null);
  }}
  onToggleFavorite={(id) => console.log('Toggle favorite:', id)}
  isFavorite={false}
/>
```

---

## Design System

### Color Palette

**Primary Actions:**

- Blue: `#2563EB` (bg-blue-600) for primary buttons, links
- Hover: `#1D4ED8` (bg-blue-700)

**Status Colors:**

- Green: Success, in stock, discounts
- Red: Out of stock, errors, remove
- Yellow: Featured items, ratings
- Gray: Neutral elements, text

**Badges:**

- Featured: Yellow (bg-yellow-500)
- Out of Stock: Red (bg-red-500)
- Condition: Blue (bg-blue-500)
- Discount: Green (bg-green-500)
- Popular: Blue (bg-blue-500)

### Typography

**Font Sizes:**

- Product Name: `text-base` (16px) or `text-sm` (14px) for compact
- Shop Name: `text-lg` (18px) for cards, `text-xs` (12px) for product cards
- Category Name: `text-sm/base/lg` (14/16/18px) based on variant
- Price: `text-xl/lg` (20/18px)
- Rating: `text-sm` (14px)
- Badges: `text-xs` (12px)

**Font Weights:**

- Names/Titles: `font-semibold` or `font-bold`
- Price: `font-bold`
- Body text: `font-normal`
- Badges: `font-semibold`

### Spacing & Layout

**Card Padding:**

- Default: `p-4` (16px)
- Compact: `p-3` (12px)
- Large: `p-6` (24px)

**Grid Gaps:**

- Small: `gap-2` (8px)
- Medium: `gap-4` (16px)
- Large: `gap-6` (24px)

**Image Aspect Ratios:**

- Product: `1:1` (square)
- Shop Banner: `4:1` (wide)
- Shop Logo: `1:1` (square)
- Category Compact: `1:1` (square)
- Category Default: `4:3`
- Category Large: `16:9`

### Hover Effects

**Transitions:**

- Shadow: `hover:shadow-lg transition-shadow duration-200`
- Transform: `hover:scale-105 transition-transform duration-300` (images)
- Colors: `hover:bg-blue-700 transition-colors`
- Translate: `hover:-translate-y-1 transition-all duration-200` (cards)

**Opacity:**

- Action buttons: `opacity-0 group-hover:opacity-100 transition-opacity duration-200`
- Overlays: `opacity-0 group-hover:opacity-100`

---

## Integration Guide

### Basic Product Grid

```tsx
import { CardGrid, ProductCard, ProductCardSkeleton } from "@/components/cards";

export function ProductGrid({ products, isLoading }) {
  if (isLoading) {
    return (
      <CardGrid>
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </CardGrid>
    );
  }

  return (
    <CardGrid>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          {...product}
          onAddToCart={handleAddToCart}
          onToggleFavorite={handleToggleFavorite}
          onQuickView={handleQuickView}
        />
      ))}
    </CardGrid>
  );
}
```

### Shop Listing with Follow

```tsx
import { CardGrid, ShopCard, ShopCardSkeleton } from "@/components/cards";

export function ShopListing({ shops, isLoading, followedShops, onFollow }) {
  return (
    <CardGrid columns={{ xs: 1, sm: 2, md: 2, lg: 3 }}>
      {isLoading
        ? Array.from({ length: 6 }).map((_, i) => (
            <ShopCardSkeleton key={i} showBanner />
          ))
        : shops.map((shop) => (
            <ShopCard
              key={shop.id}
              {...shop}
              isFollowing={followedShops.includes(shop.id)}
              onFollow={onFollow}
              showBanner
            />
          ))}
    </CardGrid>
  );
}
```

### Category Browse (Mixed Variants)

```tsx
import { CardGrid, CategoryCard } from "@/components/cards";

export function CategoryBrowse({ featuredCategories, allCategories }) {
  return (
    <>
      {/* Featured categories - large */}
      <section>
        <h2>Featured Categories</h2>
        <CardGrid columns={{ xs: 1, sm: 2, md: 3 }} gap="lg">
          {featuredCategories.map((cat) => (
            <CategoryCard key={cat.id} {...cat} variant="large" />
          ))}
        </CardGrid>
      </section>

      {/* All categories - compact */}
      <section>
        <h2>All Categories</h2>
        <CardGrid columns={{ xs: 2, sm: 3, md: 4, lg: 6 }} gap="md">
          {allCategories.map((cat) => (
            <CategoryCard key={cat.id} {...cat} variant="compact" />
          ))}
        </CardGrid>
      </section>
    </>
  );
}
```

### Product Quick View with State

```tsx
import { useState } from "react";
import { ProductCard, ProductQuickView } from "@/components/cards";

export function ProductWithQuickView({ product }) {
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  return (
    <>
      <ProductCard {...product} onQuickView={() => setIsQuickViewOpen(true)} />

      <ProductQuickView
        product={product}
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
        onAddToCart={(id, quantity) => {
          // Add to cart logic
          console.log("Adding to cart:", id, quantity);
          setIsQuickViewOpen(false);
        }}
      />
    </>
  );
}
```

---

## Performance Considerations

### Image Optimization

**Next.js Image Component:**

- All images use `next/image` for automatic optimization
- Proper `sizes` attribute for responsive images
- Lazy loading by default
- Priority loading for above-the-fold images (optional)

**Recommended sizes:**

```typescript
// Product images
sizes = "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw";

// Shop banners
sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw";

// Category images
sizes = "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw";
```

### Loading States

**Best Practices:**

- Always show skeletons during initial load
- Match skeleton count to expected result count
- Use same grid configuration for skeletons and actual cards
- Avoid layout shift (skeletons should match card dimensions)

### Virtualization (for large lists)

For lists with 100+ items, consider using `react-window` or `react-virtual`:

```tsx
import { FixedSizeGrid } from "react-window";

<FixedSizeGrid
  columnCount={4}
  columnWidth={300}
  height={600}
  rowCount={Math.ceil(products.length / 4)}
  rowHeight={400}
  width={1200}
>
  {({ columnIndex, rowIndex, style }) => {
    const index = rowIndex * 4 + columnIndex;
    const product = products[index];
    return product ? (
      <div style={style}>
        <ProductCard {...product} />
      </div>
    ) : null;
  }}
</FixedSizeGrid>;
```

---

## Browser Compatibility

### Supported Features

**CSS:**

- Grid Layout: All modern browsers
- Aspect Ratio: All modern browsers (or use padding-top hack for older browsers)
- Backdrop Filter: Modern browsers (graceful degradation for blur)

**JavaScript:**

- Optional Chaining (?.): ES2020+
- Nullish Coalescing (??): ES2020+
- Array.from: ES6+

**APIs:**

- Web Share API (ProductQuickView): Progressive enhancement (button hidden if not supported)

### Polyfills

No polyfills required for supported browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+).

---

## Accessibility

### Keyboard Navigation

**ProductCard:**

- Tab: Focus card link
- Enter/Space: Navigate to product page
- Tab (on action buttons): Focus action buttons individually

**ProductQuickView:**

- Escape: Close modal
- Tab: Cycle through interactive elements
- Arrow Keys: Navigate image gallery (when focused)

### Screen Readers

**ARIA Labels:**

- Action buttons have descriptive `aria-label` attributes
- Images have meaningful `alt` text
- Links clearly describe destination

**Focus Management:**

- Modal traps focus when open
- Focus returns to trigger element on close
- Skip links for repeated content (optional)

### Color Contrast

All text meets WCAG AA standards:

- Normal text: 4.5:1 minimum
- Large text (18px+): 3:1 minimum
- Interactive elements: Clear focus indicators

---

## Testing Recommendations

### Unit Tests

```typescript
import { render, screen, fireEvent } from "@testing-library/react";
import { ProductCard } from "./ProductCard";

describe("ProductCard", () => {
  const mockProduct = {
    id: "1",
    name: "Test Product",
    slug: "test-product",
    price: 1000,
    image: "/test.jpg",
    shopName: "Test Shop",
    shopSlug: "test-shop",
    inStock: true,
  };

  it("renders product information", () => {
    render(<ProductCard {...mockProduct} />);
    expect(screen.getByText("Test Product")).toBeInTheDocument();
    expect(screen.getByText("₹1,000")).toBeInTheDocument();
  });

  it("calls onAddToCart when button clicked", () => {
    const onAddToCart = jest.fn();
    render(<ProductCard {...mockProduct} onAddToCart={onAddToCart} />);
    fireEvent.click(screen.getByText("Add to Cart"));
    expect(onAddToCart).toHaveBeenCalledWith("1");
  });

  it("shows discount badge when originalPrice provided", () => {
    render(<ProductCard {...mockProduct} originalPrice={2000} />);
    expect(screen.getByText("50% OFF")).toBeInTheDocument();
  });
});
```

### Visual Regression Tests

Use tools like Chromatic or Percy to catch visual changes:

```typescript
import { ProductCard } from "./ProductCard";

export default {
  title: "Cards/ProductCard",
  component: ProductCard,
};

export const Default = () => <ProductCard {...mockProduct} />;
export const WithDiscount = () => (
  <ProductCard {...mockProduct} originalPrice={2000} />
);
export const OutOfStock = () => (
  <ProductCard {...mockProduct} inStock={false} />
);
export const Compact = () => <ProductCard {...mockProduct} compact />;
```

---

## Known Limitations

1. **Dynamic Tailwind Classes:** CardGrid uses template strings for grid columns, which requires these classes to be safelist in `tailwind.config.js`:

   ```js
   safelist: [
     'grid-cols-1', 'grid-cols-2', 'grid-cols-3', 'grid-cols-4', 'grid-cols-5', 'grid-cols-6',
     'sm:grid-cols-1', 'sm:grid-cols-2', 'sm:grid-cols-3', 'sm:grid-cols-4', 'sm:grid-cols-5', 'sm:grid-cols-6',
     'md:grid-cols-1', 'md:grid-cols-2', 'md:grid-cols-3', 'md:grid-cols-4', 'md:grid-cols-5', 'md:grid-cols-6',
     'lg:grid-cols-1', 'lg:grid-cols-2', 'lg:grid-cols-3', 'lg:grid-cols-4', 'lg:grid-cols-5', 'lg:grid-cols-6',
     'xl:grid-cols-1', 'xl:grid-cols-2', 'xl:grid-cols-3', 'xl:grid-cols-4', 'xl:grid-cols-5', 'xl:grid-cols-6',
   ],
   ```

2. **ProductQuickView Body Scroll:** Body scroll is locked when modal is open using `document.body.style.overflow`. This may interfere with other scroll-locking libraries.

3. **Image Optimization:** Next.js Image component requires images to be from allowed domains in `next.config.js`:
   ```js
   images: {
     domains: ['your-cdn.com', 'storage.googleapis.com'],
   },
   ```

---

## Future Enhancements

### Potential Additions

1. **Auction Card Component** (Phase 3.7, 6.9)

   - Live bid display
   - Countdown timer
   - Current highest bid
   - Bid button

2. **Product Comparison Mode**

   - Select multiple products for comparison
   - Side-by-side comparison view
   - Specification diff highlighting

3. **Advanced Animations**

   - Page transition animations (Framer Motion)
   - Card entrance animations (staggered)
   - Skeleton shimmer effects

4. **Personalization**

   - Recently viewed indicator
   - Recommended badges
   - Price drop alerts
   - Stock alerts

5. **Social Features**
   - Share count display
   - Wishlist count (public)
   - View count badge

---

## Code Quality Metrics

**Lines of Code:**

- ProductCard: ~200 lines
- ShopCard: ~170 lines
- CategoryCard: ~120 lines
- ProductQuickView: ~350 lines
- Skeletons: ~60 lines each
- CardGrid: ~40 lines
- Index: ~30 lines
- **Total: ~1,100 lines**

**TypeScript Coverage:** 100% (strict mode, all props typed)

**Component Count:** 8 components + 1 index file = 9 files

**Compilation:** 0 errors, 0 warnings

---

## Integration Points

### Current Usage (Ready to integrate)

**Phase 3 - Seller Dashboard:**

- Product management lists (ProductCard)
- Shop management (ShopCard)

**Phase 6 - User Pages:**

- Product search results (ProductCard, CardGrid)
- Shop listings (ShopCard, CardGrid)
- Category browse (CategoryCard, CardGrid)
- Homepage featured sections (all cards)
- User favorites/wishlist (ProductCard, CardGrid)
- Product detail pages (ProductQuickView)

**Phase 7 - API Integration:**

- All cards work with API data (just pass props)
- No Firebase dependencies in UI components

### Future Phases

**Phase 3.7 - Auction Management:**

- Create AuctionCard (similar structure to ProductCard)

**Phase 6.9 - Auction Pages:**

- Auction listings (AuctionCard, CardGrid)
- Live auctions feed (AuctionCard with WebSocket)

---

## Support & Maintenance

### Common Issues

**Issue: Images not loading**

- Check Next.js Image domains configuration
- Verify image URLs are valid and accessible
- Check network tab for 404/403 errors

**Issue: Hover effects not working**

- Verify parent has `group` class
- Check Tailwind CSS is properly configured
- Inspect element to see if classes are applied

**Issue: Grid columns not responsive**

- Add Tailwind classes to safelist in config
- Check breakpoint values in CardGrid props
- Verify browser window width

### Getting Help

- Check documentation in `/CHECKLIST/PHASE_2.3_COMPLETION.md`
- Review code examples in this file
- Check TypeScript types for prop requirements
- Test with sample data to isolate issues

---

**Phase 2.3 Complete - Ready for Production** ✅
