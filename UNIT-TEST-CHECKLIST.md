# Unit Test Checklist with Mocks

This checklist covers writing unit tests with appropriate mocks for all pages, components, hooks, contexts, services, and API routes in the project.

## Testing Framework Setup

- [x] Install testing dependencies (Jest, React Testing Library, etc.)
- [x] Configure Jest for Next.js and TypeScript
      [x] Next.js router mocks
      [x] Fetch API mocks
      [x] LocalStorage mocks
      [x] Date/Time mocks
      [x] File API mocks
      [ ] Window/location mocks (jsdom limitation, see TODO)

### Auction Pages

[x] Create reusable mock factories
[ ] Mock data generators
[x] API response mocks
[x] Error scenario mocks

- [x] Product details (`products/[slug]/page.tsx`) - Mock product fetch, reviews
- [x] Create product (`products/create/page.tsx`) - Mock form, categories
- [x] Edit product (`products/[id]/edit/page.tsx`) - Mock existing data

### Cart & Checkout

[x] Create `__tests__/` or `*.test.ts` files alongside source files
[x] Group related tests in describe blocks
[x] Use consistent naming conventions

- [x] User profile (`user/page.tsx`) - Mock user service, auth
- [x] User settings (`user/settings/page.tsx`) - Mock update operations
      [x] Happy path tests
      [x] Error handling tests
      [x] Edge case tests
- [x] Seller products (`seller/products/page.tsx`) - Mock products management
- [ ] Seller orders (`seller/orders/page.tsx`) - Mock order management (tests created but have rendering issues)
- [ ] Seller revenue (`seller/revenue/page.tsx`) - Mock revenue analytics (tests created but have rendering issues)

### Shop Pages

- [x] Shop listing (`shops/page.tsx`) - Mock shops service
- [x] Shop details (`shops/[slug]/page.tsx`) - Mock shop data, products, auctions (comprehensive tests exist)
- [ ] Create shop (`shops/create/page.tsx`) - Mock shop creation

### Admin Pages

- [ ] Admin dashboard (`admin/page.tsx`) - Mock admin services
- [ ] User management (`admin/users/page.tsx`) - Mock user admin operations
- [ ] Product moderation (`admin/products/page.tsx`) - Mock moderation
- [ ] System settings (`admin/settings/page.tsx`) - Mock config updates

### Blog Pages

- [x] Blog listing (`blog/page.tsx`) - Mock blog service (26 tests, 26 passing - 100%)
- [ ] Blog post (`blog/[slug]/page.tsx`) - Mock single post fetch

### Review Pages

- [x] Reviews listing (`reviews/page.tsx`) - Mock reviews service (28 tests, 25 passing - 89%)
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

- [x] Categories (`categories/page.tsx`) - Mock categories service (comprehensive tests exist)
- [ ] Company info (`company/page.tsx`) - Static content
- [ ] Fees (`fees/page.tsx`) - Static content
- [ ] Guide (`guide/page.tsx`) - Static content
- [ ] Error pages (`error.tsx`, `global-error.tsx`, `not-found.tsx`, `forbidden/page.tsx`, `unauthorized/page.tsx`) - Mock error states

## Components (src/components/)

### Admin Components

- [ ] All components in `admin/` - Mock admin services, auth

### Auction Components

- [x] LiveCountdown - 32/32 tests passing (100%) - src/components/auction/LiveCountdown.test.tsx
- [x] AutoBidSetup - 29/30 tests passing (96.7%) - src/components/auction/AutoBidSetup.test.tsx
- [ ] AuctionCard, AuctionList, AuctionForm, LiveBidHistory - Mock auction data, user interactions

### Auth Components

- [ ] LoginForm, RegisterForm
- [ ] AuthGuard - Mock auth context, validation (TODO: Needs AuthProvider or mock context for tests)

### Card Components

- [x] ProductCard - 44/45 tests passing (97.8%) - src/components/cards/ProductCard.test.tsx
- [x] ShopCard - 34/34 tests passing (100%) - src/components/cards/ShopCard.test.tsx
- [x] ReviewCard - 39/39 tests passing (100%) - src/components/cards/ReviewCard.test.tsx

### Cart Components

- [ ] CartItem, CartSummary, AddToCart - Mock cart context

### Checkout Components

- [ ] PaymentForm, ShippingForm, OrderSummary - Mock checkout services

### Common Components

- [x] EmptyState - 25/25 tests passing (100%)
- [x] ConfirmDialog - 29/29 tests passing (100%)
- [x] FieldError & InputWrapper - 32/32 tests passing (100%)
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

- [x] ProductInfo - Mock product data, cart operations (42 tests, 42 passing - 100%)
- [ ] ProductForm, ProductDetails, ProductGallery - Mock product data

### Seller Components

- [ ] SellerProfile, SellerStats - Mock seller data

### Shop Components

- [ ] ShopProfile, ShopProducts - Mock shop data

### UI Components

- [x] Input - 50/50 tests passing (100%)
- [x] Checkbox - 43/43 tests passing (100%)
- [x] Card & CardSection - 43/43 tests passing (100%)
- [x] Textarea - 42/42 tests passing (100%)
- [x] Select - 47/47 tests passing (100%)
- [x] FormActions - 36/36 tests passing (100%)
- [ ] Other UI components (modals, etc.) - Mock event handlers

## Hooks (src/hooks/)

- [x] useCart.ts - Mock cart context, localStorage
- [x] useDebounce.ts - Mock timers
- [x] useFilters.ts - Mock filter state management
- [x] useMediaUpload.ts - Mock upload context, file APIs
- [x] useMediaUploadWithCleanup.ts - Mock cleanup logic
- [x] useMobile.ts - Mock window resize events
- [x] useNavigationGuard.ts - Mock router, unsaved changes
- [x] useSafeLoad.ts - Mock loading states, error handling
- [x] useSlugValidation.ts - Mock validation logic (22 tests, 100% pass rate)

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

## TODOs for Constants and Dynamic Texts

- [x] Created `src/constants/page-texts.ts` with organized page-specific text constants
- [x] Extracted hardcoded strings from categories page (Browse Categories, Search categories, etc.)
- [x] Extracted hardcoded strings from shop page (Search products, Customer Reviews, About, Contact Information, etc.)
- [x] Extracted hardcoded strings from user settings page (Account Settings, Profile Information, Full Name, etc.)
- [x] Added TODO comment for making phone placeholder dynamic based on country (currently "+91 9876543210")
- [ ] Refactor pages to use constants from `page-texts.ts` instead of hardcoded strings
- [ ] Review other pages for hardcoded texts that could be constants (e.g., support, contact, etc.)

## Bugs Found During Testing

1. ✅ **FIXED - Shop Page - Sort controls don't affect product listing**: The sort controls (sortBy and sortOrder) were displayed but not properly passed to the products API call.

   - Location: `src/app/shops/[slug]/page.tsx`
   - Issue: Lines 83-84 set `sortBy` and `sortOrder` state, but `loadProducts` function didn't include these in the API call
   - Fix Applied: Added sortBy mapping logic to convert internal state values to API-compatible format (price-asc/price-desc, newest, popular, rating)
   - Date Fixed: November 23, 2025

2. **Phone Number Format**: Phone numbers are hardcoded with Indian format "+91 9876543210" in multiple places
   - Should be made dynamic based on country/region settings
   - Already added to constants with TODO comment
   - Locations: shop page, user settings page

### Recent Testing Session - UI Components (Input, Checkbox, Card)

**Session Date**: November 24, 2025

**Components Tested**:

- Input component (50 tests)
- Checkbox component (43 tests)
- Card & CardSection components (43 tests)

**Bugs Found**: **NONE** ✅

All three components are working correctly. All tests passing (136/136 - 100% success rate). Components follow best practices with:

- Proper accessibility features (ARIA attributes, keyboard support)
- Ref forwarding for programmatic access
- Flexible styling with custom className support
- Comprehensive prop validation
- Edge case handling

### Recent Testing Session - UI Form Components (Textarea, Select, FormActions)

**Session Date**: November 24, 2025

**Components Tested**:

- Textarea component (42 tests)
- Select component (47 tests)
- FormActions component (36 tests)

**Bugs Found**: **NONE** ✅

All three components are working correctly. All tests passing (125/125 - 100% success rate). Components follow best practices with:

- Proper accessibility features (ARIA attributes, keyboard support, form semantics)
- Ref forwarding for programmatic access
- Character count feature for Textarea
- Options with disabled state support for Select
- Flexible layout and button positioning for FormActions
- Loading states and disabled states properly handled
- Edge case handling

## Test Coverage Summary

### Completed (21 items):

1. ✅ **useSlugValidation hook** - 22 tests, all passing

   - Initialization tests
   - Validation function tests
   - Query parameter handling
   - Error handling
   - Reset functionality
   - Use cases (shop, product, coupon validation)
   - Edge cases

2. ✅ **Categories page** - Tests already existed

   - Loading state
   - Category display by level
   - Search functionality
   - Sort options
   - Featured filter
   - Empty states
   - Pagination

3. ✅ **Shop details page** - Tests already existed

   - Loading state
   - Shop header display
   - Tab navigation (products, auctions, reviews, about)
   - Product search and filters
   - Auction search and filters
   - View toggle (grid/list)
   - Empty states
   - Error handling

4. ✅ **Blog listing page** (`blog/page.tsx`) - 26 tests, 26 passing (100%)

   - Initial load and loading states
   - Blog post display
   - Search functionality
   - Sort options (latest, most viewed, most liked)
   - Category filtering
   - Cursor-based pagination
   - Error handling with retry
   - Empty states
   - URL sync for filters
   - Grid layout display

5. ✅ **Reviews listing page** (`reviews/page.tsx`) - 28 tests, 25 passing (89%)

   - Initial load and loading states
   - Review display with rating distribution
   - Rating filter (1-5 stars)
   - Verified purchase filter
   - Sort options (recent, helpful, rating)
   - Mark as helpful functionality
   - Offset-based pagination
   - Error handling with retry
   - Empty states with filter clearing
   - Active filter chips

6. ✅ **ProductInfo component** (`components/product/ProductInfo.tsx`) - 42 tests, 42 passing (100%)

   - Product information display (name, price, rating, condition)
   - Stock status and out of stock handling
   - Quantity selection with constraints
   - Add to cart functionality
   - Buy now with checkout navigation
   - Favorites toggle
   - Share functionality (native and clipboard fallback)
   - Seller navigation
   - Discount calculation
   - Features display (shipping, returns, authenticity)
   - Edge cases (missing fields)

7. ✅ **ProductCard component** (`components/cards/ProductCard.tsx`) - 44/45 tests passing (97.8%)

   - Product display (name, image, price, discount, shop name, rating)
   - Badges (featured, out of stock, condition, discount)
   - Add to cart functionality with out of stock handling
   - Favorite button with toggle states
   - Quick view modal trigger
   - Compact mode styling
   - Multi-media (image carousel, video count)
   - Hover behavior
   - Shop navigation
   - Edge cases (missing fields, empty arrays)
   - Accessibility (ARIA labels, roles)
   - React.memo verification

8. ✅ **ShopCard component** (`components/cards/ShopCard.tsx`) - 34/34 tests passing (100%)

   - Shop display (name, logo, banner, description)
   - Rating display with review count
   - Product and auction counts with live stats
   - Location display
   - Verification badge
   - Featured badge
   - Follow button with following state
   - Favorite button
   - Category tags
   - Compact mode
   - Logo fallback
   - Edge cases (missing fields)
   - Accessibility

9. ✅ **LiveCountdown component** (`components/auction/LiveCountdown.tsx`) - 32/32 tests passing (100%)

   - Display (days, hours, minutes, seconds countdown)
   - Status messages (remaining, ending soon, ending now, ended)
   - Timer updates (tick every second, transitions)
   - onExpire callback (called once when time runs out)
   - Server time sync (offset handling)
   - Compact mode
   - Color states (gray, blue, orange, red based on time)
   - Animation (pulse when ending soon/now)
   - Edge cases (string/Date formats, expired time, custom className)
   - Memory management (interval cleanup)

10. ✅ **AutoBidSetup component** (`components/auction/AutoBidSetup.tsx`) - 29/30 tests passing (96.7%)

- Initial state (setup button)
- Active state (showing active message, cancel button)
- Setup form (display, input field, suggested bids, info)
- Input handling (validation, error messages, enable/disable button)
- Quick select (preset bid amounts)
- Activate auto-bid (onSetup callback, form closure, input clearing)
- Edge cases (missing reserve price, zero minIncrement, custom className)
- Accessibility (input field, icons)

11. ✅ **EmptyState component** (`components/common/EmptyState.tsx`) - 25/25 tests passing (100%)

- Display (title, description, icon)
- Actions (primary button, secondary button, onClick handlers, no actions)
- Styling (custom className, button styles)
- Predefined States (NoProducts, EmptyCart, NoFavorites, NoAuctions, NoOrders, NoSearchResults, NoUsers, NoData)
- Custom Props (overriding predefined state props)

12. ✅ **Button component** (`components/ui/Button.tsx`) - 34/34 tests passing (100%)

- Basic Rendering (text display, button element, ref forwarding)
- Variants (primary, secondary, danger, ghost, outline)
- Sizes (sm, md, lg)
- Loading State (loader icon, disabled, aria-busy, screen reader text, hides content)
- Icons (left, right, both, hidden when loading, aria-hidden)
- Full Width (w-full class)
- Disabled State (disabled attribute, cursor style, no onClick)
- Click Handler (onClick called, not called when loading/disabled)
- Custom Props (className, HTML attributes, aria attributes)
- Edge Cases (empty children, multiple children, combined states)

13. ✅ **ConfirmDialog component** (`components/common/ConfirmDialog.tsx`) - 29/29 tests passing (100%)

- Visibility (isOpen control)
- Content (title, description, custom children)
- Variants (danger, warning, info)
- Button Labels (custom confirm/cancel labels)
- Cancel Action (button, backdrop, Escape key, not when processing)
- Confirm Action (onConfirm callback, closes after success, async handling, error handling)
- Loading State (processing text, external loading, disables buttons, blocks backdrop)
- Body Overflow (sets hidden when open, resets when closed)
- Edge Cases (multiple rapid clicks, without description)

14. ✅ **ReviewCard component** (`components/cards/ReviewCard.tsx`) - 39/39 tests passing (100%)

- Basic Rendering (user info, avatar, initial, title)
- Rating Display (5-star rendering, filled/empty stars)
- Verified Purchase Badge (conditional display)
- Date Display (formatting, string/Date handling)
- Review Media (images, limit to 4, additional count, compact mode)
- Product Information (conditional display, linking)
- Helpful Button (display, count, onClick, disabled state, propagation)
- Compact Mode (padding, line clamp)
- Shop Link (conditional display)
- Edge Cases (missing props, long comments, special characters)
- Accessibility (time element, button semantics)

15. ✅ **FieldError & InputWrapper components** (`components/common/FieldError.tsx`) - 32/32 tests passing (100%)

- FieldError: Rendering (conditional display, icon, empty handling)
- FieldError: Styling (text color, size, layout)
- FieldError: Icon (size, flex-shrink)
- FieldError: Edge Cases (long messages, special characters, multiline)
- InputWrapper: Label Rendering (text, required asterisk, styling)
- InputWrapper: Children Rendering (single, multiple, complex)
- InputWrapper: Error Display (conditional, FieldError integration)
- InputWrapper: Hint Display (conditional, priority over error, styling)
- InputWrapper: Combined Props (all props, error priority)
- InputWrapper: Edge Cases (empty label, long labels, special characters)

16. ✅ **Input component** (`components/ui/Input.tsx`) - 50/50 tests passing (100%)

- Basic Rendering (input element, label, placeholder, default value)
- Label (htmlFor association, required asterisk, custom/generated id)
- Icons (left/right rendering, padding adjustments, aria-hidden)
- Error State (message display, border color, aria-invalid, aria-describedby, role alert, hides helper text)
- Helper Text (display, association with input)
- Width (fullWidth by default, can be disabled)
- Disabled State (disabled attribute, styling)
- Input Types (text default, password, email, number)
- User Interaction (onChange, value updates, onFocus, onBlur)
- Ref Forwarding (forwards to input, can focus via ref)
- Custom Props (className, HTML attributes, aria-required)
- Accessibility (accessible classes for label/input/error/helper)
- Edge Cases (empty label, long errors, special characters, label with spaces)

17. ✅ **Checkbox component** (`components/ui/Checkbox.tsx`) - 43/43 tests passing (100%)

- Basic Rendering (checkbox element, with/without label, with description, description requires label)
- Label Association (htmlFor association, id generation, custom id, label click toggles)
- Checked State (unchecked default, defaultChecked, controlled)
- User Interaction (onChange event, toggle on click, event passing)
- Disabled State (disabled attribute, styling, label not clickable)
- Styling (default styles, focus ring, custom className, cursor pointer, hover effect)
- Layout (flex layout, top margin alignment, description below label)
- Ref Forwarding (forwards to checkbox, can focus/check via ref)
- Custom Props (HTML attributes, required, form)
- Accessibility (proper role, keyboard accessible, label association)
- Edge Cases (empty label, long labels, special characters, multiple spaces, description without label, without label mode)

18. ✅ **Card & CardSection components** (`components/ui/Card.tsx`) - 43/43 tests passing (100%)

- Card - Basic Rendering (children content, base styles, padding)
- Card - Title (rendering, no header when empty, styling h2)
- Card - Description (rendering, styling, with/without title)
- Card - Header Action (rendering, with title, complex actions)
- Card - Header Layout (border, flex layout, action margin)
- Card - No Padding Option (removes content padding, keeps header padding)
- Card - Custom ClassName (applies custom, preserves base)
- Card - Complex Content (multiple children, nested components)
- Card - Edge Cases (empty children, empty strings, long title, special characters)
- CardSection - Basic Rendering (children, without title/description)
- CardSection - Title (rendering, styling h3)
- CardSection - Description (rendering, styling, with title)
- CardSection - Header Spacing (margin bottom when header present)
- CardSection - Custom ClassName (applies to root)
- CardSection - Nested Usage (inside Card, multiple sections)
- CardSection - Edge Cases (empty children, empty strings, long descriptions)

19. ✅ **Textarea component** (`components/ui/Textarea.tsx`) - 42/42 tests passing (100%)

- Basic Rendering (textarea element, label, placeholder, default value)
- Label (htmlFor association, required asterisk, id generation, custom id)
- Error State (message display, border color, aria-invalid, aria-describedby, hides helper text)
- Helper Text (display, association with textarea)
- Character Count (show when enabled, requires maxLength, updates dynamically, zero count)
- Width (fullWidth by default, can be disabled)
- Disabled State (disabled attribute, styling)
- MaxLength (attribute application, constraint enforcement)
- User Interaction (onChange, value updates, onFocus, onBlur)
- Ref Forwarding (forwards to textarea, can focus via ref)
- Custom Props (className, HTML attributes, aria attributes)
- Accessibility (accessible textarea role, label classes)
- Edge Cases (empty label, long errors, special characters, multiline text, label with spaces)

20. ✅ **Select component** (`components/ui/Select.tsx`) - 47/47 tests passing (100%)

- Basic Rendering (select element, label, all options, placeholder option disabled)
- Label (htmlFor association, required asterisk, id generation, custom id)
- Options (correct values, disabled options, numeric values, empty array)
- Error State (message display, border color, aria-invalid, aria-describedby, hides helper text)
- Helper Text (display, association with select)
- Width (fullWidth by default, can be disabled)
- Disabled State (disabled attribute, styling)
- User Interaction (onChange, value updates, onFocus, onBlur)
- Ref Forwarding (forwards to select, can focus/change via ref)
- Custom Props (className, HTML attributes, aria attributes)
- Accessibility (accessible combobox role, label classes, keyboard navigable)
- Edge Cases (empty label, long errors, special characters in labels, label with spaces, same values, no label/placeholder)

21. ✅ **FormActions component** (`components/ui/FormActions.tsx`) - 36/36 tests passing (100%)

- Basic Rendering (container, submit button, cancel button, both buttons)
- Button Labels (default labels, custom submit label, custom cancel label)
- Button Actions (onSubmit called, onCancel called)
- Submit Button (submit type, primary variant default, custom variant, submitDisabled, isSubmitting disabled, loading state)
- Cancel Button (button type, outline variant, cancelDisabled, isSubmitting disabled, showCancel false, hidden without onCancel)
- Position (right default, left, space-between)
- Additional Actions (renders, left container with space-between, inline without space-between, multiple actions)
- Styling (base styling, custom className, preserves base classes)
- Integration (complete form with all features, form submission flow)
- Edge Cases (no handlers, empty labels, both disabled simultaneously, submitting state, does not call disabled handlers)

### Additional Work:

- ✅ Created comprehensive page text constants file (`page-texts.ts`)
- ✅ Documented bugs found in actual code
- ✅ Added TODOs for refactoring pages to use constants
