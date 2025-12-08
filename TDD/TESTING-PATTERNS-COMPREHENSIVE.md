# Comprehensive Testing Patterns

Complete guide for testing all service types in this project. Consolidates patterns from 30+ service test files.

## Table of Contents

1. [Core Principles](#core-principles)
2. [Test Structure](#test-structure)
3. [API Service Mocking](#api-service-mocking)
4. [Firebase Mocking Patterns](#firebase-mocking-patterns)
5. [Browser API Mocking](#browser-api-mocking)
6. [Transform Function Mocking](#transform-function-mocking)
7. [Error Handling Patterns](#error-handling-patterns)
8. [Testing by Service Type](#testing-by-service-type)
9. [Common Pitfalls](#common-pitfalls)

---

## Core Principles

### Zero-Skip Policy

- **Never use `it.skip()` or `describe.skip()`**
- All tests must run in CI/CD
- If a test cannot run, fix the underlying issue

### Coverage Requirements

- Test all public methods
- Test success paths (happy path)
- Test error paths (API failures, validation errors)
- Test edge cases (empty data, null values, boundary conditions)

### Mock Everything External

- Mock `apiService` for HTTP calls
- Mock Firebase `adminDb` for database operations
- Mock browser APIs (`navigator`, `localStorage`, etc.)
- Mock utility functions from other modules

### Assertions

- Verify method calls: `expect(mockFn).toHaveBeenCalledWith(...)`
- Verify return values: `expect(result).toEqual(...)`
- Verify error handling: catch blocks, default returns
- Never assert implementation details (internal state)

---

## Test Structure

### File Location & Naming

```
src/services/__tests__/{service-name}.service.test.ts
```

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

  describe("methodName", () => {
    it("should handle success case", async () => {
      // Arrange: setup mocks
      (apiService.get as jest.Mock).mockResolvedValue({ data: mockData });

      // Act: call method
      const result = await serviceName.methodName();

      // Assert: verify behavior
      expect(apiService.get).toHaveBeenCalledWith("/endpoint");
      expect(result).toEqual(expectedResult);
    });

    it("should handle errors gracefully", async () => {
      (apiService.get as jest.Mock).mockRejectedValue(new Error("API error"));

      const result = await serviceName.methodName();

      expect(result).toEqual(defaultValue); // or check error handling
    });
  });
});
```

### Test Organization

- Group by method: one `describe` block per service method
- Within each method group:
  1. Success cases first
  2. Edge cases second
  3. Error cases last

---

## API Service Mocking

### Simple GET Request

```typescript
it("should fetch data", async () => {
  const mockData = { id: "1", name: "Test" };
  (apiService.get as jest.Mock).mockResolvedValue(mockData);

  const result = await service.getData("1");

  expect(apiService.get).toHaveBeenCalledWith("/api/data/1");
  expect(result).toEqual(mockData);
});
```

### POST with Body

```typescript
it("should create item", async () => {
  const mockInput = { name: "New Item" };
  const mockResponse = { id: "123", ...mockInput };
  (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

  const result = await service.create(mockInput);

  expect(apiService.post).toHaveBeenCalledWith("/api/items", mockInput);
  expect(result).toEqual(mockResponse);
});
```

### Query Parameters

```typescript
it("should fetch with filters", async () => {
  const mockData = { items: [], total: 0 };
  (apiService.get as jest.Mock).mockResolvedValue(mockData);

  await service.list({ page: 1, limit: 10, status: "active" });

  expect(apiService.get).toHaveBeenCalledWith(
    "/api/items?page=1&limit=10&status=active"
  );
});
```

### Handling Errors

```typescript
it("should handle API errors", async () => {
  (apiService.get as jest.Mock).mockRejectedValue(new Error("Network error"));

  const result = await service.getData("1");

  // Service returns default value on error
  expect(result).toEqual(null); // or [] or {} depending on method
});
```

---

## Firebase Mocking Patterns

### Basic Firebase Mock Setup

```typescript
import { adminDb } from "@/lib/firebase-admin";

jest.mock("@/lib/firebase-admin", () => ({
  adminDb: {
    collection: jest.fn(),
  },
}));
```

### Collection Query Chain

```typescript
it("should query Firebase collection", async () => {
  const mockData = [{ id: "1", name: "Test" }];
  const mockSnapshot = {
    empty: false,
    docs: mockData.map((item) => ({
      id: item.id,
      data: () => item,
    })),
  };

  const mockQuery = { get: jest.fn().mockResolvedValue(mockSnapshot) };
  const mockCollectionRef = {
    where: jest.fn().mockReturnValue(mockQuery),
  };
  (adminDb.collection as jest.Mock).mockReturnValue(mockCollectionRef);

  const result = await service.queryData({ status: "active" });

  expect(adminDb.collection).toHaveBeenCalledWith("items");
  expect(mockCollectionRef.where).toHaveBeenCalledWith(
    "status",
    "==",
    "active"
  );
  expect(result).toEqual(mockData);
});
```

### Chained Where Clauses

```typescript
it("should handle multiple where clauses", async () => {
  const mockSnapshot = { empty: true, docs: [] };

  const mockQuery2 = { get: jest.fn().mockResolvedValue(mockSnapshot) };
  const mockQuery1 = { where: jest.fn().mockReturnValue(mockQuery2) };
  const mockCollectionRef = { where: jest.fn().mockReturnValue(mockQuery1) };

  (adminDb.collection as jest.Mock).mockReturnValue(mockCollectionRef);

  await service.queryWithMultipleFilters("user1", "2024-01-01");

  // First where() on collection
  expect(mockCollectionRef.where).toHaveBeenCalledWith("userId", "==", "user1");
  // Second where() on returned query
  expect(mockQuery1.where).toHaveBeenCalledWith(
    "timestamp",
    ">=",
    expect.any(Object)
  );
});
```

### Document Operations

```typescript
it("should add document to collection", async () => {
  const mockDocRef = { id: "generated-id" };
  const mockCollectionRef = {
    add: jest.fn().mockResolvedValue(mockDocRef),
  };
  (adminDb.collection as jest.Mock).mockReturnValue(mockCollectionRef);

  const result = await service.addDocument({ name: "Test" });

  expect(mockCollectionRef.add).toHaveBeenCalledWith({
    name: "Test",
    timestamp: expect.any(Object),
  });
  expect(result).toEqual(mockDocRef.id);
});
```

### Handling Empty Results

```typescript
it("should return default when no documents found", async () => {
  const mockSnapshot = { empty: true, docs: [] };
  const mockQuery = { get: jest.fn().mockResolvedValue(mockSnapshot) };
  const mockCollectionRef = { where: jest.fn().mockReturnValue(mockQuery) };
  (adminDb.collection as jest.Mock).mockReturnValue(mockCollectionRef);

  const result = await service.queryData({ status: "active" });

  expect(result).toEqual([]); // Service returns empty array on no results
});
```

### Firebase Error Handling

```typescript
it("should handle Firebase errors gracefully", async () => {
  const mockCollectionRef = {
    where: jest.fn().mockImplementation(() => {
      throw new Error("Firebase error");
    }),
  };
  (adminDb.collection as jest.Mock).mockReturnValue(mockCollectionRef);

  const result = await service.queryData({ status: "active" });

  // Service logs error and returns default
  expect(result).toEqual([]);
});
```

---

## Browser API Mocking

### Navigator Geolocation

```typescript
describe("location service", () => {
  let mockNavigator: any;

  beforeEach(() => {
    mockNavigator = {
      geolocation: {
        getCurrentPosition: jest.fn(),
      },
    };
    global.navigator = mockNavigator as any;
  });

  it("should get current position", async () => {
    const mockPosition = {
      coords: { latitude: 28.6139, longitude: 77.209 },
    };
    mockNavigator.geolocation.getCurrentPosition.mockImplementation(
      (success: any) => success(mockPosition)
    );

    const result = await service.getCurrentPosition();

    expect(result).toEqual({
      latitude: 28.6139,
      longitude: 77.209,
    });
  });

  it("should handle geolocation errors", async () => {
    mockNavigator.geolocation.getCurrentPosition.mockImplementation(
      (_: any, error: any) => error({ code: 1, message: "Permission denied" })
    );

    const result = await service.getCurrentPosition();

    expect(result).toBeNull(); // or default coordinates
  });
});
```

### SSR-Safe Browser API Tests

```typescript
it("should handle SSR environment (no navigator)", async () => {
  const originalNavigator = global.navigator;
  delete (global as any).navigator;

  const result = await service.getCurrentPosition();

  expect(result).toBeNull(); // Service detects SSR and returns default
  global.navigator = originalNavigator;
});
```

### Local Storage (Simple)

```typescript
describe("storage service", () => {
  let mockLocalStorage: { [key: string]: string };

  beforeEach(() => {
    mockLocalStorage = {};
    Storage.prototype.getItem = jest.fn((key) => mockLocalStorage[key] || null);
    Storage.prototype.setItem = jest.fn((key, value) => {
      mockLocalStorage[key] = value;
    });
    Storage.prototype.removeItem = jest.fn((key) => {
      delete mockLocalStorage[key];
    });
  });

  it("should save to localStorage", () => {
    service.saveData("key", { value: "test" });

    expect(localStorage.setItem).toHaveBeenCalledWith(
      "key",
      JSON.stringify({ value: "test" })
    );
  });
});
```

### Local Storage (State Management Pattern)

**Critical Pattern**: localStorage mock state persists between tests. Must clear both mock state AND mock call history.

```typescript
describe("ComparisonService", () => {
  const localStorageMock = (() => {
    let store: Record<string, string> = {};

    return {
      getItem: jest.fn((key: string) => store[key] || null),
      setItem: jest.fn((key: string, value: string) => {
        store[key] = value;
      }),
      removeItem: jest.fn((key: string) => {
        delete store[key];
      }),
      clear: jest.fn(() => {
        store = {};
      }),
    };
  })();

  beforeAll(() => {
    Object.defineProperty(global, "localStorage", {
      value: localStorageMock,
      writable: true,
    });
  });

  beforeEach(() => {
    // Clear both state AND call history
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  describe("addToComparison", () => {
    it("should add product when below max", () => {
      // CRITICAL: Clear state before operations in tests that set initial data
      localStorageMock.clear();

      const result = comparisonService.addToComparison(mockProduct);

      expect(result).toBe(true);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "comparison_products",
        JSON.stringify([mockProduct])
      );
    });

    it("should not add duplicate product", () => {
      // Set initial state for this specific test
      localStorageMock.clear();
      localStorageMock.setItem(
        "comparison_products",
        JSON.stringify([mockProduct])
      );
      jest.clearAllMocks(); // Clear after setup so we only count new calls

      const result = comparisonService.addToComparison(mockProduct);

      expect(result).toBe(false);
      expect(localStorageMock.setItem).not.toHaveBeenCalled();
    });

    it("should return false in SSR environment", () => {
      const originalWindow = global.window;
      const originalLocalStorage = global.localStorage;
      delete (global as any).window;
      delete (global as any).localStorage;

      const result = comparisonService.addToComparison(mockProduct);

      expect(result).toBe(false);
      global.window = originalWindow as any;
      global.localStorage = originalLocalStorage as any;
    });
  });
});
```

**localStorage Testing Gotchas**:

1. State persists between tests - always clear in `beforeEach` or at test start
2. Mock call counts accumulate - use `jest.clearAllMocks()` after setup
3. SSR tests need to delete both `window` AND `localStorage`
4. Use `localStorageMock.clear()` for state, `jest.clearAllMocks()` for call history

### Global.fetch Mocking

```typescript
describe("GoogleFormsService", () => {
  beforeEach(() => {
    global.fetch = jest.fn();
    jest.clearAllMocks();
  });

  it("should fetch form responses from Google Forms API", async () => {
    const mockResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue({
        responses: [
          {
            responseId: "resp1",
            answers: { q1: { textAnswers: { answers: [{ value: "Test" }] } } },
          },
        ],
      }),
    };
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    const result = await googleFormsService.fetchFormResponses("form123");

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("forms.googleapis.com"),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: expect.stringContaining("Bearer"),
        }),
      })
    );
    expect(result).toHaveLength(1);
  });

  it("should handle fetch errors gracefully", async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error("Network error"));

    const result = await googleFormsService.fetchFormResponses("form123");

    expect(result).toEqual([]);
  });

  it("should handle non-OK responses", async () => {
    const mockResponse = {
      ok: false,
      status: 404,
      statusText: "Not Found",
    };
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    const result = await googleFormsService.fetchFormResponses("form123");

    expect(result).toEqual([]);
  });
});
```

---

## Transform Function Mocking

### Simple Transform Mock

```typescript
import { transformBEtoFE } from "@/lib/transforms/item.transform";

jest.mock("@/lib/transforms/item.transform");

it("should transform backend data to frontend format", async () => {
  const mockBEData = { id: "1", created_at: "2024-01-01" };
  const mockFEData = { id: "1", createdAt: "2024-01-01" };

  (transformBEtoFE as jest.Mock).mockReturnValue(mockFEData);
  (apiService.get as jest.Mock).mockResolvedValue(mockBEData);

  const result = await service.getItem("1");

  expect(transformBEtoFE).toHaveBeenCalledWith(mockBEData);
  expect(result).toEqual(mockFEData);
});
```

### Transform with Array Mapping

```typescript
it("should transform array of items", async () => {
  const mockBEData = [
    { id: "1", created_at: "2024-01-01" },
    { id: "2", created_at: "2024-01-02" },
  ];
  const mockFEData = [
    { id: "1", createdAt: "2024-01-01" },
    { id: "2", createdAt: "2024-01-02" },
  ];

  // Use mockImplementation for array mapping
  (transformBEtoFE as jest.Mock).mockImplementation((item) => ({
    id: item.id,
    createdAt: item.created_at,
  }));
  (apiService.get as jest.Mock).mockResolvedValue(mockBEData);

  const result = await service.listItems();

  expect(transformBEtoFE).toHaveBeenCalledTimes(2);
  expect(result).toEqual(mockFEData);
});
```

### Conditional Transform Logic

```typescript
it("should only transform when data exists", async () => {
  (transformBEtoFE as jest.Mock).mockReturnValue(null);
  (apiService.get as jest.Mock).mockResolvedValue(null);

  const result = await service.getItem("1");

  expect(transformBEtoFE).not.toHaveBeenCalled(); // Service checks null first
  expect(result).toBeNull();
});
```

---

## Error Handling Patterns

### Graceful Degradation

Services should handle errors and return sensible defaults:

```typescript
// ✅ GOOD: Returns default value
async getData(): Promise<Item[]> {
  try {
    const data = await apiService.get("/items");
    return data;
  } catch (error) {
    logError(error);
    return []; // Default empty array
  }
}

// ❌ BAD: Throws error to caller
async getData(): Promise<Item[]> {
  const data = await apiService.get("/items");
  return data; // Caller handles errors
}
```

### Testing Error Handling

```typescript
it("should return empty array on API error", async () => {
  (apiService.get as jest.Mock).mockRejectedValue(new Error("Network error"));

  const result = await service.listItems();

  expect(result).toEqual([]); // Service returns default
  // Optionally verify error was logged
});

it("should return null on item not found", async () => {
  (apiService.get as jest.Mock).mockResolvedValue(null);

  const result = await service.getItem("invalid-id");

  expect(result).toBeNull();
});
```

### Testing Validation Errors

```typescript
it("should return error message on validation failure", async () => {
  const result = await service.createItem({ name: "" }); // Invalid empty name

  expect(result.success).toBe(false);
  expect(result.error).toBe("Name is required");
});
```

---

## Testing by Service Type

### Type 1: API Wrapper Services

**Examples**: `auth.service.ts`, `products.service.ts`, `orders.service.ts`

**Pattern**: Simple wrappers around API calls

```typescript
describe("API Wrapper Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("get", () => {
    it("should fetch from API", async () => {
      const mockData = { id: "1", name: "Test" };
      (apiService.get as jest.Mock).mockResolvedValue(mockData);

      const result = await service.get("1");

      expect(apiService.get).toHaveBeenCalledWith("/api/items/1");
      expect(result).toEqual(mockData);
    });

    it("should handle API errors", async () => {
      (apiService.get as jest.Mock).mockRejectedValue(new Error("API error"));

      const result = await service.get("1");

      expect(result).toBeNull();
    });
  });

  describe("create", () => {
    it("should post to API", async () => {
      const mockInput = { name: "New" };
      const mockResponse = { id: "123", ...mockInput };
      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await service.create(mockInput);

      expect(apiService.post).toHaveBeenCalledWith("/api/items", mockInput);
      expect(result).toEqual(mockResponse);
    });
  });
});
```

### Type 2: Firebase Backend Services

**Examples**: `ip-tracker.service.ts`

**Pattern**: Direct Firebase admin SDK usage

```typescript
import { adminDb } from "@/lib/firebase-admin";

jest.mock("@/lib/firebase-admin", () => ({
  adminDb: {
    collection: jest.fn(),
  },
}));

describe("Firebase Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("logActivity", () => {
    it("should add document to Firebase", async () => {
      const mockDocRef = { id: "doc-123" };
      const mockCollectionRef = {
        add: jest.fn().mockResolvedValue(mockDocRef),
      };
      (adminDb.collection as jest.Mock).mockReturnValue(mockCollectionRef);

      await service.logActivity({ userId: "1", action: "login" });

      expect(adminDb.collection).toHaveBeenCalledWith("activities");
      expect(mockCollectionRef.add).toHaveBeenCalledWith({
        userId: "1",
        action: "login",
        timestamp: expect.any(Object),
      });
    });

    it("should handle Firebase errors gracefully", async () => {
      const mockCollectionRef = {
        add: jest.fn().mockRejectedValue(new Error("Firebase error")),
      };
      (adminDb.collection as jest.Mock).mockReturnValue(mockCollectionRef);

      const result = await service.logActivity({
        userId: "1",
        action: "login",
      });

      expect(result).toBeUndefined(); // Method logs error, doesn't throw
    });
  });

  describe("queryActivities", () => {
    it("should query with filters", async () => {
      const mockData = [{ id: "1", action: "login" }];
      const mockSnapshot = {
        empty: false,
        docs: mockData.map((item) => ({
          id: item.id,
          data: () => item,
        })),
      };

      const mockQuery = { get: jest.fn().mockResolvedValue(mockSnapshot) };
      const mockCollectionRef = {
        where: jest.fn().mockReturnValue(mockQuery),
      };
      (adminDb.collection as jest.Mock).mockReturnValue(mockCollectionRef);

      const result = await service.queryActivities({ userId: "1" });

      expect(mockCollectionRef.where).toHaveBeenCalledWith("userId", "==", "1");
      expect(result).toEqual(mockData);
    });
  });
});
```

### Type 3: Browser API Services

**Examples**: `location.service.ts`, `otp.service.ts`

**Pattern**: Use browser APIs with SSR safety

```typescript
describe("Browser API Service", () => {
  let mockNavigator: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigator = {
      geolocation: {
        getCurrentPosition: jest.fn(),
      },
    };
    global.navigator = mockNavigator as any;
  });

  describe("getCurrentPosition", () => {
    it("should get GPS coordinates", async () => {
      const mockPosition = {
        coords: { latitude: 28.6139, longitude: 77.209 },
      };
      mockNavigator.geolocation.getCurrentPosition.mockImplementation(
        (success: any) => success(mockPosition)
      );

      const result = await service.getCurrentPosition();

      expect(result).toEqual({
        latitude: 28.6139,
        longitude: 77.209,
      });
    });

    it("should handle geolocation denied", async () => {
      mockNavigator.geolocation.getCurrentPosition.mockImplementation(
        (_: any, error: any) => error({ code: 1, message: "Permission denied" })
      );

      const result = await service.getCurrentPosition();

      expect(result).toBeNull();
    });

    it("should handle SSR (no navigator)", async () => {
      delete (global as any).navigator;

      const result = await service.getCurrentPosition();

      expect(result).toBeNull();
    });
  });
});
```

### Type 4: Transform-Heavy Services

**Examples**: `messages.service.ts`, `returns.service.ts`

**Pattern**: Fetch from API, transform data

```typescript
import { transformBEtoFE } from "@/lib/transforms/message.transform";

jest.mock("@/lib/transforms/message.transform");

describe("Transform Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("list", () => {
    it("should fetch and transform list", async () => {
      const mockBEData = [
        { id: "1", created_at: "2024-01-01" },
        { id: "2", created_at: "2024-01-02" },
      ];
      const mockFEData = [
        { id: "1", createdAt: "2024-01-01" },
        { id: "2", createdAt: "2024-01-02" },
      ];

      (transformBEtoFE as jest.Mock).mockImplementation((item) => ({
        id: item.id,
        createdAt: item.created_at,
      }));
      (apiService.get as jest.Mock).mockResolvedValue(mockBEData);

      const result = await service.list();

      expect(apiService.get).toHaveBeenCalledWith("/api/items");
      expect(transformBEtoFE).toHaveBeenCalledTimes(2);
      expect(result).toEqual(mockFEData);
    });

    it("should return empty array on API error", async () => {
      (apiService.get as jest.Mock).mockRejectedValue(new Error("API error"));

      const result = await service.list();

      expect(transformBEtoFE).not.toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });

  describe("getById", () => {
    it("should fetch and transform single item", async () => {
      const mockBEData = { id: "1", created_at: "2024-01-01" };
      const mockFEData = { id: "1", createdAt: "2024-01-01" };

      (transformBEtoFE as jest.Mock).mockReturnValue(mockFEData);
      (apiService.get as jest.Mock).mockResolvedValue(mockBEData);

      const result = await service.getById("1");

      expect(transformBEtoFE).toHaveBeenCalledWith(mockBEData);
      expect(result).toEqual(mockFEData);
    });
  });
});
```

### Type 5: Multi-Gateway Services

**Examples**: `payment-gateway.service.ts`

**Pattern**: Route to different implementations based on config

```typescript
import { getPreferredGateway } from "@/config/payment-gateways.config";

jest.mock("@/config/payment-gateways.config");

describe("Multi-Gateway Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createOrder", () => {
    it("should use preferred gateway", async () => {
      (getPreferredGateway as jest.Mock).mockReturnValue("razorpay");
      (apiService.post as jest.Mock).mockResolvedValue({ orderId: "123" });

      const result = await service.createOrder({ amount: 100 });

      expect(getPreferredGateway).toHaveBeenCalled();
      expect(apiService.post).toHaveBeenCalledWith(
        "/api/payment/razorpay/create",
        { amount: 100 }
      );
      expect(result).toEqual({ orderId: "123" });
    });

    it("should use specified gateway", async () => {
      (apiService.post as jest.Mock).mockResolvedValue({ orderId: "456" });

      await service.createOrder({ amount: 100, gateway: "phonepe" });

      expect(getPreferredGateway).not.toHaveBeenCalled();
      expect(apiService.post).toHaveBeenCalledWith(
        "/api/payment/phonepe/create",
        { amount: 100 }
      );
    });
  });

  describe("validateGateway", () => {
    it("should validate gateway config", () => {
      const result = service.validateGateway("razorpay");

      expect(result).toBe(true);
    });

    it("should return false for invalid gateway", () => {
      const result = service.validateGateway("invalid-gateway");

      expect(result).toBe(false);
    });
  });
});
```

### Type 6: Stateful Client-Side Services

**Examples**: `comparison.service.ts`, `error-tracking.service.ts`

**Pattern**: Client-side services with in-memory or localStorage state

#### A. localStorage-Based Service (comparison.service.ts)

```typescript
describe("ComparisonService", () => {
  const localStorageMock = (() => {
    let store: Record<string, string> = {};

    return {
      getItem: jest.fn((key: string) => store[key] || null),
      setItem: jest.fn((key: string, value: string) => {
        store[key] = value;
      }),
      removeItem: jest.fn((key: string) => {
        delete store[key];
      }),
      clear: jest.fn(() => {
        store = {};
      }),
    };
  })();

  beforeAll(() => {
    Object.defineProperty(global, "localStorage", {
      value: localStorageMock,
      writable: true,
    });
  });

  beforeEach(() => {
    localStorageMock.clear(); // Clear state
    jest.clearAllMocks(); // Clear call history
  });

  it("should add product to comparison", () => {
    const product = { id: "1", name: "Product 1", price: 100 };

    const result = comparisonService.addToComparison(product);

    expect(result).toBe(true);
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      "comparison_products",
      JSON.stringify([product])
    );
  });

  it("should check max limit", () => {
    // Setup: Fill to max capacity
    localStorageMock.clear();
    const maxProducts = Array.from({ length: 4 }, (_, i) => ({
      id: `prod_${i}`,
      name: `Product ${i}`,
      price: 100,
    }));
    localStorageMock.setItem(
      "comparison_products",
      JSON.stringify(maxProducts)
    );
    jest.clearAllMocks(); // Clear call counts after setup

    const result = comparisonService.canAddMore();

    expect(result).toBe(false);
  });

  it("should handle SSR environment", () => {
    const originalWindow = global.window;
    const originalLocalStorage = global.localStorage;
    delete (global as any).window;
    delete (global as any).localStorage;

    const result = comparisonService.addToComparison(mockProduct);

    expect(result).toBe(false);

    // Restore
    global.window = originalWindow as any;
    global.localStorage = originalLocalStorage as any;
  });
});
```

**Key Points**:

- Use closure-based mock to maintain state
- Clear state (`localStorageMock.clear()`) AND call history (`jest.clearAllMocks()`)
- For SSR tests, delete both `window` and `localStorage`
- Use `clear()` before tests that need clean state

#### B. In-Memory Stateful Service (error-tracking.service.ts)

```typescript
import { ErrorLogger, ErrorSeverity } from "@/lib/error-logger";

jest.mock("@/lib/error-logger", () => ({
  ErrorLogger: {
    logError: jest.fn(),
  },
  ErrorSeverity: {
    LOW: "LOW",
    MEDIUM: "MEDIUM",
    HIGH: "HIGH",
    CRITICAL: "CRITICAL",
  },
}));

describe("ErrorTrackingService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    errorTrackingService.clear(); // Clear service internal state
  });

  describe("trackError", () => {
    it("should track new error", () => {
      const error = {
        message: "Test error",
        severity: ErrorSeverity.MEDIUM,
        context: { component: "TestComponent" },
        timestamp: new Date(),
      };

      errorTrackingService.trackError(error);

      const errors = errorTrackingService.getErrors();
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toBe("Test error");
      expect(errors[0].count).toBe(1);
    });

    it("should deduplicate same error from same component", () => {
      const error = {
        message: "Duplicate error",
        severity: ErrorSeverity.LOW,
        context: { component: "Component1" },
        timestamp: new Date(),
      };

      errorTrackingService.trackError(error);
      errorTrackingService.trackError(error);

      const errors = errorTrackingService.getErrors();
      expect(errors).toHaveLength(1);
      expect(errors[0].count).toBe(2);
    });

    it("should track affected components", () => {
      const error1 = {
        message: "Same message",
        severity: ErrorSeverity.LOW,
        context: { component: "Component1" },
        timestamp: new Date(),
      };
      const error2 = {
        message: "Same message",
        severity: ErrorSeverity.LOW,
        context: { component: "Component2" },
        timestamp: new Date(),
      };

      errorTrackingService.trackError(error1);
      errorTrackingService.trackError(error2);

      const errors = errorTrackingService.getErrors();
      expect(errors[0].affectedComponents).toContain("Component1");
      expect(errors[0].affectedComponents).toContain("Component2");
    });
  });

  describe("getStats", () => {
    it("should aggregate error statistics", () => {
      errorTrackingService.trackError({
        message: "Error 1",
        severity: ErrorSeverity.HIGH,
        context: { userId: "user1" },
        timestamp: new Date(),
      });
      errorTrackingService.trackError({
        message: "Error 2",
        severity: ErrorSeverity.MEDIUM,
        context: { userId: "user2" },
        timestamp: new Date(),
      });

      const stats = errorTrackingService.getStats();

      expect(stats.totalErrors).toBe(2);
      expect(stats.affectedUsers.size).toBe(2);
      expect(stats.errorsBySeverity[ErrorSeverity.HIGH]).toBe(1);
    });
  });

  describe("exportData", () => {
    it("should export as JSON", () => {
      errorTrackingService.trackError({
        message: "Export test",
        severity: ErrorSeverity.LOW,
        context: {},
        timestamp: new Date(),
      });

      const exported = errorTrackingService.exportData("json");

      expect(exported).toContain('"message":"Export test"');
    });

    it("should export as CSV", () => {
      errorTrackingService.trackError({
        message: "CSV test",
        severity: ErrorSeverity.LOW,
        context: { component: "TestComp" },
        timestamp: new Date(),
      });

      const exported = errorTrackingService.exportData("csv");

      expect(exported).toContain("Message,Count,Severity");
      expect(exported).toContain("CSV test,1,LOW");
    });
  });
});
```

**Key Points**:

- Call service's `clear()` method in `beforeEach` to reset state
- Test error deduplication logic (same message = increment count)
- Test aggregation/statistics methods
- Test affected components/users tracking
- Test export functionality (JSON, CSV)

### Type 7: Admin/Demo Data Services

**Examples**: `demo-data.service.ts`

**Pattern**: Multi-step data generation with API calls

```typescript
describe("DemoDataService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (apiService.post as jest.Mock).mockResolvedValue({ success: true });
    (apiService.get as jest.Mock).mockResolvedValue({ data: [] });
    (apiService.delete as jest.Mock).mockResolvedValue({ success: true });
  });

  describe("generateCategories", () => {
    it("should generate demo categories", async () => {
      await demoDataService.generateCategories({ scale: "small" });

      expect(apiService.post).toHaveBeenCalledWith(
        "/api/demo/categories",
        expect.objectContaining({ scale: "small" })
      );
    });

    it("should handle generation errors", async () => {
      (apiService.post as jest.Mock).mockRejectedValue(
        new Error("Generation failed")
      );

      await expect(
        demoDataService.generateCategories({ scale: "small" })
      ).rejects.toThrow("Generation failed");
    });
  });

  describe("generateAll", () => {
    it("should generate all demo data in order", async () => {
      await demoDataService.generateAll({ scale: "small" });

      // Verify order of API calls
      const calls = (apiService.post as jest.Mock).mock.calls;
      expect(calls[0][0]).toContain("/categories");
      expect(calls[1][0]).toContain("/users");
      expect(calls[2][0]).toContain("/shops");
      expect(calls[3][0]).toContain("/products");
      // ... etc
    });
  });

  describe("cleanupAll", () => {
    it("should delete all demo data", async () => {
      await demoDataService.cleanupAll();

      expect(apiService.delete).toHaveBeenCalledWith("/api/demo/all");
    });
  });

  describe("getStats", () => {
    it("should fetch demo data statistics", async () => {
      const mockStats = {
        categories: 10,
        users: 50,
        products: 100,
      };
      (apiService.get as jest.Mock).mockResolvedValue(mockStats);

      const stats = await demoDataService.getStats();

      expect(apiService.get).toHaveBeenCalledWith("/api/demo/stats");
      expect(stats).toEqual(mockStats);
    });
  });
});
```

**Key Points**:

- Mock all apiService methods (`post`, `get`, `delete`)
- Test each generation step independently
- Test multi-step generation order (generateAll)
- Test cleanup operations
- Test stats/summary retrieval
- All methods handle errors gracefully

### Type 8: External API Integration Services

**Examples**: `google-forms.service.ts`

**Pattern**: Integration with third-party APIs (Google Forms, etc.)

```typescript
describe("GoogleFormsService", () => {
  beforeEach(() => {
    global.fetch = jest.fn();
    jest.clearAllMocks();
  });

  describe("fetchFormResponses", () => {
    it("should fetch responses from Google Forms API", async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          responses: [
            {
              responseId: "resp1",
              answers: {
                q1: { textAnswers: { answers: [{ value: "John Doe" }] } },
              },
            },
          ],
        }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await googleFormsService.fetchFormResponses("form123");

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("forms.googleapis.com/v1/forms/form123"),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: expect.stringContaining("Bearer"),
          }),
        })
      );
      expect(result).toHaveLength(1);
    });

    it("should handle API errors gracefully", async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error("Network error"));

      const result = await googleFormsService.fetchFormResponses("form123");

      expect(result).toEqual([]);
    });

    it("should handle non-OK responses", async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        statusText: "Not Found",
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await googleFormsService.fetchFormResponses("form123");

      expect(result).toEqual([]);
    });
  });

  describe("parseEventRegistration", () => {
    it("should parse form response to registration data", () => {
      const formResponse = {
        responseId: "resp1",
        answers: {
          name_question_id: {
            textAnswers: { answers: [{ value: "John Doe" }] },
          },
          email_question_id: {
            textAnswers: { answers: [{ value: "john@example.com" }] },
          },
        },
      };

      const result = googleFormsService.parseEventRegistration(formResponse);

      expect(result).toEqual({
        name: "John Doe",
        email: "john@example.com",
      });
    });

    it("should handle missing fields", () => {
      const formResponse = {
        responseId: "resp1",
        answers: {},
      };

      const result = googleFormsService.parseEventRegistration(formResponse);

      expect(result.name).toBe("");
      expect(result.email).toBe("");
    });
  });

  describe("syncEventRegistrations", () => {
    it("should sync form responses to database", async () => {
      const mockResponses = [
        {
          responseId: "resp1",
          answers: {
            name: { textAnswers: { answers: [{ value: "John" }] } },
          },
        },
      ];
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ responses: mockResponses }),
      });
      (apiService.post as jest.Mock).mockResolvedValue({ success: true });

      await googleFormsService.syncEventRegistrations("form123", "event1");

      expect(apiService.post).toHaveBeenCalledWith(
        "/api/events/event1/registrations/sync",
        expect.objectContaining({
          registrations: expect.any(Array),
        })
      );
    });
  });
});
```

**Key Points**:

- Mock `global.fetch` for external API calls
- Test successful API responses
- Test error handling (network errors, non-OK responses)
- Test data parsing/transformation
- Test sync/integration logic with internal database
- Expect empty arrays/defaults on errors (graceful degradation)

---

## Common Pitfalls

### ❌ Don't: Use `.skip()` or `.only()`

```typescript
// ❌ BAD
it.skip("should work", () => {});
it.only("should work", () => {});

// ✅ GOOD: Fix the test or remove it
it("should work", () => {
  // Test implementation
});
```

### ❌ Don't: Mock with `mockReturnValue` for Arrays

```typescript
// ❌ BAD: Won't work for array mapping
(transform as jest.Mock).mockReturnValue(mockData[0]);

// ✅ GOOD: Use mockImplementation
(transform as jest.Mock).mockImplementation((item) => mockData[0]);
```

### ❌ Don't: Forget to Clear Mocks

```typescript
// ❌ BAD: Previous test mocks leak
describe("Service", () => {
  it("test 1", () => {
    (apiService.get as jest.Mock).mockResolvedValue({ data: "1" });
  });

  it("test 2", () => {
    // Still mocked from test 1!
  });
});

// ✅ GOOD: Clear between tests
describe("Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("test 1", () => {
    (apiService.get as jest.Mock).mockResolvedValue({ data: "1" });
  });

  it("test 2", () => {
    // Clean slate
  });
});
```

### ❌ Don't: Test Implementation Details

```typescript
// ❌ BAD: Testing internal state
it("should set internal flag", () => {
  service.doSomething();
  expect(service["_internalFlag"]).toBe(true); // Don't do this
});

// ✅ GOOD: Test observable behavior
it("should return correct result", () => {
  const result = service.doSomething();
  expect(result).toBe(expectedValue);
});
```

### ❌ Don't: Use Real API Calls

```typescript
// ❌ BAD: Making real HTTP requests
it("should fetch data", async () => {
  const result = await fetch("https://api.example.com/data");
  expect(result).toBeDefined();
});

// ✅ GOOD: Mock API service
it("should fetch data", async () => {
  (apiService.get as jest.Mock).mockResolvedValue({ data: "test" });
  const result = await service.getData();
  expect(result).toEqual({ data: "test" });
});
```

### ❌ Don't: Forget Edge Cases

```typescript
// ❌ BAD: Only testing happy path
it("should get user", async () => {
  (apiService.get as jest.Mock).mockResolvedValue({ id: "1" });
  const result = await service.getUser("1");
  expect(result).toEqual({ id: "1" });
});

// ✅ GOOD: Test edge cases
describe("getUser", () => {
  it("should get user when exists", async () => {
    (apiService.get as jest.Mock).mockResolvedValue({ id: "1" });
    const result = await service.getUser("1");
    expect(result).toEqual({ id: "1" });
  });

  it("should return null when user not found", async () => {
    (apiService.get as jest.Mock).mockResolvedValue(null);
    const result = await service.getUser("invalid");
    expect(result).toBeNull();
  });

  it("should handle API errors", async () => {
    (apiService.get as jest.Mock).mockRejectedValue(new Error("API error"));
    const result = await service.getUser("1");
    expect(result).toBeNull();
  });
});
```

---

## Test Examples by Service

### Example 1: IP Tracker Service (Firebase Backend)

```typescript
import { adminDb } from "@/lib/firebase-admin";
import { ipTrackerService } from "../ip-tracker.service";
import { logError } from "@/lib/firebase-error-logger";

jest.mock("@/lib/firebase-admin", () => ({
  adminDb: {
    collection: jest.fn(),
  },
}));
jest.mock("@/lib/firebase-error-logger");

describe("IpTrackerService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("logActivity", () => {
    it("should log activity with IP address", async () => {
      const mockDocRef = { id: "activity-123" };
      const mockCollectionRef = {
        add: jest.fn().mockResolvedValue(mockDocRef),
      };
      (adminDb.collection as jest.Mock).mockReturnValue(mockCollectionRef);

      await ipTrackerService.logActivity({
        userId: "user1",
        action: "login",
        ipAddress: "192.168.1.1",
      });

      expect(adminDb.collection).toHaveBeenCalledWith("user-activities");
      expect(mockCollectionRef.add).toHaveBeenCalledWith({
        userId: "user1",
        action: "login",
        ipAddress: "192.168.1.1",
        timestamp: expect.any(Object),
      });
    });

    it("should handle Firebase errors gracefully", async () => {
      const mockCollectionRef = {
        add: jest.fn().mockRejectedValue(new Error("Firebase error")),
      };
      (adminDb.collection as jest.Mock).mockReturnValue(mockCollectionRef);

      await ipTrackerService.logActivity({
        userId: "user1",
        action: "login",
        ipAddress: "192.168.1.1",
      });

      expect(logError).toHaveBeenCalled();
    });
  });

  describe("checkRateLimit", () => {
    it("should check rate limit by IP", async () => {
      const mockDocs = [{ id: "1" }, { id: "2" }];
      const mockSnapshot = {
        empty: false,
        size: 2,
        docs: mockDocs,
      };

      const mockQuery = { get: jest.fn().mockResolvedValue(mockSnapshot) };
      const mockCollectionRef = {
        where: jest.fn().mockReturnValue(mockQuery),
      };
      (adminDb.collection as jest.Mock).mockReturnValue(mockCollectionRef);

      const result = await ipTrackerService.checkRateLimit(
        "192.168.1.1",
        "login"
      );

      expect(mockCollectionRef.where).toHaveBeenCalledWith(
        "ipAddress",
        "==",
        "192.168.1.1"
      );
      expect(result).toEqual({ count: 2, limited: false });
    });
  });
});
```

### Example 2: Location Service (Browser API)

```typescript
import { apiService } from "../api.service";
import { locationService } from "../location.service";

jest.mock("../api.service");

describe("LocationService", () => {
  let mockNavigator: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigator = {
      geolocation: {
        getCurrentPosition: jest.fn(),
      },
    };
    global.navigator = mockNavigator as any;
  });

  describe("lookupPincode", () => {
    it("should lookup pincode via API", async () => {
      const mockData = {
        pincode: "110001",
        city: "New Delhi",
        state: "Delhi",
      };
      (apiService.get as jest.Mock).mockResolvedValue(mockData);

      const result = await locationService.lookupPincode("110001");

      expect(apiService.get).toHaveBeenCalledWith(
        "/api/location/pincode/110001"
      );
      expect(result).toEqual(mockData);
    });

    it("should return null for invalid pincode", async () => {
      const result = await locationService.lookupPincode("123"); // Too short

      expect(apiService.get).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe("getCurrentPosition", () => {
    it("should get GPS coordinates", async () => {
      const mockPosition = {
        coords: { latitude: 28.6139, longitude: 77.209 },
      };
      mockNavigator.geolocation.getCurrentPosition.mockImplementation(
        (success: any) => success(mockPosition)
      );

      const result = await locationService.getCurrentPosition();

      expect(result).toEqual({
        latitude: 28.6139,
        longitude: 77.209,
      });
    });

    it("should handle permission denied", async () => {
      mockNavigator.geolocation.getCurrentPosition.mockImplementation(
        (_: any, error: any) => error({ code: 1, message: "Permission denied" })
      );

      const result = await locationService.getCurrentPosition();

      expect(result).toBeNull();
    });

    it("should handle SSR environment", async () => {
      delete (global as any).navigator;

      const result = await locationService.getCurrentPosition();

      expect(result).toBeNull();
    });
  });
});
```

### Example 3: Messages Service (Transform-Heavy)

```typescript
import { apiService } from "../api.service";
import { messagesService } from "../messages.service";
import {
  transformConversation,
  transformMessage,
} from "@/lib/transforms/message.transform";

jest.mock("../api.service");
jest.mock("@/lib/transforms/message.transform");

describe("MessagesService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getConversations", () => {
    it("should fetch and transform conversations", async () => {
      const mockBEData = [
        { id: "1", created_at: "2024-01-01", participants: ["user1", "user2"] },
      ];
      const mockFEData = [
        { id: "1", createdAt: "2024-01-01", participants: ["user1", "user2"] },
      ];

      (transformConversation as jest.Mock).mockImplementation(
        (conv) => mockFEData[0]
      );
      (apiService.get as jest.Mock).mockResolvedValue(mockBEData);

      const result = await messagesService.getConversations();

      expect(apiService.get).toHaveBeenCalledWith(
        "/api/messages/conversations"
      );
      expect(transformConversation).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockFEData);
    });

    it("should handle empty conversations", async () => {
      (apiService.get as jest.Mock).mockResolvedValue([]);

      const result = await messagesService.getConversations();

      expect(transformConversation).not.toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it("should handle API errors", async () => {
      (apiService.get as jest.Mock).mockRejectedValue(new Error("API error"));

      const result = await messagesService.getConversations();

      expect(result).toEqual([]);
    });
  });

  describe("sendMessage", () => {
    it("should send message and return transformed result", async () => {
      const mockInput = {
        conversationId: "conv1",
        content: "Hello",
      };
      const mockBEResponse = {
        id: "msg1",
        conversation_id: "conv1",
        sender_id: "user1",
        content: "Hello",
        created_at: "2024-01-01",
      };
      const mockFEResponse = {
        id: "msg1",
        conversationId: "conv1",
        senderId: "user1",
        content: "Hello",
        createdAt: "2024-01-01",
        isFromMe: true,
      };

      (transformMessage as jest.Mock).mockReturnValue(mockFEResponse);
      (apiService.post as jest.Mock).mockResolvedValue(mockBEResponse);

      const result = await messagesService.sendMessage(mockInput);

      expect(apiService.post).toHaveBeenCalledWith(
        "/api/messages/send",
        mockInput
      );
      expect(transformMessage).toHaveBeenCalledWith(mockBEResponse, "user1");
      expect(result).toEqual(mockFEResponse);
    });
  });
});
```

---

## Coverage Goals

### ✅ 100% Coverage Achieved! (47/47 services)

**All Services Tested**:

1. address.service.ts ✅
2. analytics.service.ts ✅
3. api.service.ts ✅ (Session 4)
4. auctions.service.ts ✅
5. auth.service.ts ✅
6. blog.service.ts ✅
7. cart.service.ts ✅
8. categories.service.ts ✅
9. checkout.service.ts ✅
10. comparison.service.ts ✅
11. coupons.service.ts ✅
12. demo-data.service.ts ✅
13. email.service.ts ✅
14. error-tracking.service.ts ✅
15. events.service.ts ✅
16. favorites.service.ts ✅
17. google-forms.service.ts ✅
18. hero-slides.service.ts ✅ (Session 1)
19. homepage.service.ts ✅
20. homepage-settings.service.ts ✅ (Session 2)
21. ip-tracker.service.ts ✅
22. location.service.ts ✅
23. media.service.ts ✅
24. messages.service.ts ✅
25. notification.service.ts ✅
26. orders.service.ts ✅
27. otp.service.ts ✅
28. payment.service.ts ✅
29. payment-gateway.service.ts ✅
30. payouts.service.ts ✅ (Session 1)
31. products.service.ts ✅
32. returns.service.ts ✅
33. reviews.service.ts ✅
34. riplimit.service.ts ✅ (Session 1)
35. search.service.ts ✅
36. seller-settings.service.ts ✅ (Session 3)
37. settings.service.ts ✅ (Session 2)
38. shipping.service.ts ✅ (Session 2)
39. shiprocket.service.ts ✅ (Session 3)
40. shops.service.ts ✅
41. sms.service.ts ✅
42. static-assets-client.service.ts ✅ (Session 4)
43. support.service.ts ✅ (Session 3)
44. test-data.service.ts ✅ (Session 4)
45. users.service.ts ✅
46. viewing-history.service.ts ✅
47. whatsapp.service.ts ✅

**Total Tests**: 1928 passing tests  
**Test Suites**: 67 passing  
**Test Failures**: 0  
**Skipped Tests**: 17 (legitimate skips outside service layer)

---

## Summary

This document consolidates patterns from 35+ service test files totaling 1600+ tests. Key principles:

1. **Zero-skip policy**: All tests must run
2. **Mock external dependencies**: apiService, Firebase, browser APIs, localStorage, fetch
3. **Test all paths**: success, errors, edge cases
4. **Graceful error handling**: Return defaults, don't throw
5. **Service-specific patterns**:
   - API wrappers
   - Firebase backend
   - Browser APIs
   - Transforms
   - Multi-gateway
   - Stateful client-side (localStorage, in-memory)
   - Admin/demo data
   - External API integrations

**Patterns Added Throughout Sessions**:

- **Session 1-3**: Basic service testing, Firebase mocking, browser API mocking
- **Session 2024-12-09**: localStorage state management, in-memory stateful services, admin demo data, external API integration
- **Session 4 (Dec 2024)**: API response caching, request deduplication, exponential backoff retry, request abortion, Firebase Storage 3-step upload, test data generation

### Advanced Patterns (Session 4)

#### API Response Caching with Stale-While-Revalidate

```typescript
// Service implementation
apiService.configureCacheFor("/products", {
  ttl: 5000, // Fresh for 5 seconds
  staleWhileRevalidate: 10000, // Serve stale for 10s while revalidating
});

// Testing pattern
it("should handle stale-while-revalidate", async () => {
  apiService.configureCacheFor("/test", {
    ttl: 100,
    staleWhileRevalidate: 5000,
  });

  // First call - cache miss
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
  expect(stale.data).toBe("first"); // Stale data returned
  expect(global.fetch).toHaveBeenCalledTimes(2); // Revalidation triggered
});
```

#### Request Deduplication

```typescript
// Prevents duplicate simultaneous requests
it("should deduplicate identical simultaneous requests", async () => {
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

  expect(result1).toEqual(result2);
  expect(result2).toEqual(result3);
  expect(global.fetch).toHaveBeenCalledTimes(1); // Only one fetch
});
```

#### Request Abortion Patterns

```typescript
// Abort single request
apiService.abortRequest("GET:/api/products/1");

// Abort by pattern
apiService.abortRequestsMatching("/products");

// Abort all pending requests
apiService.abortAllRequests();

// Testing pattern
it("should abort requests matching pattern", async () => {
  (global.fetch as jest.Mock).mockImplementation(
    () =>
      new Promise((resolve) => setTimeout(() => resolve({ ok: true }), 1000))
  );

  const promises = [
    apiService.get("/products/1"),
    apiService.get("/products/2"),
    apiService.get("/shops/1"),
  ];

  apiService.abortRequestsMatching("/products");

  await expect(promises[0]).rejects.toThrow(); // Aborted
  await expect(promises[1]).rejects.toThrow(); // Aborted
  // shops request not aborted
});
```

Follow these patterns for consistent, maintainable, comprehensive test coverage.

**Coverage Status**: ✅ **47/47 services tested (100%)** - All services have comprehensive test coverage!
