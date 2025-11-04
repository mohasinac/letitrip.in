# API Services Quick Reference

> **Quick lookup for all available API services**

## 📥 Import

```typescript
import { api } from "@/lib/api";
```

---

## 🛍️ Products

```typescript
api.products.getProducts(filters?)           // Get products list
api.products.getProduct(slug)                // Get single product
api.products.searchProducts(query, filters?) // Search products
api.products.getFeaturedProducts(limit?)     // Get featured products
api.products.getProductsByCategory(id, filters?) // By category
api.products.getRelatedProducts(id, limit?)  // Related products
```

---

## 📦 Orders

```typescript
api.orders.getOrders(filters?)               // Get user orders
api.orders.getOrder(orderId)                 // Get single order
api.orders.createOrder(data)                 // Create new order
api.orders.cancelOrder(orderId)              // Cancel order
api.orders.trackOrder(orderNumber, email)    // Track order
api.orders.downloadInvoice(orderId)          // Download invoice
```

---

## 🛒 Cart

```typescript
api.cart.getCart(); // Get cart
api.cart.addToCart(productId, quantity); // Add item
api.cart.updateCartItem(itemId, quantity); // Update item
api.cart.removeFromCart(itemId); // Remove item
api.cart.clearCart(); // Clear cart
api.cart.syncCart(cartData); // Sync with server
```

---

## ❤️ Wishlist

```typescript
api.wishlist.getWishlist(); // Get wishlist
api.wishlist.addToWishlist(productId); // Add item
api.wishlist.removeFromWishlist(productId); // Remove item
api.wishlist.clearWishlist(); // Clear wishlist
```

---

## ⭐ Reviews

```typescript
api.reviews.getReviews(filters?)             // Get reviews
api.reviews.getProductReviews(productId)     // Product reviews
api.reviews.getUserReviews(filters?)         // User reviews
api.reviews.createReview(data)               // Create review
api.reviews.updateReview(reviewId, data)     // Update review
api.reviews.deleteReview(reviewId)           // Delete review
api.reviews.getReviewStats(productId)        // Review stats
```

---

## 🏷️ Categories

```typescript
api.categories.getCategories(filters?)       // Get categories
api.categories.getCategoryTree()             // Get tree
api.categories.getCategory(slug)             // Get single
api.categories.getSubcategories(categoryId)  // Get subcategories
```

---

## 🔐 Auth

```typescript
api.auth.register(data); // Register user
api.auth.sendOtp(data); // Send OTP
api.auth.verifyOtp(data); // Verify OTP
api.auth.getCurrentUser(); // Get current user
api.auth.changePassword(data); // Change password
api.auth.deleteAccount(); // Delete account
```

---

## 👤 User

```typescript
api.user.getProfile(); // Get profile
api.user.updateProfile(data); // Update profile
api.user.getAddresses(); // Get addresses
api.user.createAddress(data); // Create address
api.user.updateAddress(id, data); // Update address
api.user.deleteAddress(id); // Delete address
api.user.changePassword(data); // Change password
api.user.getPreferences(); // Get preferences
api.user.updatePreferences(data); // Update preferences
```

---

## 📍 Addresses

```typescript
api.addresses.getAddresses(); // Get all addresses
api.addresses.getAddress(addressId); // Get single
api.addresses.createAddress(data); // Create address
api.addresses.updateAddress(id, data); // Update address
api.addresses.deleteAddress(id); // Delete address
api.addresses.setDefaultAddress(id); // Set default
```

---

## 💳 Payment

```typescript
// Razorpay
api.payment.createRazorpayOrder(data); // Create order
api.payment.verifyRazorpayPayment(data); // Verify payment

// PayPal
api.payment.createPayPalOrder(data); // Create order
api.payment.capturePayPalPayment(data); // Capture payment
```

---

## 🔍 Search

```typescript
api.search.search(query)                     // Universal search
api.search.searchProducts(query, filters?)   // Search products only
```

---

## 🎮 Game

```typescript
// Beyblades
api.game.getBeyblades(); // Get all beyblades
api.game.getBeyblade(id); // Get single
api.game.createBeyblade(data); // Create beyblade
api.game.updateBeyblade(id, data); // Update beyblade
api.game.deleteBeyblade(id); // Delete beyblade
api.game.uploadBeybladeImage(file); // Upload image
api.game.initializeBeyblades(); // Init defaults

// Arenas
api.game.getArenas(); // Get all arenas
api.game.getArena(id); // Get single
api.game.createArena(data); // Create arena
api.game.updateArena(id, data); // Update arena
api.game.deleteArena(id); // Delete arena
api.game.setDefaultArena(id); // Set default
api.game.initializeArenas(); // Init defaults
```

---

## 🏪 Seller

```typescript
// Products
api.seller.getProducts(filters?)             // Get products
api.seller.getProductStats()                 // Get stats
api.seller.getLeafCategories()               // Get categories
api.seller.uploadMedia(file)                 // Upload media

// Orders
api.seller.getOrders(filters?)               // Get orders
api.seller.getOrder(orderId)                 // Get single
api.seller.approveOrder(orderId)             // Approve order
api.seller.rejectOrder(orderId, reason)      // Reject order
api.seller.cancelOrder(orderId, reason)      // Cancel order
api.seller.generateInvoice(orderId)          // Generate invoice

// Coupons
api.seller.getCoupons()                      // Get coupons
api.seller.createCoupon(data)                // Create coupon
api.seller.validateCoupon(code, total)       // Validate coupon
api.seller.toggleCouponStatus(couponId)      // Toggle status

// Other
api.seller.getShipments()                    // Get shipments
api.seller.trackShipment(shipmentId)         // Track shipment
api.seller.getAnalytics()                    // Get analytics
api.seller.getShop()                         // Get shop
api.seller.updateShop(data)                  // Update shop
api.seller.getAlerts()                       // Get alerts
api.seller.markAlertAsRead(alertId)          // Mark as read
api.seller.bulkMarkAlertsAsRead(ids)         // Bulk mark as read
```

---

## 👨‍💼 Admin

```typescript
// Products
api.admin.getProducts(filters?)              // Get all products
api.admin.getProductStats()                  // Get stats

// Orders
api.admin.getOrders(filters?)                // Get all orders
api.admin.getOrderStats()                    // Get stats
api.admin.cancelOrder(orderId, reason)       // Cancel order

// Users
api.admin.getUsers(filters?)                 // Get all users
api.admin.searchUsers(query)                 // Search users
api.admin.getUser(userId)                    // Get single user
api.admin.updateUserRole(userId, role)       // Update role
api.admin.toggleUserBan(userId, banned)      // Ban/Unban user

// Reviews
api.admin.getReviews(filters?)               // Get all reviews

// Settings
api.admin.getHeroSettings()                  // Get hero settings
api.admin.updateHeroSettings(settings)       // Update hero settings
api.admin.getHeroSlides()                    // Get hero slides
api.admin.createHeroSlide(data)              // Create hero slide
api.admin.getThemeSettings()                 // Get theme settings
api.admin.updateThemeSettings(settings)      // Update theme settings

// Bulk Operations
api.admin.getBulkOperations()                // Get operations
api.admin.createBulkOperation(type, data)    // Create operation
api.admin.exportData(type, filters?)         // Export data
```

---

## 📤 Upload

```typescript
api.upload.uploadFile(file, options?)        // Upload file
api.upload.uploadFiles(files, options?)      // Upload multiple
api.upload.uploadImage(file, maxSize?)       // Upload image
api.upload.getUploadUrl(fileName)            // Get upload URL
api.upload.getFile(fileName)                 // Get file
api.upload.deleteFile(fileName)              // Delete file
```

---

## 📝 Common Patterns

### Basic Usage

```typescript
const products = await api.products.getProducts();
```

### With Error Handling

```typescript
try {
  const products = await api.products.getProducts();
} catch (error) {
  console.error("Error:", error);
}
```

### With Loading State

```typescript
setLoading(true);
try {
  const products = await api.products.getProducts();
  setProducts(products);
} catch (error) {
  setError(error.message);
} finally {
  setLoading(false);
}
```

### In useEffect

```typescript
useEffect(() => {
  const fetchData = async () => {
    const data = await api.products.getProducts();
    setProducts(data.products);
  };
  fetchData();
}, []);
```

---

## 🔗 Related Documentation

- Full Documentation: `docs/API_SERVICES_DOCUMENTATION.md`
- Migration Guide: `docs/API_SERVICE_MIGRATION_GUIDE.md`
- Summary: `docs/API_SERVICE_LAYER_SUMMARY.md`

---

**💡 Tip:** Use IDE autocomplete (`api.`) to see all available services and methods!
