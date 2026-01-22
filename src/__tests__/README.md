# Test Suite

Comprehensive test suite for the LetItRip.in application with API and page tests.

## Structure

```
src/__tests__/
├── setup.ts                      # Jest configuration and global mocks
├── lib/                          # Library tests
│   └── fallback-data.test.ts     # Fallback data utilities (25 tests)
├── pages/                        # Page component tests
│   ├── homepage.test.tsx         # Homepage (4 tests)
│   ├── products.test.tsx         # Product listing (17 tests)
│   ├── product-detail.test.tsx   # Product details (25 tests)
│   ├── auctions.test.tsx         # Auction listing (15 tests)
│   ├── auction-detail.test.tsx   # Auction details (28 tests)
│   ├── shops.test.tsx            # Shop listing (14 tests)
│   ├── shop-detail.test.tsx      # Shop details (30 tests)
│   ├── categories.test.tsx       # Categories listing (16 tests)
│   ├── category-detail.test.tsx  # Category details (31 tests)
│   ├── search.test.tsx           # Global search (19 tests)
│   ├── cart.test.tsx             # Shopping cart (21 tests)
│   ├── checkout.test.tsx         # Checkout process (26 tests)
│   ├── static-pages.test.tsx     # Static pages (21 tests)
│   ├── about.test.tsx            # About page (20 tests)
│   ├── auth.test.tsx             # Authentication (29 tests)
│   ├── user.test.tsx             # User pages (37 tests)
│   ├── admin.test.tsx            # Admin dashboard (25 tests)
│   ├── admin-extended.test.tsx   # Admin extended (47 tests)
│   ├── admin-cms.test.tsx        # Admin CMS (NEW - 60 tests)
│   └── seller.test.tsx           # Seller dashboard (30 tests)
└── api/                          # API endpoint tests
    ├── products-api.test.ts      # Product API (10 tests)
    ├── auth-api.test.ts          # Auth API (NEW - 20 tests)
    ├── cart-api.test.ts          # Cart API (NEW - 15 tests)
    ├── auctions-api.test.ts      # Auctions API (NEW - 25 tests)
    ├── orders-api.test.ts        # Orders API (NEW - 20 tests)
    ├── user-api.test.ts          # User API (NEW - 40 tests)
    ├── seller-api.test.ts        # Seller API (NEW - 50 tests)
    ├── admin-api.test.ts         # Admin API (NEW - 60 tests)
    └── other-apis.test.ts        # Reviews, Messages, Search, etc (NEW - 70 tests)
```

## Test Coverage

**Total: 734 tests across 30 test suites**

### Page Tests (434 tests)

- Homepage & Landing pages
- Product listing & details
- Auction listing & details
- Shop listing & details
- Categories & Category details
- Search functionality
- Cart & Checkout flows
- Authentication pages
- User profile & account pages
- Admin CMS pages & banners
- Seller analytics dashboard
- Admin analytics dashboard
- Avatar upload component
- Admin management (dashboard, users, products, orders, shops, auctions, categories, coupons, analytics)
- Seller dashboard & management
- Static content pages (about, contact, FAQ, terms, privacy, deals)

### Library Tests (25 tests)

- Fallback data validation
- fetchWithFallback utility
- Pagination utilities

### API Tests (310 tests)

#### Authentication API (20 tests)

- Login, register, logout, session management
- Token validation, user creation

#### Cart API (15 tests)

- Add to cart, update quantity, remove items
- Clear cart, ownership checks

#### Auctions API (25 tests)

- List auctions, bid placement, bid validation
- Auction status, bid history, pagination

#### Orders API (20 tests)

- Checkout, order listing, order details
- Cancellation, tracking, refunds

#### User API (40 tests)

- Profile CRUD, wishlist operations
- Address management, bid history, avatar upload

#### Seller API (50 tests)

- Shop management, product CRUD, auction CRUD
- Order management, analytics, dashboard stats

#### Admin API (60 tests)

- User management, moderation, analytics
- Categories, CMS, approval workflows

#### Other APIs (70 tests)

- Reviews, messages, search/autocomplete
- Coupon validation, blog comments, categories, shops

#### Products API (10 tests)

- Product endpoints, filtering & sorting

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage

# Run specific test file
npm test homepage.test

# Run tests matching pattern
npm test -- --testNamePattern="Product"
```

## Test Categories

### 1. Library Tests

- Fallback data validation
- `fetchWithFallback` utility
- Pagination utilities
- Data structure validation

### 2. Page Tests

- Homepage rendering
- Product listing and filtering
- Auction listing and bidding
- Shop listing and details
- Component integration

### 3. API Tests

- Product endpoints
- Data filtering
- Sorting logic
- Pagination
- Search functionality

## Using Fallback Data

All tests use fallback data from `@/lib/fallback-data` as mock data:

```typescript
import { FALLBACK_PRODUCTS, FALLBACK_AUCTIONS } from "@/lib/fallback-data";

// Use in tests
const mockProducts = FALLBACK_PRODUCTS;
const mockAuctions = FALLBACK_AUCTIONS;
```

## Best Practices

1. **Isolation**: Each test should be independent
2. **Mocking**: Use fallback data instead of real API calls
3. **Coverage**: Aim for 80%+ code coverage
4. **Clear Names**: Test names should describe what they test
5. **Assertions**: Each test should have clear assertions

## Adding New Tests

1. Create test file in appropriate directory
2. Import fallback data
3. Write test cases
4. Run tests to verify
5. Check coverage

## Coverage Goals

- **Statements**: 50%+
- **Branches**: 50%+
- **Functions**: 50%+
- **Lines**: 50%+

Current coverage reports are generated in `coverage/` directory.
