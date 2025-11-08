# Product Detail Page - Quick Reference

**Last Updated:** November 8, 2025  
**Status:** ✅ Production Ready

---

## 📍 Route

```
/products/[slug]
```

**Example:** `/products/iphone-14-pro-max`

---

## 🎯 Components Overview

### 1. ProductGallery

**Purpose:** Display product images/videos with zoom

```tsx
import { ProductGallery } from "@/components/product/ProductGallery";

<ProductGallery
  media={[
    { url: "/image1.jpg", type: "image", alt: "Product view 1" },
    { url: "/video1.mp4", type: "video" },
  ]}
  productName="Product Name"
/>;
```

**Features:**

- Image/video carousel
- Thumbnail navigation
- Zoom/lightbox
- Keyboard navigation

---

### 2. ProductInfo

**Purpose:** Product details and purchase actions

```tsx
import { ProductInfo } from "@/components/product/ProductInfo";

<ProductInfo
  product={{
    id: "product-id",
    name: "Product Name",
    slug: "product-slug",
    salePrice: 29999,
    originalPrice: 39999,
    stock: 50,
    rating: 4.5,
    reviewCount: 128,
    shop_id: "shop-id",
    shop_name: "Shop Name",
    returnable: true,
    condition: "new",
    status: "active",
  }}
/>;
```

**Features:**

- Pricing display
- Stock status
- Quantity selector
- Add to cart
- Buy now
- Share & favorite

---

### 3. ProductDescription

**Purpose:** Tabbed product information

```tsx
import { ProductDescription } from "@/components/product/ProductDescription";

<ProductDescription
  description="<p>Product HTML description</p>"
  specifications={{
    Brand: "Apple",
    Model: "iPhone 14 Pro",
    Storage: "256GB",
    Color: "Deep Purple",
  }}
  shipping="<p>Custom shipping info (optional)</p>"
/>;
```

**Tabs:**

- Description (HTML)
- Specifications (key-value table)
- Shipping & Returns (policy info)

---

### 4. ProductReviews

**Purpose:** Customer reviews with rating breakdown

```tsx
import { ProductReviews } from "@/components/product/ProductReviews";

<ProductReviews productId="product-id" productSlug="product-slug" />;
```

**Features:**

- Average rating
- Rating breakdown
- Review list
- Verified purchase badges
- Helpful count

---

### 5. SimilarProducts

**Purpose:** Product recommendations

```tsx
import { SimilarProducts } from "@/components/product/SimilarProducts";

<SimilarProducts
  productId="current-product-id"
  categoryId="category-id"
  currentShopId="shop-id"
/>;
```

**Algorithm:**

- Fetches from same category
- Excludes current product
- Diversifies by shop
- Max 10 products

---

## 📦 Page Structure

```tsx
// /src/app/products/[slug]/page.tsx

export default function ProductPage({ params }: { params: { slug: string } }) {
  // 1. Fetch product data
  const product = await productsService.getBySlug(params.slug);

  // 2. Prepare media
  const media = [
    ...product.images.map((url) => ({ url, type: "image" })),
    ...product.videos.map((url) => ({ url, type: "video" })),
  ];

  return (
    <div>
      {/* Breadcrumbs */}
      <Breadcrumbs />

      {/* Product Overview */}
      <div className="grid lg:grid-cols-2 gap-8">
        <ProductGallery media={media} productName={product.name} />
        <ProductInfo product={product} />
      </div>

      {/* Description & Specs */}
      <ProductDescription
        description={product.description}
        specifications={product.specifications}
      />

      {/* Reviews */}
      <ProductReviews productId={product.id} productSlug={product.slug} />

      {/* Similar Products */}
      <SimilarProducts
        productId={product.id}
        categoryId={product.categoryId}
        currentShopId={product.shopId}
      />
    </div>
  );
}
```

---

## 🔌 API Integration

### Product Data:

```typescript
const product = await productsService.getBySlug(slug);

// Returns:
{
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  originalPrice?: number;
  stockCount: number;
  images: string[];
  videos?: string[];
  rating: number;
  reviewCount: number;
  shopId: string;
  categoryId: string;
  specifications?: { name: string; value: string }[];
  condition: "new" | "refurbished" | "used";
  isReturnable: boolean;
  status: "active" | "inactive" | "draft";
  // ... more fields
}
```

### Reviews Data:

```typescript
const reviews = await reviewsService.list({ productId });

// Returns:
{
  data: [
    {
      id: string;
      rating: number;
      title?: string;
      comment: string;
      verifiedPurchase: boolean;
      helpfulCount: number;
      createdAt: Date;
    }
  ],
  total: number;
  page: number;
  limit: number;
}
```

### Similar Products:

```typescript
const similar = await productsService.list({
  categoryId: product.categoryId,
  status: "active",
  limit: 12,
});

// Filter and diversify in component
```

---

## 🎨 Styling Guidelines

### Layout:

```scss
// Desktop (> 1024px)
.product-overview {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

// Mobile (< 768px)
.product-overview {
  grid-template-columns: 1fr;
}
```

### Colors:

```scss
--primary: #3b82f6; // Primary blue
--success: #10b981; // Green (in stock)
--warning: #f59e0b; // Orange (low stock)
--error: #ef4444; // Red (out of stock)
--gray-50: #f9fafb; // Background
--gray-900: #111827; // Text
```

### Typography:

```scss
// Product title
font-size: 1.875rem; // 30px
font-weight: 700; // Bold

// Price
font-size: 2.25rem; // 36px
font-weight: 700; // Bold
color: var(--primary);

// Description
font-size: 1rem; // 16px
line-height: 1.625; // 26px
```

---

## 🔍 Common Patterns

### Loading State:

```tsx
if (loading) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-primary animate-spin" />
    </div>
  );
}
```

### Error State:

```tsx
if (!product) {
  router.push("/404");
  return null;
}
```

### Empty Reviews:

```tsx
if (reviews.length === 0) {
  return (
    <EmptyState title="No reviews yet" description="Be the first to review!" />
  );
}
```

---

## 🚀 Cart Integration

### Add to Cart:

```tsx
import { useCart } from "@/hooks/useCart";

const { addItem, loading } = useCart();

const handleAddToCart = async () => {
  await addItem(productId, quantity);
  alert("Added to cart!");
};
```

### Buy Now:

```tsx
const handleBuyNow = async () => {
  await addItem(productId, quantity);
  router.push("/checkout");
};
```

---

## 📱 Responsive Breakpoints

```scss
// Mobile First
@media (min-width: 768px) {
  // Tablet
}

@media (min-width: 1024px) {
  // Desktop
}

@media (min-width: 1280px) {
  // Large Desktop
}
```

---

## ⚡ Performance Tips

1. **Image Optimization:**

   ```tsx
   <Image
     src={url}
     fill
     priority // Above fold images
     className="object-contain"
   />
   ```

2. **Lazy Loading:**

   - Below-fold images load on scroll
   - Similar products load after main content

3. **Code Splitting:**
   - Components auto-split by Next.js
   - Dynamic imports for heavy components

---

## 🐛 Troubleshooting

### Issue: Images not loading

**Solution:** Check image URLs are absolute or properly configured

### Issue: Add to cart not working

**Solution:** Verify `useCart` hook is within CartProvider context

### Issue: Reviews not showing

**Solution:** Check `productId` is correct and reviews API is working

### Issue: Similar products empty

**Solution:** Ensure products exist in same category with `status: "active"`

---

## 📊 Analytics Events (Future)

```typescript
// Track page view
analytics.track("Product Viewed", {
  productId: product.id,
  productName: product.name,
  price: product.price,
  category: product.categoryId
});

// Track add to cart
analytics.track("Product Added", {
  productId,
  quantity,
  price: product.price * quantity
});

// Track purchase
analytics.track("Purchase Completed", {
  orderId,
  products: [...],
  total
});
```

---

## 🔗 Related Pages

- **Cart:** `/cart` - Shopping cart with checkout
- **Checkout:** `/checkout` - Multi-step checkout flow
- **Shop:** `/shops/[slug]` - Shop storefront (Phase 6.6)
- **Category:** `/categories/[slug]` - Category page (Phase 6.7)
- **Orders:** `/user/orders` - Order history (Phase 6.4)

---

## 📝 Notes

- ✅ All components production-ready
- ✅ Follows Phase 2 patterns
- ✅ Integrates with existing cart system
- ✅ Mobile-responsive
- ⏳ Write review form - future enhancement
- ⏳ Shop name display - needs shop data join

---

**Need Help?** Check `/CHECKLIST/PHASE_6.5_COMPLETION.md` for detailed documentation
