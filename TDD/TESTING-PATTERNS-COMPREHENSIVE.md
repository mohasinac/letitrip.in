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

### Local Storage

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

### Current Coverage (30/48 services = 62.5%)

**Tested Services**:

1. address.service.ts ✅
2. analytics.service.ts ✅
3. auctions.service.ts ✅
4. auth.service.ts ✅
5. blog.service.ts ✅
6. cart.service.ts ✅
7. categories.service.ts ✅
8. checkout.service.ts ✅
9. coupons.service.ts ✅
10. email.service.ts ✅
11. favorites.service.ts ✅
12. homepage.service.ts ✅
13. ip-tracker.service.ts ✅ (NEW)
14. location.service.ts ✅ (NEW)
15. media.service.ts ✅
16. messages.service.ts ✅ (NEW)
17. notification.service.ts ✅
18. orders.service.ts ✅
19. otp.service.ts ✅ (NEW)
20. payment.service.ts ✅
21. payment-gateway.service.ts ✅ (NEW)
22. products.service.ts ✅
23. returns.service.ts ✅ (NEW)
24. reviews.service.ts ✅
25. search.service.ts ✅
26. shops.service.ts ✅
27. sms.service.ts ✅
28. users.service.ts ✅
29. viewing-history.service.ts ✅
30. whatsapp.service.ts ✅

**Remaining Services to Test** (18):

- [ ] bids.service.ts
- [ ] bundle-deals.service.ts
- [ ] cache.service.ts
- [ ] campaigns.service.ts
- [ ] community.service.ts
- [ ] comparison.service.ts
- [ ] dashboard.service.ts
- [ ] deals.service.ts
- [ ] delivery-tracking.service.ts
- [ ] faq.service.ts
- [ ] feedback.service.ts
- [ ] kyc.service.ts
- [ ] logistics.service.ts
- [ ] offers.service.ts
- [ ] payout.service.ts
- [ ] reports.service.ts
- [ ] seller-analytics.service.ts
- [ ] support.service.ts

---

## Summary

This document consolidates patterns from 30+ service test files totaling 1400+ tests. Key principles:

1. **Zero-skip policy**: All tests must run
2. **Mock external dependencies**: apiService, Firebase, browser APIs
3. **Test all paths**: success, errors, edge cases
4. **Graceful error handling**: Return defaults, don't throw
5. **Service-specific patterns**: API wrappers, Firebase, browser APIs, transforms, multi-gateway

Follow these patterns for consistent, maintainable, comprehensive test coverage.
