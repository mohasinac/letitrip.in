# Service Testing Patterns

## Overview

This document outlines the established patterns for testing service layer code in this project. All service tests follow these conventions for consistency, maintainability, and comprehensive coverage.

## Test File Structure

### Location

- All service tests are located in `src/services/__tests__/`
- Test files are named `{service-name}.service.test.ts`

### Basic Template

```typescript
import { apiService } from "../api.service";
import { serviceName } from "../service-name.service";
import type { ServiceTypes } from "../service-name.service";

jest.mock("../api.service");
jest.mock("@/lib/firebase-error-logger");

describe("ServiceName", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test groups here
});
```

## Test Organization

### 1. Group by Method

Tests are organized into `describe` blocks for each service method:

```typescript
describe("ServiceName", () => {
  describe("methodName", () => {
    it("handles primary use case", async () => {
      // Test implementation
    });

    it("handles edge case", async () => {
      // Test implementation
    });

    it("handles errors", async () => {
      // Test implementation
    });
  });
});
```

### 2. Common Test Groups

Every service test suite should include:

1. **CRUD Operations** (if applicable)

   - `create` - Creating new resources
   - `getById` / `getAll` - Retrieving resources
   - `update` - Updating resources
   - `delete` - Deleting resources

2. **Query Operations**

   - List with filters
   - Search functionality
   - Pagination
   - Sorting

3. **Business Logic**

   - Specific domain operations
   - Transformations
   - Validations

4. **Error Handling**
   - API errors
   - Not found errors
   - Validation errors
   - Network errors

## Mock Data Patterns

### 1. Define Mock Data at Top Level

```typescript
const mockResource: ResourceType = {
  id: "resource1",
  name: "Test Resource",
  // ... all required fields
  createdAt: new Date("2024-01-15"),
  updatedAt: new Date("2024-01-15"),
};
```

### 2. Use Complete Objects

Always include all required fields in mock objects to ensure type safety:

```typescript
// ✅ Good - Complete object
const mockAddress: AddressBE = {
  id: "addr1",
  userId: "user1",
  fullName: "John Doe",
  phoneNumber: "+919876543210",
  addressType: "home",
  addressLine1: "123 Main St",
  addressLine2: null,
  city: "Mumbai",
  state: "Maharashtra",
  postalCode: "400001",
  country: "IN",
  isDefault: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

// ❌ Bad - Incomplete object
const mockAddress = {
  addressLine1: "123 Main St",
  city: "Mumbai",
};
```

### 3. API Response Patterns

Mock API responses should match the actual API structure:

```typescript
// Paginated response
const mockResponse = {
  data: [mockResource1, mockResource2],
  count: 50,
  pagination: {
    page: 1,
    pageSize: 20,
    totalPages: 3,
  },
};

// Single resource response
const mockResponse = mockResource;

// Action response
const mockResponse = {
  success: true,
  message: "Action completed",
};
```

## API Service Mocking

### 1. Mock API Methods

Always mock the apiService methods used:

```typescript
(apiService.get as jest.Mock).mockResolvedValue(mockResponse);
(apiService.post as jest.Mock).mockResolvedValue(mockCreatedResource);
(apiService.patch as jest.Mock).mockResolvedValue(mockUpdatedResource);
(apiService.delete as jest.Mock).mockResolvedValue(undefined);
```

### 2. Verify API Calls

Always verify that the correct API endpoint is called with correct params:

```typescript
expect(apiService.get).toHaveBeenCalledWith("/resource/123");
expect(apiService.post).toHaveBeenCalledWith("/resource", createData);
expect(apiService.patch).toHaveBeenCalledWith("/resource/123", updateData);
expect(apiService.delete).toHaveBeenCalledWith("/resource/123");
```

### 3. Query String Testing

For endpoints with query parameters:

```typescript
// Test without params
await service.list();
expect(apiService.get).toHaveBeenCalledWith("/resources");

// Test with params
await service.list({ page: 2, limit: 20 });
expect(apiService.get).toHaveBeenCalledWith("/resources?page=2&limit=20");

// Test with multiple params
await service.list({ category: "tech", featured: true });
expect(apiService.get).toHaveBeenCalledWith(
  "/resources?category=tech&featured=true"
);
```

## Test Case Patterns

### 1. Success Cases

Test the happy path for each method:

```typescript
it("creates new resource successfully", async () => {
  const createData = {
    name: "New Resource",
    // ... required fields
  };

  (apiService.post as jest.Mock).mockResolvedValue(mockResource);

  const result = await service.create(createData);

  expect(apiService.post).toHaveBeenCalledWith("/resources", createData);
  expect(result.name).toBe("New Resource");
});
```

### 2. Edge Cases

Test boundary conditions and special cases:

```typescript
it("returns empty array when no resources found", async () => {
  const mockResponse = { data: [], count: 0, pagination: {} };
  (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

  const result = await service.list();

  expect(result.data).toEqual([]);
  expect(result.count).toBe(0);
});

it("handles same currency conversion (no conversion needed)", async () => {
  const result = await paymentService.convertToINR(100, "INR");

  expect(result).toBe(100);
  expect(apiService.post).not.toHaveBeenCalled();
});
```

### 3. Error Cases

Test error handling:

```typescript
it("handles not found errors", async () => {
  const error = new Error("Resource not found");
  (apiService.get as jest.Mock).mockRejectedValue(error);

  await expect(service.getById("invalid")).rejects.toThrow(
    "Resource not found"
  );
});

it("handles API errors gracefully", async () => {
  const error = new Error("Network error");
  (apiService.get as jest.Mock).mockRejectedValue(error);

  await expect(service.list()).rejects.toThrow("Network error");
});
```

### 4. Null/Empty Handling

Test how services handle null or empty responses:

```typescript
it("returns null for invalid lookup", async () => {
  (apiService.get as jest.Mock).mockRejectedValue(new Error("Not found"));

  const result = await addressService.lookupPincode("invalid");

  expect(result).toBeNull();
});

it("returns empty array on error", async () => {
  (apiService.post as jest.Mock).mockRejectedValue(new Error("API error"));

  const result = await addressService.autocompleteCities({
    query: "test",
    country: "IN",
  });

  expect(result).toEqual([]);
});
```

## Data Transformation Testing

### 1. Date Transformations

Test that dates are properly handled:

```typescript
it("transforms dates correctly", async () => {
  const mockData = {
    id: "1",
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-20T15:30:00Z",
  };

  (apiService.get as jest.Mock).mockResolvedValue(mockData);

  const result = await service.getById("1");

  expect(result.createdAt).toBeInstanceOf(Date);
  expect(result.updatedAt).toBeInstanceOf(Date);
});
```

### 2. Field Mappings

Test that field transformations work correctly:

```typescript
it("transforms BE to FE format", async () => {
  const mockBE = {
    id: "1",
    full_name: "John Doe",
    phone_number: "+1234567890",
  };

  (apiService.get as jest.Mock).mockResolvedValue(mockBE);

  const result = await service.getById("1");

  expect(result.fullName).toBe("John Doe");
  expect(result.phoneNumber).toBe("+1234567890");
});
```

## Pagination Testing

Test pagination parameters:

```typescript
describe("pagination", () => {
  it("uses default pagination", async () => {
    await service.list();

    expect(apiService.get).toHaveBeenCalledWith("/resources");
  });

  it("applies custom page and limit", async () => {
    await service.list({ page: 3, limit: 50 });

    expect(apiService.get).toHaveBeenCalledWith("/resources?page=3&limit=50");
  });

  it("returns pagination metadata", async () => {
    const mockResponse = {
      data: [mockResource],
      count: 100,
      pagination: { page: 2, pageSize: 20, totalPages: 5 },
    };

    (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

    const result = await service.list({ page: 2 });

    expect(result.pagination.page).toBe(2);
    expect(result.pagination.totalPages).toBe(5);
  });
});
```

## Filter Testing

Test various filter combinations:

```typescript
describe("filtering", () => {
  it("filters by single criteria", async () => {
    await service.list({ status: "active" });

    expect(apiService.get).toHaveBeenCalledWith("/resources?status=active");
  });

  it("filters by multiple criteria", async () => {
    await service.list({
      status: "active",
      category: "tech",
      featured: true,
    });

    expect(apiService.get).toHaveBeenCalledWith(
      "/resources?status=active&category=tech&featured=true"
    );
  });

  it("ignores undefined filters", async () => {
    await service.list({
      status: "active",
      category: undefined,
    });

    expect(apiService.get).toHaveBeenCalledWith("/resources?status=active");
  });
});
```

## Validation Testing

Test client-side validation:

```typescript
describe("validateAddress", () => {
  it("validates complete address", () => {
    const address = {
      addressLine1: "123 Main Street",
      city: "Mumbai",
      state: "Maharashtra",
      postalCode: "400001",
      country: "IN",
    };

    const result = addressService.validateAddress(address);

    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it("rejects incomplete address", () => {
    const address = {
      addressLine1: "123",
      // Missing required fields
    };

    const result = addressService.validateAddress(address);

    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it("returns multiple validation errors", () => {
    const address = {
      addressLine1: "123", // Too short
      // Missing all other fields
    };

    const result = addressService.validateAddress(address);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(
      "Address line 1 must be at least 5 characters"
    );
    expect(result.errors).toContain("City is required");
  });
});
```

## Common Patterns Summary

### ✅ DO

1. **Clear test names** - Describe what is being tested and expected outcome
2. **One assertion per concept** - Keep tests focused
3. **Complete mock data** - Include all required fields
4. **Verify API calls** - Check endpoints and parameters
5. **Test error cases** - Don't just test happy paths
6. **Test edge cases** - Empty arrays, null values, boundary conditions
7. **Use `beforeEach`** - Clear mocks between tests
8. **Group related tests** - Use `describe` blocks effectively

### ❌ DON'T

1. **Don't skip error handling tests** - Always test error scenarios
2. **Don't use incomplete mocks** - Type safety is important
3. **Don't forget to clear mocks** - State can leak between tests
4. **Don't test implementation details** - Test behavior, not internals
5. **Don't hardcode values** - Use constants where available
6. **Don't ignore edge cases** - Test boundary conditions
7. **Don't forget async/await** - Async tests must properly handle promises

## Test Coverage Goals

- **Services**: >90% coverage
- **Each method**: At least 3 tests (success, error, edge case)
- **Critical paths**: 100% coverage
- **Error handling**: All error paths tested

## Running Tests

```bash
# Run all service tests
npm test -- services

# Run specific service test
npm test -- analytics.service

# Run with coverage
npm test -- --coverage services

# Watch mode
npm test -- --watch analytics.service
```

## Example: Complete Service Test

See `src/services/__tests__/analytics.service.test.ts` for a complete example following all patterns.

## Transform Layer Testing Patterns

### CategoryTreeNode Mocking

When testing services that return transformed tree structures:

```typescript
// ❌ Wrong - missing category wrapper
const mockTree = [{ id: "cat1", name: "Electronics", children: [] }];

// ✅ Correct - proper CategoryTreeNodeBE structure
const mockTree = [
  {
    category: {
      id: "cat1",
      name: "Electronics",
      slug: "electronics",
      // ... all required CategoryBE fields
    },
    children: [],
    depth: 0,
  },
];
```

### Feature Flags in Transforms

Backend uses multiple field names for feature flags:

```typescript
// Transform checks: featured || is_featured || metadata?.featured
const mockCategory = {
  id: "cat1",
  name: "Electronics",
  featured: true, // Include this for featured items
  // OR
  is_featured: true,
  // OR
  metadata: { featured: true },
};
```

## Fetch API Mocking Patterns

For services using `fetch` instead of `apiService`:

```typescript
// Mock global fetch
global.fetch = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
});

// Success case
it("creates order successfully", async () => {
  (global.fetch as jest.Mock).mockResolvedValue({
    ok: true,
    json: async () => ({ id: "order123" }),
  });

  const result = await service.create(data);
  expect(result.id).toBe("order123");
});

// Error case
it("handles errors", async () => {
  (global.fetch as jest.Mock).mockResolvedValue({
    ok: false,
    json: async () => ({ error: "Validation failed" }),
  });

  await expect(service.create(data)).rejects.toThrow("Validation failed");
});
```

## Advanced Patterns (Session 4)

### 1. API Service Caching

**Pattern**: Response caching with TTL and stale-while-revalidate

```typescript
describe("Caching", () => {
  beforeEach(() => {
    apiService.clearCache();
    jest.clearAllMocks();
  });

  it("returns fresh cached response", async () => {
    // Configure cache
    apiService.configureCacheFor("/test", {
      ttl: 5000, // fresh for 5 seconds
      staleWhileRevalidate: 10000, // serve stale for 10s while revalidating
    });

    // First call - cache miss
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => ({ data: "first" }),
    });

    const first = await apiService.get("/test");
    expect(first.data).toBe("first");

    // Second call - cache hit (no fetch)
    const second = await apiService.get("/test");
    expect(second.data).toBe("first");
    expect(global.fetch).toHaveBeenCalledTimes(1); // Only called once
  });

  it("handles stale-while-revalidate", async () => {
    apiService.configureCacheFor("/test", {
      ttl: 100, // fresh for 100ms
      staleWhileRevalidate: 5000,
    });

    // First call
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => ({ data: "first" }),
    });

    await apiService.get("/test");

    // Wait for cache to become stale
    await new Promise((resolve) => setTimeout(resolve, 150));

    // Mock revalidation
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => ({ data: "fresh" }),
    });

    // Returns stale data immediately, revalidates in background
    const stale = await apiService.get("/test");
    expect(stale.data).toBe("first"); // Returns stale immediately
    expect(global.fetch).toHaveBeenCalledTimes(2); // Revalidation triggered
  });

  it("invalidates cache by pattern", async () => {
    apiService.configureCacheFor("/test", { ttl: 10000 });

    // Cache some data
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => ({ data: "cached" }),
    });

    await apiService.get("/test/item1");

    // Invalidate by pattern
    apiService.invalidateCache("/test");

    // Next call should be a cache miss
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => ({ data: "fresh" }),
    });

    await apiService.get("/test/item1");
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });
});
```

### 2. Request Deduplication

**Pattern**: Prevent duplicate simultaneous requests

```typescript
describe("Request Deduplication", () => {
  it("deduplicates identical simultaneous requests", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => ({ data: "result" }),
    });

    // Make 3 identical requests simultaneously
    const [result1, result2, result3] = await Promise.all([
      apiService.get("/test"),
      apiService.get("/test"),
      apiService.get("/test"),
    ]);

    // All return same result
    expect(result1).toEqual(result2);
    expect(result2).toEqual(result3);

    // But only one fetch was made
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it("does not deduplicate different requests", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => ({ data: "result" }),
    });

    await Promise.all([apiService.get("/test/1"), apiService.get("/test/2")]);

    expect(global.fetch).toHaveBeenCalledTimes(2);
  });
});
```

### 3. Exponential Backoff Retry

**Pattern**: Retry with exponential backoff on retryable errors

```typescript
describe("Retry Logic", () => {
  it("retries on retryable errors", async () => {
    // First 2 calls fail with 503, third succeeds
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: false,
        status: 503,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({ error: "Service Unavailable" }),
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 503,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({ error: "Service Unavailable" }),
      })
      .mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({ data: "success" }),
      });

    const result = await apiService.get("/test");
    expect(result.data).toBe("success");
    expect(global.fetch).toHaveBeenCalledTimes(3);
  });

  it("does not retry non-retryable errors", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 404,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => ({ error: "Not Found" }),
    });

    await expect(apiService.get("/test")).rejects.toThrow();
    expect(global.fetch).toHaveBeenCalledTimes(1); // No retry
  });

  it("configures retry settings", () => {
    apiService.configureRetry({
      maxRetries: 5,
      retryDelay: 2000,
      retryableStatuses: [408, 429, 500, 502, 503, 504],
    });

    // Configuration applied
    expect(apiService.getRetryConfig()).toMatchObject({
      maxRetries: 5,
      retryDelay: 2000,
    });
  });
});
```

### 4. Request Abortion

**Pattern**: Cancel in-flight requests

```typescript
describe("Request Abortion", () => {
  it("aborts individual request", async () => {
    (global.fetch as jest.Mock).mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve({ ok: true }), 1000);
        })
    );

    const promise = apiService.get("/test");
    apiService.abortRequest("GET:/api/test");

    await expect(promise).rejects.toThrow("Request aborted");
  });

  it("aborts requests matching pattern", async () => {
    (global.fetch as jest.Mock).mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve({ ok: true }), 1000);
        })
    );

    const promises = [
      apiService.get("/products/1"),
      apiService.get("/products/2"),
      apiService.get("/shops/1"),
    ];

    apiService.abortRequestsMatching("/products");

    await expect(promises[0]).rejects.toThrow();
    await expect(promises[1]).rejects.toThrow();
    // shops request not aborted
  });

  it("aborts all pending requests", async () => {
    (global.fetch as jest.Mock).mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve({ ok: true }), 1000);
        })
    );

    const promises = [apiService.get("/test/1"), apiService.get("/test/2")];

    apiService.abortAllRequests();

    await expect(promises[0]).rejects.toThrow();
    await expect(promises[1]).rejects.toThrow();
  });
});
```

### 5. Firebase Storage Upload

**Pattern**: 3-step upload workflow (request URL → upload → confirm)

```typescript
describe("uploadAsset", () => {
  it("completes 3-step upload successfully", async () => {
    const file = new File(["content"], "test.jpg", { type: "image/jpeg" });

    // Step 1: Request upload URL
    (apiService.post as jest.Mock).mockResolvedValueOnce({
      uploadUrl: "https://storage.googleapis.com/bucket/test.jpg?token=abc",
      metadata: {
        id: "asset123",
        name: "test.jpg",
        type: "image",
      },
    });

    // Step 2: Upload to storage
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
    });

    // Step 3: Confirm upload
    (apiService.post as jest.Mock).mockResolvedValueOnce({
      id: "asset123",
      url: "https://storage.googleapis.com/bucket/test.jpg",
      createdAt: "2024-12-01T00:00:00Z",
    });

    const result = await staticAssetsClient.uploadAsset(file, "category");

    expect(result.id).toBe("asset123");
    expect(apiService.post).toHaveBeenCalledWith(
      "/api/assets/request-upload-url",
      { fileName: "test.jpg", fileType: "image/jpeg", category: "category" }
    );
    expect(global.fetch).toHaveBeenCalledWith(
      "https://storage.googleapis.com/bucket/test.jpg?token=abc",
      { method: "PUT", body: file }
    );
    expect(apiService.post).toHaveBeenCalledWith("/api/assets/confirm-upload", {
      id: "asset123",
      name: "test.jpg",
      type: "image",
    });
  });

  it("handles storage upload failure", async () => {
    const file = new File(["content"], "test.jpg", { type: "image/jpeg" });

    (apiService.post as jest.Mock).mockResolvedValueOnce({
      uploadUrl: "https://storage.googleapis.com/...",
      metadata: { id: "asset123" },
    });

    // Storage upload fails
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      statusText: "Forbidden",
    });

    await expect(
      staticAssetsClient.uploadAsset(file, "category")
    ).rejects.toThrow("Upload to storage failed: Forbidden");
  });
});
```

### 6. Test Data Generation

**Pattern**: Generate realistic test data with TEST\_ prefix

```typescript
describe("generateTestProducts", () => {
  it("generates products with TEST_ prefix", async () => {
    (apiService.post as jest.Mock).mockResolvedValue({
      products: [
        { id: "1", name: "TEST_Product 1" },
        { id: "2", name: "TEST_Product 2" },
      ],
    });

    const result = await testDataService.generateTestProducts(2);

    expect(result.products).toHaveLength(2);
    expect(result.products[0].name).toMatch(/^TEST_/);
    expect(apiService.post).toHaveBeenCalledWith(
      "/api/test-data/products",
      expect.objectContaining({ count: 2 })
    );
  });

  it("validates product pricing logic", async () => {
    (apiService.post as jest.Mock).mockResolvedValue({
      products: [{ id: "1", price: 100, mrp: 120, discount: 16.67 }],
    });

    const result = await testDataService.generateTestProducts(1);

    const product = result.products[0];
    expect(product.price).toBeLessThanOrEqual(product.mrp);
    expect(product.discount).toBeGreaterThanOrEqual(0);
    expect(product.discount).toBeLessThan(100);
  });

  it("generates products with random attributes", async () => {
    (apiService.post as jest.Mock).mockResolvedValue({
      products: [
        {
          id: "1",
          name: "TEST_Product 1",
          category: "Electronics",
          tags: ["new", "featured"],
          stock: 50,
        },
        {
          id: "2",
          name: "TEST_Product 2",
          category: "Clothing",
          tags: ["sale"],
          stock: 20,
        },
      ],
    });

    const result = await testDataService.generateTestProducts(2);

    // Verify each product has required attributes
    result.products.forEach((product) => {
      expect(product).toHaveProperty("id");
      expect(product).toHaveProperty("name");
      expect(product).toHaveProperty("category");
      expect(product).toHaveProperty("tags");
      expect(product).toHaveProperty("stock");
      expect(product.stock).toBeGreaterThanOrEqual(0);
      expect(product.stock).toBeLessThanOrEqual(100);
    });
  });
});

describe("cleanupTestData", () => {
  it("removes all TEST_ prefixed data", async () => {
    (apiService.post as jest.Mock).mockResolvedValue({
      deleted: {
        products: 10,
        auctions: 5,
        orders: 3,
      },
    });

    const result = await testDataService.cleanupTestData();

    expect(result.deleted.products).toBe(10);
    expect(apiService.post).toHaveBeenCalledWith("/api/test-data/cleanup");
  });
});

describe("executeWorkflow", () => {
  it("orchestrates multi-step data generation", async () => {
    (apiService.post as jest.Mock).mockResolvedValue({
      success: true,
      generated: {
        products: 10,
        auctions: 5,
        orders: 3,
      },
    });

    const params = {
      products: 10,
      auctions: 5,
      orders: 3,
    };

    const result = await testDataService.executeWorkflow(params);

    expect(result.success).toBe(true);
    expect(result.generated.products).toBe(10);
    expect(apiService.post).toHaveBeenCalledWith(
      "/api/test-data/workflow",
      params
    );
  });
});
```

## Files Following These Patterns

### Session 1-3 Services (44 services)

- ✅ All previous services: analytics, notification, payment, address, blog, auth, categories, checkout, etc.
- ✅ hero-slides, payouts, riplimit, shipping, settings, homepage-settings
- ✅ seller-settings, shiprocket, support

### Session 4 Services (3 services)

- ✅ `api.service.test.ts` - 58 tests (HTTP, caching, retry, deduplication, abortion)
- ✅ `static-assets-client.service.test.ts` - 30+ tests (CRUD, upload, filters)
- ✅ `test-data.service.test.ts` - 30+ tests (generators, validation, workflow)

**Total**: 47/47 services tested (100% coverage), 1928 passing tests, 0 failures

---

_Last Updated: December 2024 - Session 4 Complete - Added API caching, Firebase Storage, test data generation patterns_
