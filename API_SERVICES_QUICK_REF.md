# 🚀 API Services - Quick Reference Card

Import everything you need:

```typescript
import { api } from "@/lib/api";
```

---

## 🛒 Cart

```typescript
await api.cart.getCart();
await api.cart.addItem(item);
await api.cart.saveCart(items);
await api.cart.syncCart();
await api.cart.mergeGuestCart(items);
await api.cart.clearCart();
```

## ❤️ Wishlist

```typescript
await api.wishlist.getWishlist();
await api.wishlist.addItem(item);
await api.wishlist.removeItem(id);
await api.wishlist.clearWishlist();
await api.wishlist.isInWishlist(productId);
```

## 📦 Products

```typescript
await api.products.getProducts(filters);
await api.products.getProduct(slug);
await api.products.searchProducts(query);
await api.products.getFeaturedProducts();
await api.products.getProductsByCategory(id);
await api.products.getRelatedProducts(id);
```

## 📋 Orders

```typescript
await api.orders.getOrders(filters);
await api.orders.getOrder(id);
await api.orders.createOrder(data);
await api.orders.cancelOrder(id, reason);
await api.orders.trackOrder(id);
await api.orders.downloadInvoice(id);
```

## ⭐ Reviews

```typescript
await api.reviews.getReviews(filters);
await api.reviews.getProductReviews(productId);
await api.reviews.getUserReviews();
await api.reviews.createReview(data);
await api.reviews.updateReview(id, updates);
await api.reviews.deleteReview(id);
await api.reviews.markHelpful(id);
await api.reviews.getReviewStats(productId);
```

## 👤 User

```typescript
await api.user.getProfile();
await api.user.updateProfile(updates);
await api.user.uploadAvatar(file);
await api.user.getAddresses();
await api.user.createAddress(data);
await api.user.updateAddress(id, updates);
await api.user.deleteAddress(id);
await api.user.setDefaultAddress(id);
await api.user.changePassword(data);
await api.user.getUserStats();
```

## 📑 Categories

```typescript
await api.categories.getCategoryTree();
await api.categories.getCategories(filters);
await api.categories.getCategory(slug);
await api.categories.getFeaturedCategories();
await api.categories.getTopCategories();
await api.categories.getSubcategories(id);
```

---

## 💡 Common Patterns

### Load Product Page

```typescript
const [product, reviews, related] = await Promise.all([
  api.products.getProduct(slug),
  api.reviews.getProductReviews(productId),
  api.products.getRelatedProducts(productId),
]);
```

### Add to Cart with Feedback

```typescript
try {
  await api.cart.addItem(item);
  toast.success("Added to cart");
} catch (error) {
  toast.error("Failed to add to cart");
}
```

### Place Order

```typescript
const cart = await api.cart.getCart();
const order = await api.orders.createOrder({
  items: cart.items,
  shippingAddress: address,
  paymentMethod: "razorpay",
});
await api.cart.clearCart();
router.push(`/orders/${order.id}`);
```

### Submit Review

```typescript
await api.reviews.createReview({
  productId: "prod_123",
  rating: 5,
  title: "Great product!",
  comment: "Very satisfied",
});
```

---

**Tip:** All services handle authentication, caching, and error logging automatically!

**Last Updated:** November 3, 2025
