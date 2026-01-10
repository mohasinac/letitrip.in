# Services Layer

This folder contains service classes that encapsulate business logic and API communication. Services act as the data layer between components and backend APIs/Firebase.

## Authentication & User Services

### auth.service.ts

**Export:** `authService`

**Purpose:** User authentication and session management.

**Key Methods:**

- `login(email, password, rememberMe?)` - Email/password authentication
- `loginWithGoogle(idToken, userData)` - Google OAuth login
- `register(data)` - User registration
- `logout()` - Sign out user
- `getCurrentUser()` - Get current authenticated user
- `getCachedUser()` - Get cached user (instant)
- `refreshToken()` - Refresh auth token
- `verifyEmail(token)` - Verify email address
- `resetPassword(email)` - Send password reset email
- `updatePassword(oldPassword, newPassword)` - Change password

**Features:**

- JWT token management
- Session persistence
- Token refresh logic
- Remember me functionality
- User caching for performance
- OAuth integration

---

### auth-persistence.service.ts

**Export:** `authPersistenceService`

**Purpose:** Manages authentication data persistence.

**Key Methods:**

- `enableRememberMe(days)` - Enable persistent sessions
- `disableRememberMe()` - Clear persistent sessions
- `saveSession(token, user)` - Save session data
- `getSession()` - Retrieve session
- `clearSession()` - Remove session
- `isRememberMeEnabled()` - Check if remember me is active

---

### users.service.ts

**Export:** `usersService`

**Purpose:** User profile and account management.

**Key Methods:**

- `getProfile(userId)` - Get user profile
- `updateProfile(userId, data)` - Update profile
- `uploadProfilePicture(file)` - Upload profile photo
- `getAddresses(userId)` - Get user addresses
- `addAddress(userId, address)` - Add new address
- `updateAddress(addressId, address)` - Update address
- `deleteAddress(addressId)` - Delete address
- `setDefaultAddress(addressId)` - Set default address

---

## E-commerce Core Services

### products.service.ts

**Export:** `productsService`

**Purpose:** Product catalog management.

**Key Methods:**

- `getProducts(filters, pagination)` - List products with filters
- `getProductById(id)` - Get single product
- `getProductBySlug(slug)` - Get product by URL slug
- `createProduct(data)` - Create new product (seller)
- `updateProduct(id, data)` - Update product
- `deleteProduct(id)` - Delete product
- `searchProducts(query)` - Search products
- `getFeaturedProducts()` - Get featured products
- `getRelatedProducts(productId)` - Get similar products
- `updateStock(productId, quantity)` - Update inventory

**Features:**

- Pagination support
- Advanced filtering
- Full-text search
- Image management
- Variant handling
- Stock management
- Seller-specific queries

---

### auctions.service.ts

**Export:** `auctionsService`

**Purpose:** Auction management and bidding.

**Key Methods:**

- `getAuctions(filters)` - List auctions
- `getAuctionById(id)` - Get auction details
- `createAuction(data)` - Create auction (seller)
- `updateAuction(id, data)` - Update auction
- `placeBid(auctionId, bidAmount)` - Place bid
- `getAuctionBids(auctionId)` - Get bid history
- `getMyBids(userId)` - User's bids
- `getActiveAuctions()` - Currently active auctions
- `getEndingSoonAuctions()` - Auctions ending soon
- `cancelAuction(id)` - Cancel auction

**Features:**

- Real-time bid updates
- Auto-bid functionality
- Auction status tracking
- Winner determination
- Bid notifications

---

### cart.service.ts

**Export:** `cartService`

**Purpose:** Shopping cart management.

**Key Methods:**

- `getCart(userId?)` - Get cart (guest or user)
- `addToCart(item)` - Add item
- `updateCartItem(itemId, quantity)` - Update quantity
- `removeFromCart(itemId)` - Remove item
- `clearCart()` - Empty cart
- `mergeGuestCart(guestCart, userId)` - Merge guest cart to user
- `validateCart()` - Validate stock and prices
- `getCartTotal()` - Calculate total
- `applyCoupon(code)` - Apply discount code

**Features:**

- Guest cart (localStorage)
- User cart (Firestore)
- Cart merging on login
- Stock validation
- Price recalculation
- Coupon support

---

### checkout.service.ts

**Export:** `checkoutService`

**Purpose:** Checkout process management.

**Key Methods:**

- `validateCheckout(cart, address, payment)` - Validate checkout data
- `calculateShipping(address, items)` - Calculate shipping
- `calculateTax(address, subtotal)` - Calculate tax
- `createOrder(checkoutData)` - Process order
- `confirmPayment(orderId, paymentId)` - Confirm payment
- `getCheckoutSession(userId)` - Get saved checkout state
- `saveCheckoutProgress(data)` - Save progress

**Features:**

- Multi-step validation
- Shipping calculation
- Tax calculation
- Payment processing
- Order creation
- Progress persistence

---

### orders.service.ts

**Export:** `ordersService`

**Purpose:** Order management and tracking.

**Key Methods:**

- `getOrders(userId, filters)` - Get user orders
- `getOrderById(orderId)` - Get order details
- `updateOrderStatus(orderId, status)` - Update status
- `cancelOrder(orderId, reason)` - Cancel order
- `trackOrder(orderId)` - Get tracking info
- `getOrderHistory(userId)` - Order history
- `downloadInvoice(orderId)` - Get invoice PDF
- `requestReturn(orderId, items, reason)` - Return request

---

### payment.service.ts

**Export:** `paymentService`

**Purpose:** Payment processing.

**Key Methods:**

- `createPaymentIntent(amount, currency)` - Initialize payment
- `confirmPayment(paymentIntentId)` - Confirm payment
- `refundPayment(paymentId, amount)` - Process refund
- `getPaymentMethods(userId)` - Get saved payment methods
- `addPaymentMethod(userId, method)` - Save payment method
- `deletePaymentMethod(methodId)` - Remove payment method
- `processPayment(orderId, paymentData)` - Process order payment

---

### payment-gateway.service.ts

**Export:** `paymentGatewayService`

**Purpose:** Multi-gateway payment routing.

**Key Methods:**

- `selectGateway(amount, currency, userPreference)` - Choose payment gateway
- `processWithRazorpay(data)` - Razorpay payment
- `processWithStripe(data)` - Stripe payment
- `processWithPayPal(data)` - PayPal payment
- `verifyPayment(gateway, paymentId)` - Verify payment
- `getGatewayStatus()` - Check gateway availability

---

## Seller & Shop Services

### shops.service.ts

**Export:** `shopsService`

**Purpose:** Shop/store management.

**Key Methods:**

- `getShops(filters)` - List shops
- `getShopById(id)` - Get shop details
- `getShopBySlug(slug)` - Get shop by URL
- `createShop(data)` - Create shop (seller)
- `updateShop(id, data)` - Update shop
- `getShopProducts(shopId)` - Shop products
- `getShopStats(shopId)` - Shop statistics
- `followShop(shopId)` - Follow shop
- `unfollowShop(shopId)` - Unfollow shop

---

### seller-settings.service.ts

**Export:** `sellerSettingsService`

**Purpose:** Seller-specific configuration.

**Key Methods:**

- `getSettings(sellerId)` - Get seller settings
- `updateSettings(sellerId, settings)` - Update settings
- `getBankDetails(sellerId)` - Get bank account
- `updateBankDetails(data)` - Update bank info
- `getTaxDetails(sellerId)` - Get tax registration
- `updateTaxDetails(data)` - Update tax info
- `getShippingSettings(sellerId)` - Shipping config
- `updateShippingSettings(data)` - Update shipping

---

### payouts.service.ts

**Export:** `payoutsService`

**Purpose:** Seller payout management.

**Key Methods:**

- `getPayouts(sellerId, filters)` - List payouts
- `requestPayout(sellerId, amount)` - Request payout
- `getPayoutDetails(payoutId)` - Payout details
- `getBalance(sellerId)` - Current balance
- `getEarningsReport(sellerId, period)` - Earnings report

---

## Content & Media Services

### media.service.ts

**Export:** `mediaService`

**Purpose:** File upload and media management.

**Key Methods:**

- `uploadFile(file, folder, options)` - Upload file to Firebase Storage
- `uploadMultiple(files, folder)` - Upload multiple files
- `deleteFile(url)` - Delete file
- `deleteMultiple(urls)` - Delete multiple files
- `getSignedUrl(url, expiresIn)` - Get temporary URL
- `compressImage(file, quality)` - Compress image before upload
- `resizeImage(file, dimensions)` - Resize image
- `generateThumbnail(file)` - Create thumbnail

---

### blog.service.ts

**Export:** `blogService`

**Purpose:** Blog/content management.

**Key Methods:**

- `getPosts(filters, pagination)` - List blog posts
- `getPostById(id)` - Get post
- `getPostBySlug(slug)` - Get by URL slug
- `createPost(data)` - Create post (admin)
- `updatePost(id, data)` - Update post
- `deletePost(id)` - Delete post
- `publishPost(id)` - Publish draft
- `unpublishPost(id)` - Unpublish post

---

## Helper Services

### categories.service.ts

**Export:** `categoriesService`

**Purpose:** Product category management.

**Key Methods:**

- `getCategories()` - Get all categories
- `getCategoryById(id)` - Get category
- `getCategoryTree()` - Hierarchical categories
- `getSubcategories(parentId)` - Child categories
- `createCategory(data)` - Create category (admin)
- `updateCategory(id, data)` - Update category
- `deleteCategory(id)` - Delete category

---

### reviews.service.ts

**Export:** `reviewsService`

**Purpose:** Product and shop reviews.

**Key Methods:**

- `getReviews(productId/shopId, filters)` - Get reviews
- `createReview(data)` - Submit review
- `updateReview(id, data)` - Update review
- `deleteReview(id)` - Delete review
- `likeReview(id)` - Like review
- `reportReview(id, reason)` - Report review
- `getReviewStats(productId)` - Rating statistics

---

### favorites.service.ts

**Export:** `favoritesService`

**Purpose:** User favorites/wishlist.

**Key Methods:**

- `getFavorites(userId)` - Get user favorites
- `addToFavorites(userId, itemId, type)` - Add favorite
- `removeFromFavorites(userId, itemId)` - Remove favorite
- `isFavorite(userId, itemId)` - Check if favorited
- `clearFavorites(userId)` - Clear all favorites

---

### notification.service.ts

**Export:** `notificationService`

**Purpose:** User notifications.

**Key Methods:**

- `getNotifications(userId, filters)` - Get notifications
- `markAsRead(notificationId)` - Mark read
- `markAllAsRead(userId)` - Mark all read
- `deleteNotification(id)` - Delete notification
- `getUnreadCount(userId)` - Unread count
- `subscribeToNotifications(userId, callback)` - Real-time subscribe

---

### messages.service.ts

**Export:** `messagesService`

**Purpose:** User messaging system.

**Key Methods:**

- `getConversations(userId)` - Get user conversations
- `getMessages(conversationId)` - Get conversation messages
- `sendMessage(conversationId, message)` - Send message
- `markAsRead(messageId)` - Mark read
- `deleteMessage(messageId)` - Delete message
- `createConversation(participants)` - Start conversation

---

## Shipping & Location Services

### shipping.service.ts

**Export:** `shippingService`

**Purpose:** Shipping rate calculation and management.

**Key Methods:**

- `calculateShipping(from, to, items)` - Calculate rates
- `getShippingMethods()` - Available methods
- `createShipment(orderId, data)` - Create shipment
- `trackShipment(trackingNumber)` - Track package
- `cancelShipment(shipmentId)` - Cancel shipment

---

### shiprocket.service.ts

**Export:** `shiprocketService`

**Purpose:** Shiprocket API integration.

**Key Methods:**

- `authenticate()` - Get API token
- `createOrder(orderData)` - Create Shiprocket order
- `generateAWB(shipmentId)` - Generate airway bill
- `schedulePickup(shipmentId, date)` - Schedule pickup
- `trackShipment(awb)` - Track shipment
- `cancelShipment(shipmentId)` - Cancel shipment

---

### location.service.ts

**Export:** `locationService`

**Purpose:** Location and address utilities.

**Key Methods:**

- `getPincodeDetails(pincode)` - Get area details from pincode
- `validatePincode(pincode)` - Validate pincode
- `getStates()` - Get Indian states
- `getCities(state)` - Get cities in state
- `calculateDistance(from, to)` - Calculate distance
- `getServiceablePincodes()` - Serviceable areas

---

### address.service.ts

**Export:** `addressService`

**Purpose:** Address management and validation.

**Key Methods:**

- `validateAddress(address)` - Validate address
- `geocodeAddress(address)` - Get coordinates
- `reverseGeocode(lat, lng)` - Get address from coordinates
- `formatAddress(address)` - Format for display
- `standardizeAddress(address)` - Standardize format

---

## Analytics & Tracking

### analytics.service.ts

**Export:** `analyticsService`

**Purpose:** Analytics event tracking.

**Key Methods:**

- `trackPageView(page)` - Track page view
- `trackEvent(category, action, label, value)` - Track event
- `trackPurchase(order)` - Track purchase
- `trackProduct View(product)` - Track product view
- `setUserId(userId)` - Set user ID
- `setUserProperties(properties)` - Set user properties

---

### error-tracking.service.ts

**Export:** `errorTrackingService`

**Purpose:** Error monitoring and logging.

**Key Methods:**

- `logError(error, context)` - Log error
- `logWarning(message, context)` - Log warning
- `setUser(user)` - Associate user
- `captureException(error)` - Capture exception
- `addBreadcrumb(breadcrumb)` - Add context

---

## Common Patterns

### Service Structure

All services follow a consistent pattern:

```typescript
class ServiceName {
  private baseUrl = "/api/resource";

  async getAll(filters) {
    /* ... */
  }
  async getById(id) {
    /* ... */
  }
  async create(data) {
    /* ... */
  }
  async update(id, data) {
    /* ... */
  }
  async delete(id) {
    /* ... */
  }
}

export const serviceName = new ServiceName();
```

### Error Handling

- All services throw typed errors
- Errors logged to error tracking
- User-friendly error messages
- Retry logic for network errors

### Caching

- Services implement caching where appropriate
- Cache invalidation on mutations
- TTL-based cache expiry

### TypeScript

- Fully typed request/response
- DTOs for data transfer
- Type guards for validation

### API Communication

- Uses `apiService` for HTTP calls
- Automatic token injection
- Request/response interceptors
- Timeout handling
