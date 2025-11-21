# Unit Test Checklist with Mocks

This checklist covers writing unit tests with appropriate mocks for all pages, components, hooks, contexts, services, and API routes in the project.

## Testing Framework Setup

- [x] Install testing dependencies (Jest, React Testing Library, etc.)
- [x] Configure Jest for Next.js and TypeScript
- [x] Set up test utilities and mock helpers
- [x] Configure test environment for Firebase mocking

## Pages (src/app/)

### Main Pages

- [x] Home page (`page.tsx`) - Mock API calls, contexts
- [x] About page (`about/page.tsx`) - Mock static content if needed
- [x] Contact page (`contact/page.tsx`) - Mock form submission
- [x] FAQ page (`faq/page.tsx`) - Mock data fetching
- [x] Search page (`search/page.tsx`) - Mock search API, filters
- [x] Login page (`login/page.tsx`) - Mock auth context, form validation
- [x] Register page (`register/page.tsx`) - Mock auth service, validation
- [x] Logout page (`logout/page.tsx`) - Mock auth cleanup

### Auction Pages

- [x] Auctions listing (`auctions/page.tsx`) - Mock auctions service, filters
- [x] Auction details (`auctions/[id]/page.tsx`) - Mock single auction fetch, bidding
- [ ] Create auction (`auctions/create/page.tsx`) - Mock form, media upload
- [ ] Edit auction (`auctions/[id]/edit/page.tsx`) - Mock existing data, update

### Product Pages

- [ ] Products listing (`products/page.tsx`) - Mock products service, pagination
- [ ] Product details (`products/[id]/page.tsx`) - Mock product fetch, reviews
- [ ] Create product (`products/create/page.tsx`) - Mock form, categories
- [ ] Edit product (`products/[id]/edit/page.tsx`) - Mock existing data

### Cart & Checkout

- [ ] Cart page (`cart/page.tsx`) - Mock cart context, items
- [ ] Checkout page (`checkout/page.tsx`) - Mock cart, payment, shipping
- [ ] Order confirmation (`checkout/success/page.tsx`) - Mock order data

### User Account

- [ ] User profile (`user/page.tsx`) - Mock user service, auth
- [ ] User settings (`user/settings/page.tsx`) - Mock update operations
- [ ] Order history (`user/orders/page.tsx`) - Mock orders service
- [ ] Favorites (`user/favorites/page.tsx`) - Mock favorites service

### Seller Pages

- [ ] Seller dashboard (`seller/page.tsx`) - Mock seller data, stats
- [ ] Seller products (`seller/products/page.tsx`) - Mock products management
- [ ] Seller orders (`seller/orders/page.tsx`) - Mock order management
- [ ] Seller payouts (`seller/payouts/page.tsx`) - Mock payout service

### Shop Pages

- [ ] Shop listing (`shops/page.tsx`) - Mock shops service
- [ ] Shop details (`shops/[id]/page.tsx`) - Mock shop data, products
- [ ] Create shop (`shops/create/page.tsx`) - Mock shop creation

### Admin Pages

- [ ] Admin dashboard (`admin/page.tsx`) - Mock admin services
- [ ] User management (`admin/users/page.tsx`) - Mock user admin operations
- [ ] Product moderation (`admin/products/page.tsx`) - Mock moderation
- [ ] System settings (`admin/settings/page.tsx`) - Mock config updates

### Blog Pages

- [ ] Blog listing (`blog/page.tsx`) - Mock blog service
- [ ] Blog post (`blog/[slug]/page.tsx`) - Mock single post fetch

### Review Pages

- [ ] Reviews listing (`reviews/page.tsx`) - Mock reviews service
- [ ] Write review (`reviews/write/page.tsx`) - Mock review submission

### Support Pages

- [ ] Support tickets (`support/page.tsx`) - Mock support service
- [ ] Create ticket (`support/create/page.tsx`) - Mock ticket creation

### Legal Pages

- [ ] Terms of service (`terms-of-service/page.tsx`) - Static content
- [ ] Privacy policy (`privacy-policy/page.tsx`) - Static content
- [ ] Cookie policy (`cookie-policy/page.tsx`) - Static content
- [ ] Refund policy (`refund-policy/page.tsx`) - Static content
- [ ] Shipping policy (`shipping-policy/page.tsx`) - Static content

### Other Pages

- [ ] Categories (`categories/page.tsx`) - Mock categories service
- [ ] Company info (`company/page.tsx`) - Static content
- [ ] Fees (`fees/page.tsx`) - Static content
- [ ] Guide (`guide/page.tsx`) - Static content
- [ ] Error pages (`error.tsx`, `global-error.tsx`, `not-found.tsx`, `forbidden/page.tsx`, `unauthorized/page.tsx`) - Mock error states

## Components (src/components/)

### Admin Components

- [ ] All components in `admin/` - Mock admin services, auth

### Auction Components

- [ ] AuctionCard, AuctionList, AuctionForm, etc. - Mock auction data, user interactions

### Auth Components

- [ ] LoginForm, RegisterForm, AuthGuard - Mock auth context, validation

### Card Components

- [ ] ProductCard, ShopCard, ReviewCard - Mock data props

### Cart Components

- [ ] CartItem, CartSummary, AddToCart - Mock cart context

### Checkout Components

- [ ] PaymentForm, ShippingForm, OrderSummary - Mock checkout services

### Common Components

- [ ] Header, Footer, Navigation, SearchBar - Mock routing, auth

### FAQ Components

- [ ] FAQList, FAQItem - Mock FAQ data

### Filter Components

- [ ] FilterPanel, PriceFilter, CategoryFilter - Mock filter logic

### Layout Components

- [ ] Layout wrappers, breadcrumbs - Mock props

### Legal Components

- [ ] Terms display, policy components - Static content

### Media Components

- [ ] ImageUpload, MediaGallery - Mock upload context, services

### Mobile Components

- [ ] Mobile-specific components - Mock mobile hooks

### Product Components

- [ ] ProductForm, ProductDetails, ProductGallery - Mock product data

### Seller Components

- [ ] SellerProfile, SellerStats - Mock seller data

### Shop Components

- [ ] ShopProfile, ShopProducts - Mock shop data

### UI Components

- [ ] Buttons, inputs, modals, etc. - Mock event handlers

## Hooks (src/hooks/)

- [x] useCart.ts - Mock cart context, localStorage
- [x] useDebounce.ts - Mock timers
- [x] useFilters.ts - Mock filter state management
- [x] useMediaUpload.ts - Mock upload context, file APIs
- [x] useMediaUploadWithCleanup.ts - Mock cleanup logic
- [x] useMobile.ts - Mock window resize events
- [x] useNavigationGuard.ts - Mock router, unsaved changes
- [x] useSafeLoad.ts - Mock loading states, error handling
- [ ] useSlugValidation.ts - Mock validation logic

## Contexts (src/contexts/)

- [ ] AuthContext.tsx - Mock Firebase auth, user state
- [ ] UploadContext.tsx - Mock file upload progress, Firebase storage

## Services (src/services/)

- [ ] address.service.ts - Mock API calls
- [ ] analytics.service.ts - Mock analytics tracking
- [ ] api.service.ts - Mock HTTP requests
- [ ] auctions.service.ts - Mock auction CRUD operations
- [ ] auth.service.ts - Mock Firebase auth methods
- [ ] blog.service.ts - Mock blog content
- [ ] cart.service.ts - Mock cart operations
- [ ] categories.service.ts - Mock category data
- [ ] checkout.service.ts - Mock payment processing
- [ ] coupons.service.ts - Mock coupon validation
- [ ] demo-data.service.ts - Mock demo data generation
- [ ] error-tracking.service.ts - Mock error reporting
- [ ] favorites.service.ts - Mock favorites management
- [ ] hero-slides.service.ts - Mock hero content
- [ ] homepage-settings.service.ts - Mock settings
- [ ] homepage.service.ts - Mock homepage data
- [ ] media.service.ts - Mock media upload/download
- [ ] orders.service.ts - Mock order management
- [ ] payouts.service.ts - Mock payout calculations
- [ ] products.service.ts - Mock product CRUD
- [ ] returns.service.ts - Mock return processing
- [ ] reviews.service.ts - Mock review management
- [ ] search.service.ts - Mock search functionality
- [ ] shops.service.ts - Mock shop operations
- [ ] static-assets-client.service.ts - Mock asset loading
- [ ] support.service.ts - Mock support tickets
- [ ] test-data.service.ts - Mock test data
- [ ] users.service.ts - Mock user management

### Admin Services

- [ ] All services in `admin/` - Mock admin-specific operations

## API Routes (src/app/api/)

### Admin Routes

- [ ] All routes in `admin/` - Mock database operations, auth

### Analytics Routes

- [ ] Analytics endpoints - Mock data aggregation

### Auction Routes

- [ ] Auction CRUD endpoints - Mock auction operations

### Auth Routes

- [ ] Login, register, logout - Mock Firebase auth

### Blog Routes

- [ ] Blog content endpoints - Mock CMS operations

### Cart Routes

- [ ] Cart management endpoints - Mock cart persistence

### Categories Routes

- [ ] Category management - Mock category operations

### Checkout Routes

- [ ] Payment processing - Mock payment gateways

### Coupons Routes

- [ ] Coupon validation - Mock coupon logic

### Favorites Routes

- [ ] Favorites management - Mock user preferences

### Health Routes

- [ ] Health checks - Mock system status

### Hero Slides Routes

- [ ] Hero content management - Mock content updates

### Homepage Routes

- [ ] Homepage settings - Mock configuration

### Media Routes

- [ ] File upload/download - Mock storage operations

### Notifications Routes

- [ ] Notification management - Mock messaging

### Orders Routes

- [ ] Order processing - Mock order lifecycle

### Payments Routes

- [ ] Payment handling - Mock payment providers

### Payouts Routes

- [ ] Payout calculations - Mock financial operations

### Products Routes

- [ ] Product management - Mock product operations

### Protected Routes

- [ ] Authentication middleware - Mock auth checks

### Returns Routes

- [ ] Return processing - Mock return workflows

### Reviews Routes

- [ ] Review management - Mock review operations

### Search Routes

- [ ] Search functionality - Mock search indexing

### Seller Routes

- [ ] Seller operations - Mock seller management

### Shops Routes

- [ ] Shop management - Mock shop operations

### Tickets Routes

- [ ] Support tickets - Mock support system

### User Routes

- [ ] User profile management - Mock user operations

### Users Routes

- [ ] User administration - Mock user admin

## Mocking Strategy

### Common Mocks Needed

- [ ] Firebase Auth mocks
- [ ] Firebase Firestore mocks
- [ ] Firebase Storage mocks
- [ ] Next.js router mocks
- [ ] Fetch API mocks
- [ ] LocalStorage mocks
- [ ] Date/Time mocks
- [ ] File API mocks
- [ ] Window/location mocks

### Mock Utilities

- [ ] Create reusable mock factories
- [ ] Mock data generators
- [ ] API response mocks
- [ ] Error scenario mocks

## Test Organization

### File Structure

- [ ] Create `__tests__/` or `*.test.ts` files alongside source files
- [ ] Group related tests in describe blocks
- [ ] Use consistent naming conventions

### Test Categories

- [ ] Happy path tests
- [ ] Error handling tests
- [ ] Edge case tests
- [ ] Loading state tests
- [ ] Authentication tests
- [ ] Authorization tests

## Coverage Goals

- [ ] Aim for 80%+ code coverage
- [ ] Cover all branches and conditions
- [ ] Test error boundaries and fallbacks
- [ ] Include integration tests for critical paths

## CI/CD Integration

- [ ] Run tests on every commit
- [ ] Generate coverage reports
- [ ] Fail builds on test failures
- [ ] Parallel test execution for speed

## Utility Functions (src/lib/)

### Core Utilities

- [x] utils.test.ts - General utility functions
- [x] formatters.test.ts - Data formatting utilities
- [x] price.utils.test.ts - Price calculation and formatting
- [x] date-utils.test.ts - Date manipulation and formatting
- [x] filter-helpers.test.ts - Filter logic and helpers
- [x] analytics.test.ts - Analytics tracking utilities
- [x] rbac-permissions.test.ts - Role-based access control
- [x] form-validation.test.ts - Form validation logic
- [x] category-hierarchy.test.ts - Category tree operations
- [x] error-redirects.test.ts - Error handling and redirects

### Validation

- [x] validation/product.test.ts - Product validation schemas

### Firebase

- [x] firebase/query-helpers.test.ts - Firestore query utilities

### Error Handling

- [x] api-errors.test.ts - API error handling and formatting
- [x] error-logger.test.ts - Error logging and reporting

### Performance

- [x] performance.test.ts - Performance monitoring utilities
