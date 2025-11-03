# 🚀 Complete API Services Guide

**Last Updated:** November 3, 2025

---

## 📦 Available Services

All services are available through the centralized `api` object or individual imports:

```typescript
import { api } from "@/lib/api";
// OR
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

---

## 1. 🛒 Cart Service

### Methods

#### `getCart()`

Get user's cart from API.

```typescript
const cart = await api.cart.getCart();
// Returns: { items: CartItem[], subtotal: number, itemCount: number }
```

#### `saveCart(items)`

Save entire cart to API.

```typescript
await api.cart.saveCart(items);
```

#### `addItem(item)`

Add single item to cart.

```typescript
await api.cart.addItem({
  id: "cart_123",
  productId: "prod_456",
  name: "Product Name",
  price: 1000,
  quantity: 1,
  stock: 10,
  sellerId: "seller_123",
  sellerName: "Seller",
  image: "/image.jpg",
});
```

#### `mergeGuestCart(guestItems)`

Merge guest cart with user cart on login.

```typescript
await api.cart.mergeGuestCart(guestCartItems);
```

#### `syncCart()`

Sync cart with latest prices and availability.

```typescript
const result = await api.cart.syncCart();
// Returns: { cart, changes: [...] }
```

#### `clearCart()`

Clear all items from cart.

```typescript
await api.cart.clearCart();
```

---

## 2. ❤️ Wishlist Service

### Methods

#### `getWishlist()`

Get user's wishlist.

```typescript
const wishlist = await api.wishlist.getWishlist();
// Returns: { items: WishlistItem[], itemCount: number }
```

#### `addItem(item)`

Add item to wishlist.

```typescript
await api.wishlist.addItem({
  id: "wish_123",
  productId: "prod_456",
  name: "Product Name",
  price: 1000,
  image: "/image.jpg",
  addedAt: new Date().toISOString(),
});
```

#### `removeItem(itemId)`

Remove item from wishlist.

```typescript
await api.wishlist.removeItem("wish_123");
```

#### `clearWishlist()`

Clear entire wishlist.

```typescript
await api.wishlist.clearWishlist();
```

#### `isInWishlist(productId)`

Check if product is in wishlist.

```typescript
const exists = await api.wishlist.isInWishlist("prod_456");
// Returns: boolean
```

---

## 3. 📦 Product Service

### Methods

#### `getProducts(filters?)`

Get all products with optional filters.

```typescript
const response = await api.products.getProducts({
  category: "electronics",
  search: "laptop",
  minPrice: 1000,
  maxPrice: 50000,
  inStock: true,
  featured: false,
  sortBy: "price",
  order: "asc",
  page: 1,
  limit: 20,
});
// Returns: { products: Product[], total, page, limit, totalPages }
```

#### `getProduct(idOrSlug)`

Get single product by ID or slug.

```typescript
const product = await api.products.getProduct("laptop-hp-15s");
```

#### `searchProducts(query, filters?)`

Search products with query string.

```typescript
const results = await api.products.searchProducts("gaming laptop", {
  minPrice: 50000,
  maxPrice: 100000,
  page: 1,
  limit: 20,
});
```

#### `getFeaturedProducts(limit?)`

Get featured products.

```typescript
const featured = await api.products.getFeaturedProducts(10);
```

#### `getProductsByCategory(categoryId, filters?)`

Get products by category.

```typescript
const products = await api.products.getProductsByCategory("cat_123", {
  sortBy: "rating",
  order: "desc",
});
```

#### `getRelatedProducts(productId, limit?)`

Get related products.

```typescript
const related = await api.products.getRelatedProducts("prod_123", 4);
```

---

## 4. 📋 Order Service

### Methods

#### `getOrders(filters?)`

Get all orders for current user.

```typescript
const response = await api.orders.getOrders({
  status: "delivered",
  startDate: "2025-01-01",
  endDate: "2025-12-31",
  page: 1,
  limit: 10,
});
// Returns: { orders: Order[], total, page, limit }
```

#### `getOrder(orderId)`

Get single order by ID.

```typescript
const order = await api.orders.getOrder("order_123");
```

#### `createOrder(orderData)`

Create new order.

```typescript
const order = await api.orders.createOrder({
  items: [
    {
      productId: "prod_123",
      name: "Product",
      image: "/image.jpg",
      price: 1000,
      quantity: 2,
      sellerId: "seller_123",
    },
  ],
  shippingAddress: {
    name: "John Doe",
    phone: "1234567890",
    addressLine1: "123 Street",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400001",
    country: "India",
  },
  paymentMethod: "razorpay",
  notes: "Please deliver before 5 PM",
});
```

#### `cancelOrder(orderId, reason?)`

Cancel an order.

```typescript
await api.orders.cancelOrder("order_123", "Changed my mind");
```

#### `trackOrder(orderId)`

Track order status.

```typescript
const tracking = await api.orders.trackOrder("order_123");
// Returns: { order, timeline: [...] }
```

#### `downloadInvoice(orderId)`

Download order invoice as PDF.

```typescript
const blob = await api.orders.downloadInvoice("order_123");
// Create download link
const url = URL.createObjectURL(blob);
const a = document.createElement("a");
a.href = url;
a.download = `invoice-${orderId}.pdf`;
a.click();
```

---

## 5. ⭐ Review Service

### Methods

#### `getReviews(filters?)`

Get reviews with filters.

```typescript
const response = await api.reviews.getReviews({
  productId: "prod_123",
  rating: 5,
  status: "approved",
  sortBy: "helpful",
  order: "desc",
  page: 1,
  limit: 10,
});
// Returns: { reviews: Review[], stats, total, page, limit }
```

#### `getProductReviews(productId, filters?)`

Get reviews for specific product.

```typescript
const reviews = await api.reviews.getProductReviews("prod_123", {
  sortBy: "createdAt",
  order: "desc",
});
```

#### `getUserReviews(filters?)`

Get current user's reviews.

```typescript
const myReviews = await api.reviews.getUserReviews();
```

#### `createReview(reviewData)`

Create new review.

```typescript
const review = await api.reviews.createReview({
  productId: "prod_123",
  rating: 5,
  title: "Excellent Product!",
  comment: "Very satisfied with the purchase.",
  images: ["/review1.jpg", "/review2.jpg"],
});
```

#### `updateReview(reviewId, updates)`

Update existing review.

```typescript
await api.reviews.updateReview("review_123", {
  rating: 4,
  comment: "Updated comment",
});
```

#### `deleteReview(reviewId)`

Delete a review.

```typescript
await api.reviews.deleteReview("review_123");
```

#### `markHelpful(reviewId)`

Mark review as helpful.

```typescript
await api.reviews.markHelpful("review_123");
```

#### `getReviewStats(productId)`

Get review statistics for a product.

```typescript
const stats = await api.reviews.getReviewStats("prod_123");
// Returns: { average, total, distribution: { 1: 0, 2: 1, 3: 5, 4: 10, 5: 20 } }
```

---

## 6. 👤 User Service

### Methods

#### `getProfile()`

Get current user profile.

```typescript
const profile = await api.user.getProfile();
```

#### `updateProfile(updates)`

Update user profile.

```typescript
const updated = await api.user.updateProfile({
  name: "John Doe",
  phone: "1234567890",
  preferences: {
    currency: "INR",
    language: "en",
    notifications: {
      email: true,
      sms: false,
      push: true,
    },
  },
});
```

#### `uploadAvatar(file)`

Upload profile avatar.

```typescript
const result = await api.user.uploadAvatar(fileBlob);
// Returns: { url: "https://..." }

// Then update profile with new avatar URL
await api.user.updateProfile({ avatar: result.url });
```

#### `getAddresses()`

Get all saved addresses.

```typescript
const addresses = await api.user.getAddresses();
```

#### `createAddress(addressData)`

Create new address.

```typescript
const address = await api.user.createAddress({
  name: "John Doe",
  phone: "1234567890",
  addressLine1: "123 Main St",
  addressLine2: "Apt 4B",
  city: "Mumbai",
  state: "Maharashtra",
  pincode: "400001",
  country: "India",
  isDefault: true,
  type: "home",
});
```

#### `updateAddress(addressId, updates)`

Update existing address.

```typescript
await api.user.updateAddress("addr_123", {
  phone: "9876543210",
  isDefault: true,
});
```

#### `deleteAddress(addressId)`

Delete an address.

```typescript
await api.user.deleteAddress("addr_123");
```

#### `setDefaultAddress(addressId)`

Set address as default.

```typescript
await api.user.setDefaultAddress("addr_123");
```

#### `changePassword(data)`

Change user password.

```typescript
await api.user.changePassword({
  currentPassword: "oldpass123",
  newPassword: "newpass456",
});
```

#### `deleteAccount(password)`

Delete user account (requires password).

```typescript
await api.user.deleteAccount("mypassword");
```

#### `getUserStats()`

Get user statistics.

```typescript
const stats = await api.user.getUserStats();
// Returns: { totalOrders, totalSpent, totalReviews, wishlistCount }
```

---

## 7. 📑 Category Service

### Methods

#### `getCategoryTree()`

Get all categories as tree structure.

```typescript
const tree = await api.categories.getCategoryTree();
// Returns nested categories with children
```

#### `getCategories(filters?)`

Get all categories as flat list.

```typescript
const categories = await api.categories.getCategories({
  level: 0, // Top-level categories
  featured: true,
  active: true,
});
```

#### `getCategory(idOrSlug)`

Get single category by ID or slug.

```typescript
const category = await api.categories.getCategory("electronics");
```

#### `getFeaturedCategories()`

Get featured categories.

```typescript
const featured = await api.categories.getFeaturedCategories();
```

#### `getTopCategories()`

Get top-level categories.

```typescript
const topLevel = await api.categories.getTopCategories();
```

#### `getSubcategories(categoryId)`

Get subcategories of a category.

```typescript
const subs = await api.categories.getSubcategories("cat_123");
```

---

## 🎯 Usage Examples

### Complete Product Page

```typescript
import { api } from "@/lib/api";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function ProductPage({ slug }: { slug: string }) {
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProductData();
  }, [slug]);

  const loadProductData = async () => {
    try {
      setLoading(true);

      // Load product, reviews, and related products in parallel
      const [productData, reviewsData, relatedData] = await Promise.all([
        api.products.getProduct(slug),
        api.reviews.getProductReviews(slug, { limit: 5 }),
        api.products.getRelatedProducts(slug, 4),
      ]);

      setProduct(productData);
      setReviews(reviewsData.reviews);
      setRelated(relatedData);
    } catch (error) {
      toast.error("Failed to load product");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    try {
      await api.cart.addItem({
        id: `cart_${Date.now()}`,
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        stock: product.stock,
        sellerId: product.sellerId,
        sellerName: product.sellerName,
        image: product.images[0],
      });
      toast.success("Added to cart");
    } catch (error) {
      toast.error("Failed to add to cart");
    }
  };

  const handleAddToWishlist = async () => {
    try {
      await api.wishlist.addItem({
        id: `wish_${Date.now()}`,
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.images[0],
        addedAt: new Date().toISOString(),
      });
      toast.success("Added to wishlist");
    } catch (error) {
      toast.error("Failed to add to wishlist");
    }
  };

  // ... render UI
}
```

### Complete Checkout Flow

```typescript
import { api } from "@/lib/api";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const router = useRouter();
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("razorpay");

  const handleCheckout = async () => {
    try {
      // Get current cart
      const cart = await api.cart.getCart();

      if (cart.items.length === 0) {
        toast.error("Cart is empty");
        return;
      }

      // Create order
      const order = await api.orders.createOrder({
        items: cart.items,
        shippingAddress: selectedAddress,
        paymentMethod,
      });

      // Clear cart after successful order
      await api.cart.clearCart();

      // Redirect to order confirmation
      router.push(`/orders/${order.id}`);
      toast.success("Order placed successfully!");
    } catch (error) {
      toast.error("Failed to place order");
    }
  };

  // ... render UI
}
```

### User Profile Management

```typescript
import { api } from "@/lib/api";
import { useState, useEffect } from "react";

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    const [profileData, addressData, statsData] = await Promise.all([
      api.user.getProfile(),
      api.user.getAddresses(),
      api.user.getUserStats(),
    ]);

    setProfile(profileData);
    setAddresses(addressData);
    setStats(statsData);
  };

  const handleUpdateProfile = async (updates) => {
    try {
      const updated = await api.user.updateProfile(updates);
      setProfile(updated);
      toast.success("Profile updated");
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  const handleAvatarUpload = async (file) => {
    try {
      const result = await api.user.uploadAvatar(file);
      await handleUpdateProfile({ avatar: result.url });
    } catch (error) {
      toast.error("Failed to upload avatar");
    }
  };

  // ... render UI
}
```

---

## 🔥 Best Practices

### 1. Error Handling

Always wrap API calls in try-catch blocks:

```typescript
try {
  const data = await api.products.getProducts();
  // Handle success
} catch (error) {
  console.error("Failed to fetch products:", error);
  toast.error("Failed to load products");
  // Handle error gracefully
}
```

### 2. Loading States

Show loading indicators during API calls:

```typescript
const [loading, setLoading] = useState(false);

const loadData = async () => {
  setLoading(true);
  try {
    const data = await api.products.getProducts();
    setProducts(data.products);
  } finally {
    setLoading(false);
  }
};
```

### 3. Parallel Requests

Use `Promise.all` for independent requests:

```typescript
const [products, categories, reviews] = await Promise.all([
  api.products.getFeaturedProducts(),
  api.categories.getFeaturedCategories(),
  api.reviews.getReviews({ limit: 10 }),
]);
```

### 4. Caching

Take advantage of automatic caching:

```typescript
// First call - hits API
const data1 = await api.products.getProducts();

// Second call within 5 minutes - returns cached data
const data2 = await api.products.getProducts();

// Force fresh data
const data3 = await apiClient.get("/api/products", {}, { skipCache: true });
```

### 5. Type Safety

Use TypeScript types for better development experience:

```typescript
import { Product, ProductFilters } from "@/lib/api";

const filters: ProductFilters = {
  category: "electronics",
  minPrice: 1000,
  maxPrice: 50000,
};

const products: Product[] = await api.products.getProducts(filters);
```

---

## 📚 Additional Resources

- **API Client:** `src/lib/api/client.ts`
- **Service Files:** `src/lib/api/services/*.service.ts`
- **Type Definitions:** Included in each service file
- **Usage Examples:** `docs/examples/API_USAGE_EXAMPLES.tsx`

---

**Last Updated:** November 3, 2025  
**Version:** 2.0.0
