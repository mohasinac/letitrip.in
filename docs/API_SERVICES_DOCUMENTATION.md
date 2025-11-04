# API Services Documentation

This document provides an overview of all available API service files for the frontend application. Each service encapsulates API calls for specific features, providing a clean and maintainable way to interact with backend endpoints.

## 📁 Service Files Location

All service files are located in: `src/lib/api/services/`

## 🎯 Available Services

### 1. **Auth Service** (`auth.service.ts`)

Handles authentication-related operations.

**Methods:**

- `register(data)` - Register a new user
- `sendOtp(data)` - Send OTP for verification
- `verifyOtp(data)` - Verify OTP
- `getCurrentUser()` - Get current user profile
- `changePassword(data)` - Change user password
- `deleteAccount()` - Delete user account

**Usage Example:**

```typescript
import { api } from "@/lib/api";

// Register new user
const user = await api.auth.register({
  email: "user@example.com",
  password: "password123",
  name: "John Doe",
  role: "user",
});

// Get current user
const currentUser = await api.auth.getCurrentUser();
```

---

### 2. **Product Service** (`product.service.ts`)

Handles product-related operations.

**Methods:**

- `getProducts(filters?)` - Get all products with filters
- `getProduct(idOrSlug)` - Get single product
- `searchProducts(query, filters?)` - Search products
- `getFeaturedProducts(limit?)` - Get featured products
- `getProductsByCategory(categoryId, filters?)` - Get products by category
- `getRelatedProducts(productId, limit?)` - Get related products

**Usage Example:**

```typescript
import { api } from "@/lib/api";

// Get all products
const { products, total } = await api.products.getProducts({
  category: "electronics",
  minPrice: 100,
  maxPrice: 1000,
  page: 1,
  limit: 20,
});

// Get single product
const product = await api.products.getProduct("product-slug");
```

---

### 3. **Category Service** (`category.service.ts`)

Handles category-related operations.

**Methods:**

- `getCategories(filters?)` - Get all categories
- `getCategoryTree()` - Get category hierarchy
- `getCategory(slug)` - Get single category
- `getSubcategories(categoryId)` - Get subcategories

**Usage Example:**

```typescript
import { api } from "@/lib/api";

// Get all categories
const categories = await api.categories.getCategories();

// Get category tree
const tree = await api.categories.getCategoryTree();
```

---

### 4. **Order Service** (`order.service.ts`)

Handles order-related operations.

**Methods:**

- `getOrders(filters?)` - Get all orders
- `getOrder(orderId)` - Get single order
- `createOrder(data)` - Create new order
- `cancelOrder(orderId)` - Cancel order
- `trackOrder(orderNumber, email)` - Track order
- `downloadInvoice(orderId)` - Download invoice

**Usage Example:**

```typescript
import { api } from "@/lib/api";

// Create order
const order = await api.orders.createOrder({
  items: cartItems,
  shippingAddress: address,
  paymentMethod: "razorpay",
});

// Track order
const trackingInfo = await api.orders.trackOrder("ORD-123", "user@email.com");
```

---

### 5. **Cart Service** (`cart.service.ts`)

Handles shopping cart operations.

**Methods:**

- `getCart()` - Get current cart
- `addToCart(productId, quantity)` - Add item to cart
- `updateCartItem(itemId, quantity)` - Update cart item
- `removeFromCart(itemId)` - Remove item from cart
- `clearCart()` - Clear entire cart
- `syncCart(cartData)` - Sync cart with server

**Usage Example:**

```typescript
import { api } from "@/lib/api";

// Add to cart
await api.cart.addToCart("product-123", 2);

// Get cart
const cart = await api.cart.getCart();
```

---

### 6. **Wishlist Service** (`wishlist.service.ts`)

Handles wishlist operations.

**Methods:**

- `getWishlist()` - Get user's wishlist
- `addToWishlist(productId)` - Add product to wishlist
- `removeFromWishlist(productId)` - Remove product from wishlist
- `clearWishlist()` - Clear entire wishlist

**Usage Example:**

```typescript
import { api } from "@/lib/api";

// Add to wishlist
await api.wishlist.addToWishlist("product-123");

// Get wishlist
const wishlist = await api.wishlist.getWishlist();
```

---

### 7. **Review Service** (`review.service.ts`)

Handles product review operations.

**Methods:**

- `getReviews(filters?)` - Get reviews with filters
- `getProductReviews(productId, filters?)` - Get reviews for a product
- `getUserReviews(filters?)` - Get user's reviews
- `createReview(data)` - Create new review
- `updateReview(reviewId, updates)` - Update review
- `deleteReview(reviewId)` - Delete review
- `getReviewStats(productId)` - Get review statistics

**Usage Example:**

```typescript
import { api } from "@/lib/api";

// Create review
await api.reviews.createReview({
  productId: "product-123",
  rating: 5,
  comment: "Great product!",
});

// Get product reviews
const reviews = await api.reviews.getProductReviews("product-123");
```

---

### 8. **User Service** (`user.service.ts`)

Handles user profile and account operations.

**Methods:**

- `getProfile()` - Get user profile
- `updateProfile(data)` - Update user profile
- `getAddresses()` - Get user addresses
- `createAddress(data)` - Create new address
- `updateAddress(addressId, data)` - Update address
- `deleteAddress(addressId)` - Delete address
- `changePassword(data)` - Change password
- `getPreferences()` - Get user preferences
- `updatePreferences(data)` - Update preferences

**Usage Example:**

```typescript
import { api } from "@/lib/api";

// Get profile
const profile = await api.user.getProfile();

// Update profile
await api.user.updateProfile({
  displayName: "New Name",
  phone: "+1234567890",
});
```

---

### 9. **Address Service** (`address.service.ts`)

Handles address management operations.

**Methods:**

- `getAddresses()` - Get all addresses
- `getAddress(addressId)` - Get single address
- `createAddress(data)` - Create new address
- `updateAddress(addressId, data)` - Update address
- `deleteAddress(addressId)` - Delete address
- `setDefaultAddress(addressId)` - Set default address

**Usage Example:**

```typescript
import { api } from "@/lib/api";

// Create address
const address = await api.addresses.createAddress({
  fullName: "John Doe",
  phone: "+1234567890",
  addressLine1: "123 Main St",
  city: "New York",
  state: "NY",
  zipCode: "10001",
  country: "USA",
  isDefault: true,
});
```

---

### 10. **Payment Service** (`payment.service.ts`)

Handles payment gateway operations (Razorpay, PayPal).

**Methods:**

- `createRazorpayOrder(data)` - Create Razorpay order
- `verifyRazorpayPayment(data)` - Verify Razorpay payment
- `createPayPalOrder(data)` - Create PayPal order
- `capturePayPalPayment(data)` - Capture PayPal payment

**Usage Example:**

```typescript
import { api } from "@/lib/api";

// Create Razorpay order
const razorpayOrder = await api.payment.createRazorpayOrder({
  amount: 1000,
  currency: "INR",
  receipt: "order_receipt_123",
});

// Verify payment
await api.payment.verifyRazorpayPayment({
  razorpay_order_id: "order_123",
  razorpay_payment_id: "pay_123",
  razorpay_signature: "signature_123",
  orderId: "order_123",
});
```

---

### 11. **Search Service** (`search.service.ts`)

Handles universal search operations.

**Methods:**

- `search(query)` - Universal search across products, categories, stores
- `searchProducts(query, filters?)` - Search only products

**Usage Example:**

```typescript
import { api } from "@/lib/api";

// Universal search
const results = await api.search.search("beyblade");
// Returns: { products: [...], categories: [...], stores: [...] }

// Search products only
const products = await api.search.searchProducts("beyblade", {
  minPrice: 100,
  maxPrice: 500,
});
```

---

### 12. **Game Service** (`game.service.ts`)

Handles game-related operations (Beyblades & Arenas).

**Beyblade Methods:**

- `getBeyblades()` - Get all beyblades
- `getBeyblade(beybladeId)` - Get single beyblade
- `createBeyblade(data)` - Create new beyblade
- `updateBeyblade(beybladeId, data)` - Update beyblade
- `deleteBeyblade(beybladeId)` - Delete beyblade
- `uploadBeybladeImage(file)` - Upload beyblade image
- `initializeBeyblades()` - Initialize default beyblades

**Arena Methods:**

- `getArenas()` - Get all arenas
- `getArena(arenaId)` - Get single arena
- `createArena(data)` - Create new arena
- `updateArena(arenaId, data)` - Update arena
- `deleteArena(arenaId)` - Delete arena
- `setDefaultArena(arenaId)` - Set default arena
- `initializeArenas()` - Initialize default arenas

**Usage Example:**

```typescript
import { api } from "@/lib/api";

// Get all beyblades
const beyblades = await api.game.getBeyblades();

// Get all arenas
const arenas = await api.game.getArenas();
```

---

### 13. **Seller Service** (`seller.service.ts`)

Handles seller-specific operations.

**Product Methods:**

- `getProducts(filters?)` - Get seller's products
- `getProductStats()` - Get product statistics
- `getLeafCategories()` - Get leaf categories
- `uploadMedia(file)` - Upload product media

**Order Methods:**

- `getOrders(filters?)` - Get seller's orders
- `getOrder(orderId)` - Get order details
- `approveOrder(orderId)` - Approve order
- `rejectOrder(orderId, reason)` - Reject order
- `cancelOrder(orderId, reason)` - Cancel order
- `generateInvoice(orderId)` - Generate invoice

**Coupon Methods:**

- `getCoupons()` - Get seller's coupons
- `createCoupon(data)` - Create new coupon
- `validateCoupon(code, orderTotal)` - Validate coupon
- `toggleCouponStatus(couponId)` - Toggle coupon status

**Other Methods:**

- `getShipments()` - Get shipments
- `trackShipment(shipmentId)` - Track shipment
- `getAnalytics()` - Get analytics overview
- `getShop()` - Get shop profile
- `updateShop(data)` - Update shop profile
- `getAlerts()` - Get seller alerts

**Usage Example:**

```typescript
import { api } from "@/lib/api";

// Get seller products
const { products, total } = await api.seller.getProducts({ status: "active" });

// Get analytics
const analytics = await api.seller.getAnalytics();
```

---

### 14. **Admin Service** (`admin.service.ts`)

Handles admin-specific operations.

**Product Management:**

- `getProducts(filters?)` - Get all products (admin view)
- `getProductStats()` - Get product statistics

**Order Management:**

- `getOrders(filters?)` - Get all orders (admin view)
- `getOrderStats()` - Get order statistics
- `cancelOrder(orderId, reason)` - Cancel order

**User Management:**

- `getUsers(filters?)` - Get all users
- `searchUsers(query)` - Search users
- `getUser(userId)` - Get user details
- `updateUserRole(userId, role)` - Update user role
- `toggleUserBan(userId, banned)` - Ban/Unban user

**Settings Management:**

- `getHeroSettings()` - Get hero settings
- `updateHeroSettings(settings)` - Update hero settings
- `getHeroSlides()` - Get hero slides
- `createHeroSlide(data)` - Create hero slide
- `getThemeSettings()` - Get theme settings
- `updateThemeSettings(settings)` - Update theme settings

**Bulk Operations:**

- `getBulkOperations()` - Get bulk operations
- `createBulkOperation(type, data)` - Create bulk operation
- `exportData(type, filters?)` - Export data

**Usage Example:**

```typescript
import { api } from "@/lib/api";

// Get all users
const { users, total } = await api.admin.getUsers({ role: "seller" });

// Update user role
await api.admin.updateUserRole("user-123", "admin");
```

---

### 15. **Upload Service** (`upload.service.ts`)

Handles file upload operations.

**Methods:**

- `uploadFile(file, options?)` - Upload single file
- `uploadFiles(files, options?)` - Upload multiple files
- `uploadImage(file, maxSize?)` - Upload image with validation
- `getUploadUrl(fileName)` - Get upload URL
- `getFile(fileName)` - Get file from storage
- `deleteFile(fileName)` - Delete file

**Usage Example:**

```typescript
import { api } from "@/lib/api";

// Upload image
const result = await api.upload.uploadImage(file);
console.log(result.url); // URL of uploaded image

// Upload multiple files
const files = [file1, file2, file3];
const results = await api.upload.uploadFiles(files);
```

---

## 🔄 Migration Pattern

To replace direct API calls with service calls:

### Before (Direct API Call):

```typescript
const response = await fetch("/api/products?category=electronics");
const data = await response.json();
```

### After (Service Call):

```typescript
import { api } from "@/lib/api";

const data = await api.products.getProducts({ category: "electronics" });
```

---

## 📦 Import Pattern

All services are available through a single import:

```typescript
import { api } from "@/lib/api";

// Use any service
await api.products.getProducts();
await api.orders.createOrder(data);
await api.cart.addToCart(productId, quantity);
await api.auth.login(credentials);
```

Or import individual services:

```typescript
import { ProductService, OrderService } from "@/lib/api";

await ProductService.getProducts();
await OrderService.createOrder(data);
```

---

## ✅ Benefits

1. **Type Safety** - All methods are fully typed with TypeScript
2. **Centralized Error Handling** - Errors are caught and logged consistently
3. **Easy Maintenance** - API changes only need updates in one place
4. **Reusability** - Services can be used across components and pages
5. **Testing** - Easy to mock for unit tests
6. **Autocomplete** - Full IDE autocomplete support

---

## 📝 Next Steps

1. Replace all direct `fetch()` calls with service methods
2. Update components to use `api.*` pattern
3. Add loading and error states using service methods
4. Create custom hooks that wrap service calls for common operations

---

## 🔍 Finding Direct API Calls

To find and replace direct API calls in your codebase:

```bash
# Search for direct fetch calls
grep -r "fetch('/api" src/

# Search for specific API endpoints
grep -r "/api/products" src/
grep -r "/api/orders" src/
```

---

## 📚 Related Files

- API Client: `src/lib/api/client.ts`
- API Routes Constants: `src/constants/api-routes.ts`
- Service Types: `src/lib/api/services/*.service.ts`
- Service Index: `src/lib/api/index.ts`

---

**Last Updated:** November 4, 2025
