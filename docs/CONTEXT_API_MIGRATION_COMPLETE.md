# 🔄 Context API Migration - Complete

**Date:** November 3, 2025  
**Status:** ✅ Complete

---

## Overview

Successfully migrated all React Contexts to use the new centralized API architecture. This provides:

- ✅ Consistent API interaction patterns
- ✅ Automatic authentication handling
- ✅ Built-in caching and retry logic
- ✅ Type-safe API calls
- ✅ Better error handling
- ✅ Separation of concerns

---

## What Was Created

### 1. API Client (`src/lib/api/client.ts`)

**Purpose:** Centralized HTTP client with authentication, caching, and error handling

**Features:**

- Automatic Firebase token injection
- Request/response interceptors
- Built-in retry logic with exponential backoff
- In-memory caching (5-minute TTL)
- Cache invalidation on mutations
- Comprehensive error logging

**Usage:**

```typescript
import { apiClient } from "@/lib/api/client";

// GET request with caching
const data = await apiClient.get<ProductData>("/api/products");

// POST request (invalidates cache)
const result = await apiClient.post("/api/cart", { items });

// Upload with FormData
const response = await apiClient.upload("/api/upload", formData);
```

---

### 2. Cart Service (`src/lib/api/services/cart.service.ts`)

**Purpose:** Service layer for all cart-related API operations

**Methods:**

- `getCart()` - Fetch user's cart
- `syncCart()` - Sync cart with latest prices/availability
- `saveCart(items)` - Save entire cart
- `addItem(item)` - Add single item
- `mergeGuestCart(items)` - Merge guest cart with user cart
- `clearCart()` - Clear all items

**Usage:**

```typescript
import { CartService } from "@/lib/api/services/cart.service";

// Get cart
const cartData = await CartService.getCart();

// Add item
await CartService.addItem(newItem);

// Merge guest cart on login
await CartService.mergeGuestCart(guestItems);
```

---

### 3. Wishlist Service (`src/lib/api/services/wishlist.service.ts`)

**Purpose:** Service layer for all wishlist-related API operations

**Methods:**

- `getWishlist()` - Fetch user's wishlist
- `addItem(item)` - Add item to wishlist
- `removeItem(itemId)` - Remove specific item
- `clearWishlist()` - Clear all items
- `isInWishlist(productId)` - Check if product is in wishlist

**Usage:**

```typescript
import { WishlistService } from "@/lib/api/services/wishlist.service";

// Get wishlist
const wishlistData = await WishlistService.getWishlist();

// Add item
await WishlistService.addItem(newItem);

// Check if in wishlist
const exists = await WishlistService.isInWishlist(productId);
```

---

### 4. Wishlist API Route (`src/app/api/wishlist/route.ts`)

**Purpose:** Backend API endpoint for wishlist operations

**Endpoints:**

- `GET /api/wishlist` - Get user's wishlist
- `POST /api/wishlist` - Add item to wishlist
- `DELETE /api/wishlist?itemId=xxx` - Remove item
- `DELETE /api/wishlist` - Clear wishlist

---

### 5. Updated Contexts

#### CartContext (`src/contexts/CartContext.tsx`)

**Changes:**

- ✅ Uses `CartService` instead of direct fetch calls
- ✅ Loads cart from API for logged-in users
- ✅ Falls back to guest cart on API errors
- ✅ Merges guest cart on login using API
- ✅ Auto-saves to API on changes
- ✅ Maintains backward compatibility

#### WishlistContext (`src/contexts/WishlistContext.tsx`)

**Changes:**

- ✅ Uses `WishlistService` instead of localStorage only
- ✅ Loads wishlist from API for logged-in users
- ✅ Syncs with API on add/remove operations
- ✅ Falls back to localStorage on API errors
- ✅ Optimistic UI updates
- ✅ Maintains backward compatibility

---

## Migration Benefits

### Before (Old Pattern)

```typescript
// Manual fetch with no error handling
const response = await fetch("/api/cart", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({ items }),
});

if (!response.ok) {
  // Handle error manually
}

const data = await response.json();
```

### After (New Pattern)

```typescript
// Service handles everything
const cartData = await CartService.saveCart(items);
```

**Benefits:**

- ✅ Automatic authentication
- ✅ Type safety
- ✅ Error handling
- ✅ Retry logic
- ✅ Caching
- ✅ Less boilerplate

---

## How Contexts Use APIs Now

### 1. Authentication Flow

```typescript
// API Client automatically handles this
private async getTokenWithRetry() {
  const user = auth.currentUser;
  if (!user) return null;

  return await user.getIdToken();
}
```

### 2. CartContext Integration

```typescript
// Load cart on mount
useEffect(() => {
  if (user) {
    const cartData = await CartService.getCart();
    setItems(cartData.items);
  }
}, [user]);

// Save on changes
useEffect(() => {
  if (user && !isLoading) {
    await CartService.saveCart(items);
  }
}, [items, user, isLoading]);
```

### 3. WishlistContext Integration

```typescript
// Optimistic updates
const addItem = async (product) => {
  // Update UI immediately
  setItems([...items, newItem]);
  toast.success("Added to wishlist");

  // Sync with API in background
  if (user) {
    await WishlistService.addItem(newItem);
  }
};
```

---

## Error Handling Strategy

### Graceful Degradation

1. **Try API first** (for logged-in users)
2. **Fall back to localStorage** on API failure
3. **Show user-friendly messages** via toast
4. **Log errors** for debugging

```typescript
try {
  const cartData = await CartService.getCart();
  setItems(cartData.items);
} catch (error) {
  console.error("Failed to load cart:", error);
  // Fallback to guest cart
  const guestCart = GuestCartManager.load();
  setItems(guestCart);
}
```

---

## Caching Strategy

### Automatic Cache Management

```typescript
// GET requests are cached
const data = await apiClient.get("/api/products"); // Cached
const data2 = await apiClient.get("/api/products"); // From cache

// POST/PUT/DELETE invalidate cache
await apiClient.post("/api/cart", { items }); // Invalidates /api/cart* cache
```

### Cache Invalidation Patterns

- `POST /api/cart` → Invalidates `/api/cart*`
- `DELETE /api/cart` → Invalidates `/api/cart*`
- `POST /api/wishlist` → Invalidates `/api/wishlist*`

---

## Testing the New Architecture

### 1. Test Cart Operations

```typescript
// Add item to cart
await CartService.addItem({
  id: "cart_123",
  productId: "prod_456",
  name: "Test Product",
  price: 1000,
  quantity: 1,
  // ...
});

// Verify cart updated
const cart = await CartService.getCart();
console.log(cart.items);
```

### 2. Test Wishlist Operations

```typescript
// Add to wishlist
await WishlistService.addItem({
  id: "wish_123",
  productId: "prod_456",
  name: "Test Product",
  price: 1000,
  addedAt: new Date().toISOString(),
});

// Verify wishlist updated
const wishlist = await WishlistService.getWishlist();
console.log(wishlist.items);
```

---

## Next Steps - Other Contexts

You can now apply the same pattern to other contexts:

### 1. CurrencyContext

- Create `CurrencyService`
- Add `/api/currency` route
- Fetch exchange rates from API
- Cache rates for 24 hours

### 2. ModernThemeContext

- Create `ThemeService`
- Use existing `/api/admin/theme-settings` route
- Fetch theme preferences from API
- Sync theme changes to database

### 3. BreadcrumbContext

- Already client-side only
- No API needed

### 4. AuthContext

- Already uses `apiClient` for auth operations
- No changes needed

---

## API Service Template

For creating new services, follow this template:

```typescript
/**
 * [Feature] Service
 * Handles all [feature]-related API operations
 */

import { apiClient } from "../client";

export interface [Feature]Data {
  // Define data structure
}

export class [Feature]Service {
  /**
   * Get [feature] data
   */
  static async get[Feature](): Promise<[Feature]Data> {
    try {
      const response = await apiClient.get<[Feature]Data>("/api/[feature]");
      return response;
    } catch (error) {
      console.error("[Feature]Service.get[Feature] error:", error);
      throw error;
    }
  }

  // Add more methods as needed
}

export default [Feature]Service;
```

---

## Troubleshooting

### Issue: "Authentication required" error

**Solution:** Ensure user is logged in via Firebase Auth

```typescript
const user = auth.currentUser;
if (!user) {
  // Redirect to login
}
```

### Issue: Cache not updating

**Solution:** Clear cache manually or use `skipCache` option

```typescript
const data = await apiClient.get("/api/cart", null, { skipCache: true });
// OR
apiClient.clearCache();
```

### Issue: API calls failing

**Solution:** Check error logs for details

```typescript
// Errors are automatically logged with context
// Check browser console for detailed error info
```

---

## Summary

✅ **Created:**

- API Client with authentication, caching, retry logic
- Cart Service for cart operations
- Wishlist Service for wishlist operations
- Wishlist API route

✅ **Updated:**

- CartContext to use CartService
- WishlistContext to use WishlistService

✅ **Benefits:**

- Cleaner code
- Better error handling
- Automatic authentication
- Built-in caching
- Type safety
- Easier testing

---

## Usage Examples

### In Components

```typescript
import { CartService, WishlistService } from "@/lib/api";

// Cart operations
const handleAddToCart = async (product) => {
  try {
    await CartService.addItem(product);
    toast.success("Added to cart");
  } catch (error) {
    toast.error("Failed to add to cart");
  }
};

// Wishlist operations
const handleAddToWishlist = async (product) => {
  try {
    await WishlistService.addItem(product);
    toast.success("Added to wishlist");
  } catch (error) {
    toast.error("Failed to add to wishlist");
  }
};
```

### In Contexts

```typescript
import { CartService } from "@/lib/api/services/cart.service";

// Use service instead of fetch
const loadCart = async () => {
  const cartData = await CartService.getCart();
  setItems(cartData.items);
};
```

---

**Questions?** Check the implementation files or refer to the API Quick Reference.

**Last Updated:** November 3, 2025

---

## Additional Services Created

### 3. Product Service (`src/lib/api/services/product.service.ts`)

**Purpose:** Service layer for all product-related API operations

**Methods:**

- `getProducts(filters)` - Fetch products with filters (category, price range, search, etc.)
- `getProduct(idOrSlug)` - Fetch single product by ID or slug
- `searchProducts(query, filters)` - Search products with query string
- `getFeaturedProducts(limit)` - Get featured products
- `getProductsByCategory(categoryId, filters)` - Get products by category
- `getRelatedProducts(productId, limit)` - Get related products

**Usage:**

```typescript
import { ProductService } from "@/lib/api";

// Search products
const results = await ProductService.searchProducts("laptop", {
  minPrice: 30000,
  maxPrice: 80000,
  sortBy: "price",
  order: "asc",
});

// Get single product
const product = await ProductService.getProduct("laptop-hp-15s");

// Get related products
const related = await ProductService.getRelatedProducts("prod_123", 4);
```

---

### 4. Order Service (`src/lib/api/services/order.service.ts`)

**Purpose:** Service layer for all order-related API operations

**Methods:**

- `getOrders(filters)` - Fetch user's orders with filters
- `getOrder(orderId)` - Fetch single order details
- `createOrder(orderData)` - Create new order
- `cancelOrder(orderId, reason)` - Cancel an order
- `trackOrder(orderId)` - Track order status with timeline
- `downloadInvoice(orderId)` - Download order invoice as PDF

**Usage:**

```typescript
import { OrderService } from "@/lib/api";

// Create order
const order = await OrderService.createOrder({
  items: cartItems,
  shippingAddress: selectedAddress,
  paymentMethod: "razorpay",
  notes: "Please deliver before 5 PM",
});

// Track order
const tracking = await OrderService.trackOrder(order.id);

// Download invoice
const blob = await OrderService.downloadInvoice(order.id);
```

---

### 5. Review Service (`src/lib/api/services/review.service.ts`)

**Purpose:** Service layer for all review-related API operations

**Methods:**

- `getReviews(filters)` - Fetch reviews with filters
- `getProductReviews(productId, filters)` - Get reviews for specific product
- `getUserReviews(filters)` - Get current user's reviews
- `createReview(reviewData)` - Create new review
- `updateReview(reviewId, updates)` - Update existing review
- `deleteReview(reviewId)` - Delete a review
- `markHelpful(reviewId)` - Mark review as helpful
- `getReviewStats(productId)` - Get review statistics for a product

**Usage:**

```typescript
import { ReviewService } from "@/lib/api";

// Get product reviews with stats
const reviewsData = await ReviewService.getProductReviews("prod_123", {
  sortBy: "helpful",
  order: "desc",
  limit: 10,
});

// Create review
const review = await ReviewService.createReview({
  productId: "prod_123",
  rating: 5,
  title: "Excellent Product!",
  comment: "Very satisfied with the purchase.",
  images: ["/review1.jpg", "/review2.jpg"],
});

// Get review stats
const stats = await ReviewService.getReviewStats("prod_123");
// Returns: { average: 4.5, total: 120, distribution: { 1: 2, 2: 5, 3: 15, 4: 40, 5: 58 } }
```

---

### 6. User Service (`src/lib/api/services/user.service.ts`)

**Purpose:** Service layer for all user profile and account-related API operations

**Methods:**

- `getProfile()` - Get current user profile
- `updateProfile(updates)` - Update user profile
- `uploadAvatar(file)` - Upload profile avatar
- `getAddresses()` - Get all saved addresses
- `createAddress(addressData)` - Create new address
- `updateAddress(addressId, updates)` - Update existing address
- `deleteAddress(addressId)` - Delete an address
- `setDefaultAddress(addressId)` - Set address as default
- `changePassword(data)` - Change user password
- `deleteAccount(password)` - Delete user account
- `getUserStats()` - Get user statistics (orders, reviews, etc.)

**Usage:**

```typescript
import { UserService } from "@/lib/api";

// Update profile
const profile = await UserService.updateProfile({
  name: "John Doe",
  phone: "1234567890",
  preferences: {
    currency: "INR",
    notifications: {
      email: true,
      sms: false,
    },
  },
});

// Upload avatar
const avatarFile = event.target.files[0];
const result = await UserService.uploadAvatar(avatarFile);
await UserService.updateProfile({ avatar: result.url });

// Manage addresses
const addresses = await UserService.getAddresses();
const newAddress = await UserService.createAddress({
  name: "Home",
  phone: "1234567890",
  addressLine1: "123 Main St",
  city: "Mumbai",
  state: "Maharashtra",
  pincode: "400001",
  country: "India",
  isDefault: true,
});
```

---

### 7. Category Service (`src/lib/api/services/category.service.ts`)

**Purpose:** Service layer for all category-related API operations

**Methods:**

- `getCategoryTree()` - Get all categories as nested tree structure
- `getCategories(filters)` - Get all categories as flat list with filters
- `getCategory(idOrSlug)` - Get single category by ID or slug
- `getFeaturedCategories()` - Get featured categories
- `getTopCategories()` - Get top-level categories
- `getSubcategories(categoryId)` - Get subcategories of a category

**Usage:**

```typescript
import { CategoryService } from "@/lib/api";

// Get category tree for navigation
const tree = await CategoryService.getCategoryTree();

// Get featured categories for homepage
const featured = await CategoryService.getFeaturedCategories();

// Get category details
const category = await CategoryService.getCategory("electronics");

// Get subcategories
const subs = await CategoryService.getSubcategories(category.id);
```

---

## Unified API Access

All services are available through a single import:

```typescript
import { api } from "@/lib/api";

// Use any service
await api.cart.getCart();
await api.wishlist.getWishlist();
await api.products.getProducts();
await api.orders.getOrders();
await api.reviews.getReviews();
await api.user.getProfile();
await api.categories.getCategoryTree();
```

Or import individually:

```typescript
import {
  CartService,
  WishlistService,
  ProductService,
  OrderService,
  ReviewService,
  UserService,
  CategoryService,
} from "@/lib/api";
```
