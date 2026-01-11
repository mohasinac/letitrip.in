# Services Layer - Future Refactoring Notes

## Completed Improvements ✅

### Search Service Enhancements (search.service.ts)

- ✅ **Advanced Search Service**: Complete implementation with fuzzy matching and advanced features (Task 12.1 - January 11, 2026)
- ✅ **Fuzzy Matching**: Levenshtein distance algorithm for typo tolerance
- ✅ **Advanced Filtering**:
  - Price range (minPrice, maxPrice)
  - Minimum rating (1-5 stars)
  - Availability (inStock filter)
  - Category and shop filtering
  - Multiple sort options (relevance, price asc/desc, rating, newest, popular)
  - Pagination support
- ✅ **Autocomplete Support**:
  - getAutocompleteSuggestions: Real-time suggestions with 2+ character queries
  - Returns suggestion types (product, shop, category, keyword)
  - Includes result counts for each suggestion
- ✅ **Search History**:
  - Local storage persistence (max 50 entries)
  - getSearchHistory: Retrieve history (most recent first)
  - clearSearchHistory: Clear all history
  - removeFromHistory: Remove specific entry
- ✅ **Trending Searches**:
  - getTrendingSearches: Popular queries with trend direction
  - getPopularSearches: Category-specific popular queries
- ✅ **Search Analytics**:
  - Automatic search tracking
  - trackClick: Track user clicks on search results
  - Query and result analytics
- ✅ **Search Methods**:
  - advancedSearch: Full-featured search with all filters
  - search: Basic search (backwards compatible)
  - quickSearch: Fast 5-result search for autocomplete
  - fuzzySearch: Dedicated fuzzy matching search
- ✅ **Type Definitions**:
  - AdvancedSearchFilters: Extended filter interface
  - SearchSuggestion: Autocomplete structure
  - SearchHistoryItem: History entry format
  - TrendingSearch: Trending query format
  - SearchAnalytics: Analytics data structure
- ✅ **Query Validation**: 2-500 character limit to prevent DoS
- ✅ **Error Handling**: Graceful fallback to empty results
- ✅ **Performance**: Safe limit capping at 100 results

### Payment Service Enhancements (payment.service.ts)

- ✅ **PhonePe Integration**: Complete PhonePe payment gateway support (Task 11.5 - January 11, 2026)
- ✅ **UPI Payment Support**: Dedicated UPI payment service (Task 11.6 - January 11, 2026)
- ✅ **PhonePe Features**:
  - createOrder: Create PhonePe payment order with UPI
  - verifyPayment: Verify payment transaction status
  - checkStatus: Poll payment status by transaction ID
  - refundPayment: Initiate refund for PhonePe payment
  - getRefundStatus: Check refund status
  - Support for both redirect and POST callback modes
  - Intent URL and redirect URL generation
- ✅ **UPI Features**:
  - createPayment: Create direct UPI payment request
  - generateQrCode: Generate UPI QR code for payment
  - verifyPayment: Verify UPI payment completion
  - checkStatus: Poll UPI payment status
  - validateVpa: Validate UPI VPA (Virtual Payment Address)
  - getPaymentDetails: Get detailed payment information
  - Support for direct VPA collection, QR code, and intent-based payments
- ✅ **Type Definitions**:
  - CreatePhonePeOrderParams/Response
  - VerifyPhonePePaymentParams/Response
  - PhonePeRefundParams/Response
  - CreateUpiPaymentParams/Response
  - VerifyUpiPaymentParams/Response
- ✅ **Error Handling**: Consistent error logging for all payment operations
- ✅ **Generic Methods Updated**:
  - createOrder now supports phonepe and upi gateways
  - verifyPayment supports phonepe and upi verification
  - refundPayment supports phonepe refunds
- ✅ **India-focused**: Both services optimized for Indian market
- ✅ **Multiple UPI Methods**: QR code, VPA collection, and intent-based flows

### Auth MFA Service (auth-mfa-service.ts)

- ✅ **MFA Service Created**: Complete multi-factor authentication service (January 11, 2026)
- ✅ **Firebase MFA Integration**: Uses Firebase Authentication's built-in MFA capabilities
- ✅ **Phone MFA Support**: SMS-based verification with Firebase Phone Auth
- ✅ **TOTP MFA Support**: Time-based One-Time Password for authenticator apps
- ✅ **Zod Validation**: Input validation for all MFA operations
- ✅ **Typed Errors**: AuthError and ValidationError for structured error handling
- ✅ **reCAPTCHA Integration**: Bot protection for phone MFA enrollment
- ✅ **Enrollment Methods**:
  - enrollPhoneMFA: Start phone MFA enrollment, returns verification ID
  - verifyPhoneMFA: Complete phone enrollment with SMS code
  - enrollTotpMFA: Generate TOTP secret and QR code
  - verifyTotpMFA: Complete TOTP enrollment with authenticator code
- ✅ **Management Methods**:
  - getEnrolledFactors: List all enrolled MFA factors
  - unenrollMFA: Remove an MFA factor
  - isMFAEnabled: Check if user has any MFA factors
- ✅ **Sign-in Methods**:
  - signInWithMFA: Complete sign-in with second factor verification
  - Supports both phone and TOTP factors during sign-in
- ✅ **Utility Methods**:
  - initializeRecaptcha: Initialize invisible reCAPTCHA for phone MFA
  - clearRecaptcha: Clean up reCAPTCHA resources
- ✅ **Error Codes**: UNAUTHORIZED, MFA_ENROLLMENT_FAILED, MFA_VERIFICATION_FAILED, MFA_UNENROLL_FAILED, MFA_SIGN_IN_FAILED, MFA_FACTOR_NOT_FOUND, RECAPTCHA_NOT_INITIALIZED, INVALID_VERIFICATION_CODE, INVALID_MFA_FACTOR, UNSUPPORTED_MFA_FACTOR
- ✅ **Test Coverage**: 16 comprehensive tests covering all methods (100% coverage)
- ✅ **QR Code Generation**: Automatic QR code URL generation for authenticator apps
- ✅ **Multiple Factors**: Users can enroll multiple MFA factors
- ✅ **Factor Types**: Supports both "phone" and "totp" factor IDs
- ✅ **Display Names**: Optional user-friendly names for enrolled factors
- ✅ **Enrollment Time**: Tracks when each factor was enrolled

### Auth Service Validation (auth.service.ts)

- ✅ **Zod Schemas Implemented**: All authentication methods validated (January 10, 2026)
- ✅ **Typed Errors Implemented**: ValidationError and AuthError for structured error handling (January 10, 2026)
- ✅ **Login Validation**: Email format and password length requirements
- ✅ **Register Validation**: Password strength (uppercase, lowercase, number), name length
- ✅ **Google Auth Validation**: ID token and optional user data validation
- ✅ **Password Reset Validation**: Email format validation
- ✅ **Change Password Validation**: Current and new password validation with strength requirements
- ✅ **Email Verification Validation**: Token validation
- ✅ **Error Handling**: Zod errors converted to ValidationError with error details
- ✅ **Session Errors**: 401 responses throw AuthError with SESSION_EXPIRED code

### Product Service Validation (products.service.ts)

- ✅ **Extends BaseService**: Migrated to BaseService<ProductFE, ProductBE, ProductFormFE, Partial<ProductFormFE>> (January 11, 2026)
- ✅ **Generic CRUD Operations**: Inherits getById, getAll, create, update, patch, delete, bulkDelete, exists, count from BaseService
- ✅ **Custom Methods Preserved**: getBySlug, updateBySlug, deleteBySlug, list (with filters), getReviews, getVariants, getSimilar, getSellerProducts, updateStock, updateStatus, incrementView, getFeatured, getHomepage, bulk operations, quickCreate/Update, getByIds
- ✅ **Zod Schemas Implemented**: All CRUD and bulk operations validated (January 10, 2026)
- ✅ **Typed Errors Implemented**: ValidationError and NotFoundError for structured error handling (January 10, 2026)
- ✅ **Create Validation**: Name, description, price, stock, images, category required
- ✅ **Update Validation**: Partial updates with validation
- ✅ **Stock Update Validation**: Non-negative integer validation
- ✅ **Status Update Validation**: Enum validation (draft/published/archived)
- ✅ **Bulk Operations Validation**: Action type and product IDs validation
- ✅ **Quick Create/Update Validation**: Inline editing with validation
- ✅ **Price Validation**: Positive numbers, max ₹1,00,00,000
- ✅ **Image Validation**: 1-10 valid URLs required
- ✅ **SEO Metadata Validation**: Title max 60 chars, description max 160 chars
- ✅ **Error Handling**: Zod errors converted to ValidationError with error details, BaseService error handling integration
- ✅ **Not Found Handling**: 404 responses throw NotFoundError (getById, getBySlug, update, delete)
- ✅ **Benefits**: Reduced code duplication, consistent error handling, type-safe CRUD operations, easier testing

### Cart Service Validation (cart.service.ts)

- ✅ **Zod Schemas Implemented**: All cart operations validated (January 10, 2026)
- ✅ **Typed Errors Implemented**: ValidationError, NotFoundError, and BusinessError for structured error handling (January 10, 2026)
- ✅ **Add to Cart Validation**: Product ID, shop ID, quantity (1 to MAX_QUANTITY_PER_CART_ITEM)
- ✅ **Update Quantity Validation**: Item ID and quantity (0 to MAX_QUANTITY_PER_CART_ITEM)
- ✅ **Coupon Code Validation**: 3-50 chars, uppercase letters/numbers/hyphens only
- ✅ **Guest Cart Validation**: Full product details validation (ID, name, price, image URL)
- ✅ **Quantity Limits**: Enforced MAX_QUANTITY_PER_CART_ITEM limit
- ✅ **Price Validation**: Must be positive numbers
- ✅ **Image URL Validation**: Must be valid URLs
- ✅ **Error Handling**: Zod errors converted to ValidationError with error details
- ✅ **Not Found Handling**: Cart item not found throws NotFoundError (updateItem)

### Order Service Validation (orders.service.ts)

- ✅ **Zod Schemas Implemented**: All order operations validated (January 10, 2026)
- ✅ **Typed Errors Implemented**: ValidationError and NotFoundError for structured error handling (January 10, 2026)
- ✅ **Create Order Validation**: Items array (min 1), shipping address, payment/shipping methods
- ✅ **Order Items Validation**: Product ID, quantity (1-100), optional variant ID
- ✅ **Payment Method Validation**: cod/card/upi/netbanking/wallet enum
- ✅ **Shipping Method Validation**: standard/express/overnight enum
- ✅ **Coupon Code Validation**: 3-50 chars, uppercase/numbers/hyphens format
- ✅ **Status Update Validation**: 9 valid order statuses enum
- ✅ **Shipment Validation**: Tracking number (5-50 chars), provider (2-100 chars)
- ✅ **Cancel Validation**: Reason required (10-500 characters)
- ✅ **Bulk Operations Validation**: Action type and order IDs validation
- ✅ **Error Handling**: Zod errors converted to ValidationError with error details
- ✅ **Not Found Handling**: Order not found throws NotFoundError (updateStatus, createShipment, cancel)
- ✅ **Refund Validation**: Optional amount (positive), optional reason (10-500 chars)
- ✅ **Customer Notes Validation**: Max 500 characters
- ✅ **Internal Notes Validation**: Max 1000 characters

### Users Service (users.service.ts)

- ✅ **Extends BaseService**: Migrated to BaseService<UserFE, UserBE, UserProfileFormFE, Partial<UserProfileFormFE>> (January 11, 2026)
- ✅ **Generic CRUD Operations**: Inherits getById, getAll, create, update, patch, delete, bulkDelete, exists, count from BaseService
- ✅ **Custom Methods Preserved**: list (with filters), ban, changeRole, getMe, updateMe, changePassword, sendEmailVerification, verifyEmail, sendMobileVerification, verifyMobile, uploadAvatar, deleteAvatar, deleteAccount, getStats, bulkMakeSeller, bulkMakeUser, bulkBan, bulkUnban, bulkVerifyEmail, bulkVerifyPhone, bulkDelete
- ✅ **Error Handling**: BaseService error handling integration for consistent error responses
- ✅ **Benefits**: Reduced code duplication, consistent error handling, type-safe CRUD operations, easier testing

### Reviews Service (reviews.service.ts)

- ✅ **Extends BaseService**: Migrated to BaseService<ReviewFE, ReviewBE, ReviewFormFE, Partial<ReviewFormFE>> (January 11, 2026)
- ✅ **Generic CRUD Operations**: Inherits getById, create, update, delete from BaseService
- ✅ **Custom Methods Preserved**: list (with filters and pagination), moderate, markHelpful, uploadMedia, getSummary, canReview, getFeatured, getHomepage, bulkApprove, bulkReject
- ✅ **Error Handling**: BaseService error handling integration for all methods
- ✅ **Benefits**: Reduced code duplication (203 lines), consistent error handling, type-safe CRUD operations

### Shops Service (shops.service.ts)

- ✅ **Extends BaseService**: Migrated to BaseService<ShopFE, ShopBE, ShopFormFE, Partial<ShopFormFE>> (January 11, 2026)
- ✅ **Generic CRUD Operations**: Inherits getById, create, update, delete from BaseService
- ✅ **Custom Methods Preserved**: list (returns ShopCardFE), getBySlug, updateBySlug, deleteBySlug, verify, ban, setFeatureFlags, getPayments, processPayment, getStats, getShopProducts, getShopReviews, follow, unfollow, checkFollowing, getFollowing, getFeatured, getHomepage, bulk operations (bulkVerify, bulkUnverify, bulkFeature, bulkUnfeature, bulkActivate, bulkDeactivate, bulkBan, bulkUnban, bulkDelete, bulkUpdate), getByIds
- ✅ **Error Handling**: BaseService error handling integration for all methods
- ✅ **Benefits**: Reduced code duplication (313 lines), consistent error handling, type-safe CRUD operations, slug-based operations alongside ID-based

## General Architecture Improvements

### 1. Service Layer Abstraction

- **Base Service Class**: Create abstract base class for common CRUD operations
  ```typescript
  abstract class BaseService<T> {
    abstract baseUrl: string;
    async getAll(filters?) {
      /* common implementation */
    }
    async getById(id) {
      /* common implementation */
    }
    // ...
  }
  ```
- **Generic CRUD**: DRY principle for standard operations
- **Method Composition**: Compose complex operations from simpler ones
- **Dependency Injection**: Better testability and flexibility

### 2. API Client Modernization

- **Replace apiService**: Consider using modern libraries:
  - **tRPC**: End-to-end type safety
  - **React Query**: Server state management
  - **SWR**: Alternative for data fetching
- **GraphQL**: Consider GraphQL for flexible queries
- **gRPC**: For performance-critical operations

### 3. Error Handling Enhancement

- **Typed Errors**: Create error hierarchy
  ```typescript
  class ValidationError extends AppError {}
  class NetworkError extends AppError {}
  class AuthError extends AppError {}
  ```
- **Error Recovery**: Automatic retry with exponential backoff
- **Error Context**: Rich error context for debugging
- **User-Friendly Messages**: Map technical errors to user messages
- **Error Boundaries**: Integration with React Error Boundaries

### 4. Caching Strategy

- **Cache Layers**: Multi-level caching (memory, localStorage, IndexedDB)
- **Cache Invalidation**: Smart cache invalidation strategies
  - Time-based (TTL)
  - Event-based (on mutations)
  - Manual invalidation
- **Stale-While-Revalidate**: Background data refresh
- **Optimistic Updates**: Update UI before server response
- **Cache Versioning**: Handle cache schema changes

## Specific Service Improvements

### Auth Services

- **OAuth Providers**: Add more providers (Facebook, Apple, GitHub)
- **MFA**: Multi-factor authentication
- **Biometric Auth**: Fingerprint, Face ID support
- **Passwordless**: Magic links, WebAuthn
- **Session Management**: Better multi-device handling
- **Token Rotation**: Automatic refresh token rotation
- **Rate Limiting**: Prevent brute force attacks

### Product Services

- **Search**: Better search with Elasticsearch/Algolia
- **Recommendations**: AI-powered product recommendations
- **Inventory**: Real-time inventory management
- **Bulk Operations**: Bulk product updates
- **Import/Export**: CSV/Excel import/export
- **Variants**: Better variant management
- **Digital Products**: Support digital downloads

### Cart & Checkout

- **Guest Checkout**: Streamlined guest checkout
- **Save for Later**: Move items between cart and wishlist
- **Abandoned Cart**: Recovery emails
- **Cart Rules**: Complex discount rules
- **Multi-Currency**: Currency conversion
- **Tax Calculation**: Advanced tax rules by region
- **Gift Options**: Gift wrapping, messages

### Payment Services

- **Payment Methods**: Support more gateways
  - Razorpay UPI
  - Paytm
  - PhonePe
  - Google Pay integration
- **Recurring Payments**: Subscription support
- **Split Payments**: Pay with multiple methods
- **COD**: Cash on delivery flow
- **EMI**: Installment payments
- **Wallet**: Integrated wallet system
- **Refunds**: Partial refunds, split refunds

### Order Management

- **Order Tracking**: Real-time tracking with maps
- **Order Modifications**: Allow order changes before shipping
- **Invoicing**: Automated invoice generation
- **Packing Slips**: Generate packing slips
- **Batch Processing**: Process multiple orders
- **Order Analytics**: Advanced order analytics
- **Export Orders**: Export to accounting software

### Shipping Services

- **Multi-Carrier**: Support multiple shipping carriers
- **Rate Shopping**: Compare rates across carriers
- **Smart Routing**: Optimal carrier selection
- **International**: International shipping support
- **Label Generation**: Automatic label printing
- **Pickup Scheduling**: Automated pickup scheduling
- **Return Labels**: Return shipping labels

### Shop & Seller

- **Multi-Store**: Support multiple shops per seller
- **Shop Analytics**: Detailed analytics dashboard
- **Shop Templates**: Pre-designed shop themes
- **SEO Tools**: Built-in SEO optimization
- **Marketing Tools**: Promotional tools
- **Inventory Sync**: Sync with external systems
- **Bulk Upload**: Bulk product upload

### Notification Services

- **Push Notifications**: Web push, mobile push
- **SMS Notifications**: SMS integration
- **WhatsApp**: WhatsApp notifications
- **Email Notifications**: Rich email templates
- **Notification Preferences**: User preferences
- **Notification Grouping**: Group similar notifications
- **Real-time**: WebSocket for real-time notifications

### Media Services

- **CDN Integration**: Cloudflare, AWS CloudFront
- **Image Optimization**: Automatic optimization
- **Multiple Formats**: WebP, AVIF support
- **Lazy Loading**: On-demand image loading
- **Video Support**: Video upload and streaming
- **360° Images**: Product 360° views
- **AR/VR**: Augmented reality previews

## Performance Optimizations

### API Performance

- **Request Batching**: Batch multiple requests
- **Query Optimization**: Optimize database queries
- **Pagination**: Cursor-based pagination
- **Field Selection**: GraphQL-style field selection
- **Compression**: Response compression
- **HTTP/2**: Use HTTP/2 push
- **CDN**: Cache API responses at edge

### Client Performance

- **Service Workers**: Offline support
- **Background Sync**: Sync when online
- **Prefetching**: Prefetch likely data
- **Code Splitting**: Split service bundles
- **Tree Shaking**: Remove unused code
- **Bundle Analysis**: Regular bundle audits

### Database Optimization

- **Indexing**: Proper database indexes
- **Query Caching**: Cache common queries
- **Read Replicas**: Scale reads
- **Connection Pooling**: Reuse connections
- **Batch Operations**: Batch database writes

## Testing Improvements

### Unit Testing

- **Mock Services**: Create mock implementations
- **Test Utilities**: Helper functions for testing
- **Coverage**: Aim for 80%+ coverage
- **Snapshot Testing**: Test request/response shapes

### Integration Testing

- **API Testing**: Test actual API calls
- **E2E Tests**: Full user flows
- **Contract Testing**: API contract validation
- **Load Testing**: Performance under load

### Test Data

- **Fixtures**: Reusable test data
- **Factories**: Generate test data
- **Seed Data**: Database seeding for tests
- **Cleanup**: Proper test cleanup

## Security Enhancements

### Authentication

- **CSRF Protection**: Anti-CSRF tokens
- **XSS Prevention**: Input sanitization
- **SQL Injection**: Parameterized queries
- **Rate Limiting**: API rate limits
- **IP Whitelisting**: Admin IP restrictions

### Data Protection

- **Encryption**: Encrypt sensitive data
- **PII Handling**: Proper PII management
- **Data Masking**: Mask sensitive data in logs
- **Audit Logs**: Log all data access
- **GDPR Compliance**: Right to delete, export

### Payment Security

- **PCI Compliance**: PCI-DSS standards
- **Tokenization**: Card tokenization
- **3D Secure**: 3D Secure authentication
- **Fraud Detection**: Fraud prevention
- **Secure Webhooks**: Verify webhook signatures

## Developer Experience

### Documentation

- **JSDoc**: Complete JSDoc comments
- **API Docs**: Auto-generated API docs
- **Examples**: Usage examples for each service
- **Migration Guides**: Version migration docs
- **Architecture Docs**: Service architecture

### Type Safety

- **Strict Types**: Strictest TypeScript config
- **Runtime Validation**: Zod/Yup for runtime checks
- **Type Generation**: Generate types from OpenAPI
- **Type Tests**: Test type inference

### Debugging

- **Request Logging**: Detailed request logs
- **Performance Monitoring**: APM integration
- **Error Tracking**: Sentry, LogRocket
- **DevTools**: Custom DevTools extension
- **Request Replay**: Replay failed requests

## Monitoring & Observability

### Metrics

- **Performance Metrics**: API response times
- **Error Rates**: Track error frequency
- **Success Rates**: Track success rates
- **Cache Hit Rates**: Cache effectiveness
- **User Analytics**: User behavior tracking

### Logging

- **Structured Logging**: JSON logs
- **Log Levels**: Appropriate log levels
- **Context**: Rich log context
- **Log Aggregation**: Centralized logging
- **Log Retention**: Compliance with retention policies

### Alerting

- **Error Alerts**: Alert on error spikes
- **Performance Alerts**: Slow API alerts
- **Business Metrics**: Order failure alerts
- **Uptime Monitoring**: Service availability
- **SLA Monitoring**: Track SLA compliance

## Scalability Considerations

### Horizontal Scaling

- **Stateless Services**: No local state
- **Load Balancing**: Distribute load
- **Auto-scaling**: Scale based on load
- **Microservices**: Break into microservices

### Data Scaling

- **Sharding**: Database sharding
- **Read Replicas**: Scale reads
- **Caching Layers**: Redis, Memcached
- **Queue Systems**: Background jobs

### Geographic Distribution

- **Multi-Region**: Deploy in multiple regions
- **Edge Computing**: Run at edge
- **Data Residency**: Comply with data laws

## Migration Strategies

### API Versioning

- **Version Endpoints**: /v1/products, /v2/products
- **Deprecation Process**: Gradual deprecation
- **Breaking Changes**: Clear communication
- **Backward Compatibility**: Maintain when possible

### Service Splitting

- **Strangler Pattern**: Gradual migration
- **Feature Flags**: Toggle old/new services
- **Parallel Run**: Run both simultaneously
- **Rollback Plan**: Easy rollback mechanism

## Future Technologies

### AI/ML Integration

- **Personalization**: Personalized recommendations
- **Search**: AI-powered search
- **Pricing**: Dynamic pricing
- **Fraud Detection**: ML-based fraud detection
- **Customer Support**: AI chatbots

### Real-time Features

- **WebSockets**: Real-time updates
- **Server-Sent Events**: Live notifications
- **Collaborative Editing**: Real-time collaboration
- **Live Chat**: Real-time customer support

### Blockchain

- **NFT Products**: Sell NFT products
- **Cryptocurrency**: Crypto payments
- **Smart Contracts**: Automated agreements
- **Supply Chain**: Blockchain tracking

## Anti-patterns to Avoid

### Service Anti-patterns

- ❌ God service (too many responsibilities)
- ❌ Tight coupling between services
- ❌ No error handling
- ❌ Synchronous operations that should be async
- ❌ No caching for repeated calls
- ❌ Not handling edge cases

### API Anti-patterns

- ❌ N+1 query problems
- ❌ Returning too much data
- ❌ No pagination
- ❌ Inconsistent responses
- ❌ Poor error messages
- ❌ No versioning

### Data Anti-patterns

- ❌ Storing derived data
- ❌ Data duplication
- ❌ Not normalizing data
- ❌ Missing indexes
- ❌ Eager loading everything

## Best Practices

### Do's

- ✅ Single Responsibility Principle
- ✅ Proper error handling
- ✅ Input validation
- ✅ Output sanitization
- ✅ Async/await for async operations
- ✅ TypeScript for type safety
- ✅ Unit tests for all services
- ✅ Proper logging
- ✅ Cache appropriately
- ✅ Document all public methods

### Don'ts

- ❌ Don't put business logic in components
- ❌ Don't ignore errors
- ❌ Don't return raw API responses
- ❌ Don't hardcode values
- ❌ Don't skip validation
- ❌ Don't forget to cleanup resources
- ❌ Don't make services stateful
- ❌ Don't leak implementation details
