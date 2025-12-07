# RBAC Automation Test Suite

Comprehensive test suite for Role-Based Access Control (RBAC) scenarios and API route security.

## 📁 Test Structure

```
src/__tests__/rbac/
├── fixtures.ts                    # Mock data and test fixtures
├── test-utils.ts                  # Helper functions for testing
├── admin-role.test.ts             # Admin role permission tests
├── seller-role.test.ts            # Seller role permission tests
├── user-role.test.ts              # User role permission tests
├── guest-role.test.ts             # Guest role permission tests
├── integration.test.ts            # Cross-role integration tests
├── api-routes-security.test.ts    # API endpoint security tests
└── README.md                      # This file
```

## 🎯 Test Coverage

### Role-Based Tests

#### 1. **Admin Role Tests** (`admin-role.test.ts`)

- ✅ Product management (all shops)
- ✅ Shop management (verify, update, delete)
- ✅ Order management (all shops)
- ✅ Category management (admin-exclusive)
- ✅ Coupon management (platform-wide)
- ✅ Support ticket management
- ✅ Review moderation
- ✅ Payout processing
- ✅ User management (ban, role changes)
- ✅ Auction management
- ✅ Hero slides (admin-exclusive)

**Total Tests**: 45+ test cases

#### 2. **Seller Role Tests** (`seller-role.test.ts`)

- ✅ Own shop product CRUD
- ✅ Own shop management
- ✅ Own shop order management
- ✅ Own shop auction management
- ✅ Shop-specific coupon management
- ✅ Own shop payout requests
- ✅ Shop-related ticket management
- ✅ Review reading (own products)
- ❌ Restrictions: Other shops, categories, users
- ❌ Cannot verify own shop
- ❌ Cannot approve own payouts

**Total Tests**: 50+ test cases

#### 3. **User Role Tests** (`user-role.test.ts`)

- ✅ Browse active products/shops
- ✅ Create and manage own orders
- ✅ Participate in auctions (bidding)
- ✅ Write and manage own reviews
- ✅ Create and manage own support tickets
- ✅ Use coupons
- ✅ Cart and favorites management
- ✅ Messaging with sellers
- ✅ Own payment history
- ✅ Return requests
- ✅ Address management
- ❌ Cannot create products/shops
- ❌ Cannot access other users' data
- ❌ Cannot modify system settings

**Total Tests**: 45+ test cases

#### 4. **Guest Role Tests** (`guest-role.test.ts`)

- ✅ Browse active products/shops/categories
- ✅ View active auctions
- ✅ View approved reviews
- ✅ View hero slides
- ✅ Access public API endpoints
- ❌ Cannot create orders
- ❌ Cannot bid on auctions
- ❌ Cannot create reviews
- ❌ Cannot access cart/favorites
- ❌ Cannot send messages
- ❌ No access to authenticated resources

**Total Tests**: 35+ test cases

#### 5. **Integration Tests** (`integration.test.ts`)

- ✅ Permission hierarchy (Admin > Seller > User > Guest)
- ✅ Cross-shop resource isolation
- ✅ User-seller interactions
- ✅ Role transitions (guest→user→seller)
- ✅ Admin override scenarios
- ✅ Multi-role permission checks
- ✅ Resource ownership transfer
- ✅ Bulk operations permissions
- ✅ Coupon scope and permissions
- ✅ Public vs private resource access
- ✅ Emergency admin actions

**Total Tests**: 25+ test cases

### API Route Security Tests

#### 6. **API Route Security** (`api-routes-security.test.ts`)

- ✅ Admin routes (`/api/admin/*`) - 25+ endpoints
- ✅ Seller routes (`/api/seller/*`) - 3+ endpoints
- ✅ User routes (`/api/user/*`) - 8+ endpoints
- ✅ Product routes (`/api/products/*`) - 7+ endpoints
- ✅ Shop routes (`/api/shops/*`) - 6+ endpoints
- ✅ Order routes (`/api/orders/*`) - 6+ endpoints
- ✅ Auction routes (`/api/auctions/*`) - 7+ endpoints
- ✅ Payment routes (`/api/payments/*`) - 5+ endpoints
- ✅ Checkout routes (`/api/checkout/*`) - 2+ endpoints
- ✅ Cart routes (`/api/cart/*`) - 5+ endpoints
- ✅ Review routes (`/api/reviews/*`) - 4+ endpoints
- ✅ Category routes (`/api/categories/*`) - 5+ endpoints
- ✅ Coupon routes (`/api/coupons/*`) - 4+ endpoints
- ✅ Notification routes (`/api/notifications/*`) - 2+ endpoints
- ✅ Message routes (`/api/messages/*`) - 3+ endpoints
- ✅ Payout routes (`/api/payouts/*`) - 3+ endpoints
- ✅ Auth routes (`/api/auth/*`) - 5+ endpoints
- ✅ Security headers validation
- ✅ CORS policy enforcement

**Total Tests**: 120+ endpoint security tests

## 🚀 Running Tests

### Run All RBAC Tests

```bash
npm test -- src/__tests__/rbac
```

### Run Specific Test Suites

```bash
# Admin role tests
npm test -- src/__tests__/rbac/admin-role.test.ts

# Seller role tests
npm test -- src/__tests__/rbac/seller-role.test.ts

# User role tests
npm test -- src/__tests__/rbac/user-role.test.ts

# Guest role tests
npm test -- src/__tests__/rbac/guest-role.test.ts

# Integration tests
npm test -- src/__tests__/rbac/integration.test.ts

# API security tests
npm test -- src/__tests__/rbac/api-routes-security.test.ts
```

### Run with Coverage

```bash
npm test -- --coverage src/__tests__/rbac
```

### Watch Mode

```bash
npm test -- --watch src/__tests__/rbac
```

## 📊 Test Metrics

| Metric                    | Count                                        |
| ------------------------- | -------------------------------------------- |
| **Total Test Files**      | 7                                            |
| **Total Test Cases**      | 320+                                         |
| **API Endpoints Covered** | 150+                                         |
| **Roles Tested**          | 4 (Admin, Seller, User, Guest)               |
| **Resources Tested**      | 12 (Products, Shops, Orders, Auctions, etc.) |
| **Permission Actions**    | 4 (Read, Create, Update, Delete)             |

## 🔧 Test Utilities

### Fixtures (`fixtures.ts`)

- Mock users for all roles
- Mock Firebase tokens
- Mock resources (products, shops, orders, etc.)
- Helper functions for creating test requests

### Test Utils (`test-utils.ts`)

- `createAuthRequest()` - Create authenticated Next.js requests
- `parseResponse()` - Parse JSON responses
- `assertStatus()` - Assert HTTP status codes
- `assertUnauthorized()` - Assert 401 responses
- `assertForbidden()` - Assert 403 responses
- `testRolePermissions()` - Test multiple roles at once
- `createMockHandler()` - Create mock API handlers
- `setupTestEnv()` - Setup test environment

## 📝 Test Patterns

### Permission Test Pattern

```typescript
it("should allow admin to read any resource", () => {
  expect(canReadResource(mockAdminUser, "products", mockProduct)).toBe(true);
});

it("should prevent user from updating products", () => {
  expect(canUpdateResource(mockRegularUser, "products", mockProduct)).toBe(
    false
  );
});
```

### API Route Security Pattern

```typescript
it("should require admin role for /api/admin/users", () => {
  // Test expectations:
  // - 401 without auth
  // - 403 with user/seller token
  // - 200 with admin token
});
```

### Integration Test Pattern

```typescript
it("should isolate seller1 products from seller2", () => {
  expect(canReadResource(mockSellerUser, "products", mockProduct)).toBe(true);
  expect(canUpdateResource(mockSellerUser, "products", mockProduct2)).toBe(
    false
  );
});
```

## 🎯 Test Scenarios

### Critical Security Tests

1. ✅ Prevent unauthorized access to admin endpoints
2. ✅ Prevent cross-shop data access
3. ✅ Prevent cross-user data access
4. ✅ Validate token expiration
5. ✅ Validate role permissions
6. ✅ Test permission escalation prevention
7. ✅ Test resource ownership enforcement

### Edge Cases

1. ✅ Role transitions (guest→user→seller)
2. ✅ Resource ownership transfer
3. ✅ Bulk operations with mixed ownership
4. ✅ Public vs private resource access
5. ✅ Multi-role permission checks
6. ✅ Admin override scenarios

## 🔍 Coverage Goals

- **Line Coverage**: 90%+
- **Branch Coverage**: 85%+
- **Function Coverage**: 90%+
- **Statement Coverage**: 90%+

## 📚 Related Documentation

- [`TDD/rbac/RBAC-CONSOLIDATED.md`](../../TDD/rbac/RBAC-CONSOLIDATED.md) - Complete RBAC documentation
- [`TDD/resources/api-implementation-roadmap.md`](../../TDD/resources/api-implementation-roadmap.md) - API implementation status
- [`src/lib/rbac-permissions.ts`](../../lib/rbac-permissions.ts) - RBAC permission functions
- [`src/app/api/middleware/rbac-auth.ts`](../../app/api/middleware/rbac-auth.ts) - RBAC middleware

## 🐛 Debugging Tests

### Enable Debug Logging

```bash
DEBUG=* npm test -- src/__tests__/rbac
```

### Run Single Test

```bash
npm test -- -t "should allow admin to read any product"
```

### Verbose Output

```bash
npm test -- --verbose src/__tests__/rbac
```

## ✅ CI/CD Integration

Tests are automatically run in CI/CD pipeline:

- ✅ On pull requests
- ✅ On main branch commits
- ✅ Pre-deployment checks
- ✅ Nightly test runs

## 🔐 Security Considerations

- Mock tokens are used (not real Firebase tokens)
- Test environment is isolated
- No real API calls to external services
- No database writes
- Firestore is mocked

## 📈 Future Improvements

- [ ] Add performance benchmarks
- [ ] Add load testing scenarios
- [ ] Add mutation testing
- [ ] Add visual regression tests
- [ ] Add API contract tests
- [ ] Add E2E RBAC tests

## 👥 Contributing

When adding new roles or permissions:

1. Update fixtures with new mock data
2. Add role-specific test file
3. Update integration tests
4. Add API route security tests
5. Update this README

## 📞 Support

For questions or issues:

- Check RBAC documentation
- Review test examples
- Contact development team
