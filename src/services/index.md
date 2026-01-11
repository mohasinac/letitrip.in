# Services Layer

This folder contains service classes that encapsulate business logic and API communication. Services act as the data layer between components and backend APIs/Firebase.

## Base Service

### base-service.ts

**Export:** `BaseService<TFE, TBE, TCreate, TUpdate>` (abstract class)

**Purpose:** Generic base class for all service implementations providing standardized CRUD operations, type transformations, and error handling. ✅

**Type Parameters:**

- `TFE` - Frontend Entity type (what components use)
- `TBE` - Backend Entity type (what API returns)
- `TCreate` - Create DTO type (defaults to `Partial<TBE>`)
- `TUpdate` - Update DTO type (defaults to `Partial<TBE>`)

**Configuration:**

```typescript
constructor(config: {
  resourceName: string; // For logging and error messages
  baseRoute: string; // Base API route (e.g., '/api/products')
  toFE: (be: TBE) => TFE; // Backend to Frontend transformer
  toBECreate?: (dto: TCreate) => Partial<TBE>; // Create transformer
  toBEUpdate?: (dto: TUpdate) => Partial<TBE>; // Update transformer
})
```

**CRUD Methods:**

- `getById(id, options?)` - Get single entity by ID → `Promise<TFE>`
- `getAll(params?, options?)` - Get paginated list → `Promise<PaginatedResponse<TFE>>`
- `create(data, options?)` - Create new entity → `Promise<TFE>`
- `update(id, data, options?)` - Full update entity → `Promise<TFE>`
- `patch(id, data, options?)` - Partial update entity → `Promise<TFE>`
- `delete(id, options?)` - Delete single entity → `Promise<void>`
- `bulkDelete(ids, options?)` - Delete multiple entities → `Promise<{success, failed, errors}>`
- `exists(id, options?)` - Check if entity exists → `Promise<boolean>`
- `count(params?, options?)` - Count entities → `Promise<number>`

**Helper Methods:**

- `handleError(error, operation)` - Converts errors to AppError types
- `buildUrl(path, params?)` - Builds URLs with query parameters

**Error Handling:**

- Automatically converts errors to AppError hierarchy (NetworkError, ValidationError, NotFoundError)
- Integrates with logServiceError for consistent logging
- Preserves error context and details

**Usage Example:**

```typescript
class ProductService extends BaseService<
  ProductFE,
  ProductBE,
  ProductCreateDTO,
  ProductUpdateDTO
> {
  constructor() {
    super({
      resourceName: "product",
      baseRoute: "/api/products",
      toFE: toFEProduct,
      toBECreate: toBEProductCreate,
      toBEUpdate: toBEProductUpdate,
    });
  }

  // Add custom methods beyond CRUD
  async getBySlug(slug: string): Promise<ProductFE> {
    const response = await apiService.get(`${this.baseRoute}/slug/${slug}`);
    return this.toFE(response.data);
  }
}
```

**Features:**

- ✅ **Type-safe generic interface** for all services
- ✅ **Standardized CRUD operations** reduce code duplication
- ✅ **Automatic error handling** with AppError conversion
- ✅ **Transform functions** for FE/BE data mapping
- ✅ **Extensible** - add custom methods while inheriting base functionality
- ✅ **Comprehensive test coverage** (29 tests passing)

---

## Authentication & User Services

### auth.service.ts

**Export:** `authService`

**Purpose:** User authentication and session management with Zod validation. ✅

**Validation Schemas:** ✅

- `LoginCredentialsSchema` - Email and password validation
- `RegisterDataSchema` - Registration with password strength requirements
- `GoogleAuthDataSchema` - Google OAuth token validation
- `PasswordResetRequestSchema` - Email validation for password reset
- `ChangePasswordSchema` - Password change with strength validation
- `EmailVerificationSchema` - Token validation for email verification

**Key Methods:**

- `login(email, password, rememberMe?)` - Email/password authentication ✅ Validated
- `loginWithGoogle(idToken, userData)` - Google OAuth login ✅ Validated
- `register(data)` - User registration ✅ Validated
- `logout()` - Sign out user
- `getCurrentUser()` - Get current authenticated user
- `getCachedUser()` - Get cached user (instant)
- `refreshToken()` - Refresh auth token
- `verifyEmail(token)` - Verify email address ✅ Validated
- `requestPasswordReset(email)` - Send password reset email ✅ Validated
- `changePassword(oldPassword, newPassword)` - Change password ✅ Validated

**Features:**

- ✅ **Runtime validation with Zod** (January 10, 2026)
- ✅ **Password strength requirements** (uppercase, lowercase, number)
- ✅ **Email format validation**
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

### auth-mfa-service.ts ✅

**Export:** `authMFAService`

**Purpose:** Multi-Factor Authentication (MFA) management using Firebase Authentication's MFA capabilities. ✅

**Features:**

- ✅ **Phone-based MFA** - SMS verification using Firebase Phone Auth
- ✅ **TOTP MFA** - Time-based One-Time Password for authenticator apps (Google Authenticator, Authy)
- ✅ **MFA Enrollment** - Add second factor to user account
- ✅ **MFA Verification** - Verify second factor during sign-in
- ✅ **Factor Management** - List, remove enrolled factors
- ✅ **reCAPTCHA Integration** - Bot protection for phone MFA
- ✅ **Type-safe with Zod** - Input validation for all operations

**Validation Schemas:**

- `EnrollPhoneMFASchema` - Phone enrollment validation
  - Phone number: 10+ digits, international format (+[country][number])
  - Optional display name
- `VerifyPhoneMFASchema` - Phone verification validation
  - Verification ID required
  - Verification code: exactly 6 digits
- `VerifyTotpMFASchema` - TOTP verification validation
  - Verification code: exactly 6 digits
  - Optional display name
- `UnEnrollMFASchema` - Factor removal validation
  - Factor UID required

**Core Methods:**

**Enrollment:**
- `initializeRecaptcha(containerId)` - Initialize invisible reCAPTCHA for phone MFA → `RecaptchaVerifier`
- `enrollPhoneMFA(request)` - Start phone MFA enrollment → `{verificationId, message}`
- `verifyPhoneMFA(request)` - Complete phone MFA enrollment with verification code → `void`
- `enrollTotpMFA(displayName?)` - Start TOTP MFA enrollment → `{totpSecret, qrCodeUrl, secretKey}`
- `verifyTotpMFA(totpSecret, request)` - Complete TOTP MFA enrollment → `void`

**Management:**
- `getEnrolledFactors()` - Get list of enrolled MFA factors → `MFAFactorInfo[]`
- `unenrollMFA(request)` - Remove an MFA factor → `void`
- `isMFAEnabled()` - Check if user has any MFA factors → `boolean`

**Sign-in:**
- `signInWithMFA(request)` - Complete sign-in with second factor → `void`

**Utilities:**
- `clearRecaptcha()` - Clean up reCAPTCHA verifier → `void`

**Types:**

```typescript
interface EnrollPhoneMFARequest {
  phoneNumber: string; // International format: +[country][number]
  displayName?: string; // User-friendly name for this factor
}

interface EnrollPhoneMFAResponse {
  verificationId: string; // Use this to verify the code
  message: string; // User-facing message
}

interface VerifyPhoneMFARequest {
  verificationId: string; // From enrollPhoneMFA
  verificationCode: string; // 6-digit SMS code
}

interface EnrollTotpMFAResponse {
  totpSecret: TotpSecret; // Use this to verify enrollment
  qrCodeUrl: string; // Show QR code to user
  secretKey: string; // Manual entry key
}

interface VerifyTotpMFARequest {
  verificationCode: string; // 6-digit code from authenticator app
  displayName?: string; // User-friendly name
}

interface MFAFactorInfo {
  uid: string; // Unique factor ID
  displayName?: string; // User-friendly name
  factorId: string; // "phone" or "totp"
  enrollmentTime: string; // ISO timestamp
  phoneNumber?: string; // Only for phone factors
}

interface UnEnrollMFARequest {
  factorUid: string; // Factor UID to remove
}

interface SignInWithMFARequest {
  verificationCode: string; // 6-digit code
  resolver: MultiFactorResolver; // From MFA error
  selectedFactorIndex?: number; // Which factor to use (default: 0)
}
```

**Usage Example:**

```typescript
import { authMFAService } from "@/services/auth-mfa-service";

// 1. Initialize reCAPTCHA (for phone MFA)
authMFAService.initializeRecaptcha("recaptcha-container");

// 2. Enroll Phone MFA
try {
  const { verificationId } = await authMFAService.enrollPhoneMFA({
    phoneNumber: "+1234567890",
    displayName: "My Phone",
  });
  
  // User receives SMS code
  
  // 3. Verify Phone MFA
  await authMFAService.verifyPhoneMFA({
    verificationId,
    verificationCode: "123456",
  });
  
  console.log("Phone MFA enrolled successfully!");
} catch (error) {
  console.error("MFA enrollment failed:", error);
}

// Enroll TOTP MFA
try {
  const { qrCodeUrl, secretKey } = await authMFAService.enrollTotpMFA(
    "My Authenticator"
  );
  
  // Show QR code to user or display secret key
  // User scans QR code with authenticator app
  
  // Verify TOTP MFA
  await authMFAService.verifyTotpMFA(totpSecret, {
    verificationCode: "123456", // From authenticator app
  });
  
  console.log("TOTP MFA enrolled successfully!");
} catch (error) {
  console.error("TOTP enrollment failed:", error);
}

// Get enrolled factors
const factors = await authMFAService.getEnrolledFactors();
console.log("Enrolled factors:", factors);

// Remove an MFA factor
await authMFAService.unenrollMFA({ factorUid: "factor-uid-123" });

// Check if MFA is enabled
const hasMFA = await authMFAService.isMFAEnabled();
```

**Error Handling:**

- `ValidationError` - Invalid input (phone format, code length, etc.)
- `AuthError` - Authentication failures (user not signed in, enrollment failed, etc.)
- Custom error codes:
  - `UNAUTHORIZED` - User not signed in
  - `MFA_ENROLLMENT_FAILED` - Enrollment process failed
  - `MFA_VERIFICATION_FAILED` - Verification failed
  - `MFA_UNENROLL_FAILED` - Factor removal failed
  - `MFA_SIGN_IN_FAILED` - Sign-in with MFA failed
  - `MFA_FACTOR_NOT_FOUND` - Factor UID not found
  - `RECAPTCHA_NOT_INITIALIZED` - reCAPTCHA not initialized
  - `INVALID_VERIFICATION_CODE` - Invalid code format
  - `INVALID_MFA_FACTOR` - Invalid factor selected
  - `UNSUPPORTED_MFA_FACTOR` - Unsupported factor type

**Implementation Notes:**

- Uses Firebase Authentication's built-in MFA support
- Supports both SMS (phone) and TOTP (authenticator app) factors
- reCAPTCHA required for phone MFA to prevent abuse
- TOTP more reliable than SMS (no network dependency)
- Users can enroll multiple factors
- QR codes work with Google Authenticator, Authy, Microsoft Authenticator, etc.
- Factor UIDs are persistent across sessions
- Enrollment requires active authenticated session
- Sign-in with MFA handled by MultiFactorResolver from Firebase

---

### users.service.ts

**Export:** `usersService`

**Purpose:** User profile and account management. Extends BaseService for type-safe CRUD operations. ✅

**Architecture:** Extends `BaseService<UserFE, UserBE, UserProfileFormFE, Partial<UserProfileFormFE>>` ✅

**Inherited Methods from BaseService:** ✅

- `getById(id)` - Get user by ID with FE transformation
- `getAll(params, options)` - Get paginated users list
- `create(data, options)` - Create new user
- `update(id, data, options)` - Update user (overridden with custom endpoint structure)
- `patch(id, data, options)` - Partial update user
- `delete(id, options)` - Delete user
- `bulkDelete(ids, options)` - Delete multiple users
- `exists(id, options)` - Check if user exists
- `count(params, options)` - Count users

**Custom User-Specific Methods:**

- `list(filters)` - List users with custom filter logic (admin only, overrides getAll)
- `ban(id, isBanned, banReason?)` - Ban/unban user (admin only)
- `changeRole(id, role, notes?)` - Change user role (admin only)
- `getMe()` - Get current user profile
- `updateMe(formData)` - Update current user profile
- `changePassword(formData)` - Change password
- `sendEmailVerification()` - Send email verification OTP
- `verifyEmail(formData)` - Verify email with OTP
- `sendMobileVerification()` - Send mobile verification OTP
- `verifyMobile(formData)` - Verify mobile with OTP
- `uploadAvatar(file)` - Upload user avatar
- `deleteAvatar()` - Delete user avatar
- `deleteAccount(password)` - Delete user account
- `getStats()` - Get user statistics (admin only)
- `bulkMakeSeller(ids)` - Bulk make users sellers
- `bulkMakeUser(ids)` - Bulk make sellers regular users
- `bulkBan(ids, banReason?)` - Bulk ban users
- `bulkUnban(ids)` - Bulk unban users
- `bulkVerifyEmail(ids)` - Bulk verify emails
- `bulkVerifyPhone(ids)` - Bulk verify phones

**Features:**

- ✅ **Extends BaseService** for type-safe CRUD operations (January 11, 2026)
- ✅ **Consistent error handling** via BaseService.handleError
- ✅ **FE/BE type transformation** (UserFE ↔ UserBE)
- User profile management
- Avatar upload/delete
- Email and mobile verification with OTP
- Password management
- Role management (admin features)
- User ban/unban (admin features)
- User statistics (admin features)
- Bulk operations (admin features)
- Account deletion
- Pagination support
- Advanced filtering

---

### device-service.ts ✅

**Export:** `deviceService` (singleton), `DeviceInfo`, `AddDeviceRequest`, `UpdateDeviceRequest`, `RevokeDeviceRequest`

**Purpose:** Device management service for tracking and managing user devices for security and session management.

**Features:**

- Device tracking with user agent parsing
- Automatic device type detection (desktop, mobile, tablet)
- Browser and OS detection from user agent
- IP address and location tracking
- Trusted device management
- Device revocation for security
- Last active timestamp tracking
- Batch device operations

**Device Information:**

```typescript
interface DeviceInfo {
  deviceId: string;
  userId: string;
  deviceName: string;
  deviceType: "desktop" | "mobile" | "tablet" | "unknown";
  browser?: string;
  browserVersion?: string;
  os?: string;
  osVersion?: string;
  ipAddress?: string;
  location?: string;
  isTrusted: boolean;
  lastActiveAt: Date;
  createdAt: Date;
  userAgent?: string;
}
```

**Methods:**

- `addDevice(request)` - Add a new device or update existing device
- `getDevice(deviceId, userId)` - Get a specific device
- `listDevices(userId)` - List all devices for a user (ordered by last active)
- `updateDevice(request)` - Update device information (name, trusted status)
- `revokeDevice(request)` - Revoke a device (delete it)
- `updateLastActive(deviceId, userId)` - Update last active timestamp
- `getTrustedDevices(userId)` - Get only trusted devices
- `revokeAllExcept(userId, currentDeviceId)` - Revoke all devices except current

**User Agent Parsing:**

- Automatically detects device type (desktop/mobile/tablet)
- Extracts browser name and version (Chrome, Firefox, Safari, Edge, IE)
- Extracts OS name and version (Windows, macOS, Linux, Android, iOS)
- Generates user-friendly device names (e.g., "Windows - Chrome - Desktop")

**Storage:**

- Firestore collection: `devices`
- Document ID: Generated device ID (consistent hash)
- Indexed by: userId, isTrusted, lastActiveAt

**Error Handling:**

- `DeviceError` - Device-specific errors with error codes
- `DeviceValidationError` - Validation errors from Zod

---

## E-commerce Core Services

### products.service.ts

**Export:** `productsService`

**Purpose:** Product catalog management with Zod validation. Extends BaseService for type-safe CRUD operations. ✅

**Architecture:** Extends `BaseService<ProductFE, ProductBE, ProductFormFE, Partial<ProductFormFE>>` ✅

**Inherited Methods from BaseService:** ✅

- `getById(id)` - Get product by ID with FE transformation
- `getAll(params, options)` - Get paginated products list
- `create(data, options)` - Create new product with validation
- `update(id, data, options)` - Full update product
- `patch(id, data, options)` - Partial update product
- `delete(id, options)` - Delete product
- `bulkDelete(ids, options)` - Delete multiple products
- `exists(id, options)` - Check if product exists
- `count(params, options)` - Count products

**Validation Schemas:** ✅

- `ProductFormSchema` - Complete product create/update validation
  - Name: 3-200 characters
  - Description: 10-5000 characters
  - Price: Positive number, max ₹1,00,00,000
  - Stock count: Non-negative integer
  - Images: 1-10 valid URLs required
  - Category, Shop, Seller IDs required
  - Optional: compareAtPrice, costPerItem, weight, sku, barcode, tags
  - Status: draft/published/archived
  - SEO metadata validation (title max 60, description max 160)
- `StockUpdateSchema` - Stock count validation (non-negative integer)
- `StatusUpdateSchema` - Status validation (draft/published/archived)
- `QuickCreateSchema` - Minimal product creation (name, price, stock, category)
- `BulkActionSchema` - Bulk operation validation (action type + product IDs)

**Custom Product-Specific Methods:**

- `list(filters)` - List products with custom filter logic (overrides getAll)
- `getBySlug(slug)` - Get product by slug (unique to products) ✅ Validated
- `updateBySlug(slug, data)` - Update product by slug ✅ Validated
- `deleteBySlug(slug)` - Delete product by slug ✅ Validated
- `getReviews(slug, page, limit)` - Get product reviews with pagination
- `getVariants(slug)` - Get product variants
- `getSimilar(slug, limit)` - Get similar products
- `getSellerProducts(slug, limit)` - Get seller's other products
- `updateStock(slug, stockCount)` - Update stock count ✅ Validated
- `updateStatus(slug, status)` - Update product status ✅ Validated
- `incrementView(slug)` - Increment view count
- `getFeatured()` - Get featured products
- `getHomepage()` - Get homepage products
- `bulkAction(action, ids, data)` - Generic bulk operations ✅ Validated
- `bulkPublish(ids)` - Bulk publish products
- `bulkUnpublish(ids)` - Bulk unpublish products
- `bulkArchive(ids)` - Bulk archive products
- `bulkFeature(ids)` - Bulk feature products
- `bulkUnfeature(ids)` - Bulk unfeature products
- `bulkUpdateStock(ids, stockCount)` - Bulk update stock
- `bulkUpdate(ids, updates)` - Bulk update products ✅ Validated
- `quickCreate(data)` - Quick product creation ✅ Validated
- `quickUpdate(slug, data)` - Quick product update ✅ Validated
- `getByIds(ids)` - Batch fetch products by IDs

**Features:**

- ✅ **Extends BaseService** for type-safe CRUD operations (January 11, 2026)
- ✅ **Runtime validation with Zod** (January 10, 2026)
- ✅ **Consistent error handling** via BaseService.handleError
- ✅ **FE/BE type transformation** (ProductFE ↔ ProductBE)
- ✅ **Price and stock validation**
- ✅ **Image URL validation (1-10 images)**
- ✅ **SEO metadata validation**
- ✅ **Bulk operation validation**
- Product search and filtering
- Variants management
- Review aggregation
- Similar products recommendations
- Featured products curation
- Pagination support
- Advanced filtering
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

**Purpose:** Shopping cart management with Zod validation. ✅

**Validation Schemas:** ✅

- `AddToCartSchema` - Add item validation
  - Product ID required (non-empty string)
  - Quantity: 1 to MAX_QUANTITY_PER_CART_ITEM (integer)
  - Shop ID required
  - Optional variant ID
- `UpdateCartItemSchema` - Update quantity validation
  - Item ID required (non-empty string)
  - Quantity: 0 to MAX_QUANTITY_PER_CART_ITEM (integer)
- `ApplyCouponSchema` - Coupon code validation
  - Code: 3-50 characters
  - Format: Uppercase letters, numbers, hyphens only
- `GuestCartItemSchema` - Guest cart validation
  - Product ID, name, shop ID, shop name required
  - Price must be positive
  - Image must be valid URL
  - Quantity: 1 to MAX_QUANTITY_PER_CART_ITEM (integer)

**Key Methods:**

- `getCart(userId?)` - Get cart (guest or user)
- `addToCart(item)` - Add item ✅ Validated
- `updateCartItem(itemId, quantity)` - Update quantity ✅ Validated
- `removeFromCart(itemId)` - Remove item
- `clearCart()` - Empty cart
- `mergeGuestCart(guestCart, userId)` - Merge guest cart to user
- `validateCart()` - Validate stock and prices
- `getCartTotal()` - Calculate total
- `applyCoupon(code)` - Apply discount code ✅ Validated
- `addToGuestCartWithDetails(product)` - Add to guest cart ✅ Validated
- `updateGuestCartItem(itemId, quantity)` - Update guest cart ✅ Validated

**Features:**

- ✅ **Runtime validation with Zod** (January 10, 2026)
- ✅ **Quantity validation** (1 to MAX_QUANTITY_PER_CART_ITEM)
- ✅ **Coupon code format validation**
- ✅ **Guest cart validation** (product details, price, image URL)
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

**Purpose:** Order management and tracking with Zod validation. ✅

**Validation Schemas:** ✅

- `CreateOrderSchema` - Order creation validation
  - Items: Array of products with productId, quantity (1-100), optional variantId
  - At least one item required
  - Shipping address ID required (non-empty string)
  - Payment method: cod/card/upi/netbanking/wallet
  - Shipping method: standard/express/overnight
  - Optional coupon code: 3-50 chars, uppercase/numbers/hyphens only
  - Optional customer notes: max 500 characters
- `UpdateOrderStatusSchema` - Status update validation
  - Status: pending/confirmed/processing/shipped/out_for_delivery/delivered/cancelled/returned/refunded
  - Optional internal notes: max 1000 characters
- `CreateShipmentSchema` - Shipment creation validation
  - Tracking number: 5-50 characters
  - Shipping provider: 2-100 characters
  - Optional estimated delivery date
- `CancelOrderSchema` - Cancellation validation
  - Reason: 10-500 characters required
- `BulkOrderActionSchema` - Bulk operation validation
  - Action: confirm/process/ship/deliver/cancel/refund/delete/update
  - Order IDs: Non-empty array required
- `BulkRefundSchema` - Bulk refund validation
  - Optional refund amount: positive number
  - Optional reason: 10-500 characters

**Key Methods:**

- `getOrders(userId, filters)` - Get user orders
- `getOrderById(orderId)` - Get order details
- `create(formData)` - Create order ✅ Validated
- `updateOrderStatus(orderId, status, notes)` - Update status ✅ Validated
- `createShipment(id, tracking, provider, delivery)` - Create shipment ✅ Validated
- `cancelOrder(orderId, reason)` - Cancel order ✅ Validated
- `trackOrder(orderId)` - Get tracking info
- `getOrderHistory(userId)` - Order history
- `downloadInvoice(orderId)` - Get invoice PDF
- `bulkAction(action, ids, data)` - Bulk operations ✅ Validated
- `bulkCancel(ids, reason)` - Bulk cancel ✅ Validated
- `bulkRefund(ids, amount, reason)` - Bulk refund ✅ Validated

**Features:**

- ✅ **Runtime validation with Zod** (January 10, 2026)
- ✅ **Order creation validation** (items, addresses, payment method)
- ✅ **Status transition validation** (9 valid statuses)
- ✅ **Shipment validation** (tracking number, provider)
- ✅ **Cancellation validation** (reason required, 10-500 chars)
- ✅ **Bulk operation validation** (action types, order IDs)
- ✅ **Refund validation** (amount and reason)
- Order tracking
- Invoice generation
- Return processing

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

**Purpose:** Shop/store management. Extends BaseService for type-safe CRUD operations. ✅

**Architecture:** Extends `BaseService<ShopFE, ShopBE, ShopFormFE, Partial<ShopFormFE>>` ✅

**Inherited Methods from BaseService:** ✅

- `getById(id)` - Get shop by ID with FE transformation
- `getAll(params, options)` - Get paginated shops list
- `create(data, options)` - Create new shop
- `update(id, data, options)` - Update shop by ID
- `patch(id, data, options)` - Partial update shop
- `delete(id, options)` - Delete shop by ID
- `bulkDelete(ids, options)` - Delete multiple shops
- `exists(id, options)` - Check if shop exists
- `count(params, options)` - Count shops

**Custom Shop-Specific Methods:**

- `list(filters)` - List shops with custom filters, returns ShopCardFE (overrides getAll)
- `getBySlug(slug)` - Get shop by URL-friendly slug
- `updateBySlug(slug, formData)` - Update shop by slug
- `deleteBySlug(slug)` - Delete shop by slug
- `verify(slug, data)` - Verify shop (admin only)
- `ban(slug, data)` - Ban/unban shop (admin only)
- `setFeatureFlags(slug, data)` - Set feature flags (admin only)
- `getPayments(slug)` - Get shop payments (owner/admin)
- `processPayment(slug, data)` - Process payment (admin only)
- `getStats(slug)` - Get shop statistics
- `getShopProducts(slug, options)` - Get products for shop (paginated)
- `getShopReviews(slug, page?, limit?)` - Get shop reviews (paginated)
- `follow(slug)` - Follow shop
- `unfollow(slug)` - Unfollow shop
- `checkFollowing(slug)` - Check if following shop
- `getFollowing()` - Get following shops list
- `getFeatured()` - Get featured shops
- `getHomepage()` - Get homepage shops
- `bulkVerify(ids)` - Bulk verify shops
- `bulkUnverify(ids)` - Bulk unverify shops
- `bulkFeature(ids)` - Bulk feature shops
- `bulkUnfeature(ids)` - Bulk unfeature shops
- `bulkActivate(ids)` - Bulk activate shops
- `bulkDeactivate(ids)` - Bulk deactivate shops
- `bulkBan(ids, banReason?)` - Bulk ban shops
- `bulkUnban(ids)` - Bulk unban shops
- `bulkUpdate(ids, updates)` - Bulk update shops
- `getByIds(ids)` - Batch fetch shops by IDs

**Features:**

- ✅ **Extends BaseService** for type-safe CRUD operations (January 11, 2026)
- ✅ **Consistent error handling** via BaseService.handleError
- ✅ **Slug-based operations** for user-friendly URLs alongside ID-based operations
- ✅ **Admin verification** and moderation capabilities
- ✅ **Payment processing** and tracking
- ✅ **Social features** (follow/unfollow)
- ✅ **Bulk operations** for admin efficiency
- ✅ **Reduced duplication** from 313 lines via BaseService inheritance

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

**Purpose:** Product and shop reviews management. Extends BaseService for type-safe CRUD operations. ✅

**Architecture:** Extends `BaseService<ReviewFE, ReviewBE, ReviewFormFE, Partial<ReviewFormFE>>` ✅

**Inherited Methods from BaseService:** ✅

- `getById(id)` - Get review by ID with FE transformation
- `create(data, options)` - Create new review
- `update(id, data, options)` - Update review
- `delete(id, options)` - Delete review

**Custom Review-Specific Methods:**

- `list(filters)` - List reviews with filters and pagination (overrides getAll)
- `moderate(id, data)` - Moderate review (approve/reject for shop owners/admin)
- `markHelpful(id)` - Mark review as helpful
- `uploadMedia(files)` - Upload review media (images/videos)
- `getSummary(filters)` - Get review summary statistics (average rating, distribution, verified purchase %)
- `canReview(productId?, auctionId?)` - Check if user can review
- `getFeatured()` - Get featured reviews
- `getHomepage()` - Get homepage reviews (featured, approved, verified)
- `bulkApprove(ids)` - Bulk approve reviews (admin)
- `bulkReject(ids)` - Bulk reject reviews (admin)

**Features:**

- ✅ **Extends BaseService** for type-safe CRUD operations (January 11, 2026)
- ✅ **Consistent error handling** via BaseService.handleError
- ✅ **Review moderation** for shop owners and admins
- ✅ **Media uploads** for photo/video reviews
- ✅ **Helpful voting** system
- ✅ **Review eligibility** checking
- ✅ **Statistics and summaries** for product ratings
- ✅ **Bulk moderation** for admin efficiency
- ✅ **Reduced duplication** from 203 lines via BaseService inheritance

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
