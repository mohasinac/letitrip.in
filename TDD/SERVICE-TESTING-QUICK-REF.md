# Service Testing Quick Reference Guide

## 🚀 Quick Start

Copy-paste templates for common testing scenarios in service layer testing.

---

## 📋 Basic Test File Setup

```typescript
import { serviceName } from "../service-name.service";
import { apiService } from "../api.service";

jest.mock("../api.service", () => ({
  apiService: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

describe("ServiceName", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("methodName", () => {
    it("should succeed when valid data provided", async () => {
      // Arrange
      const mockData = { id: "123", name: "Test" };
      (apiService.get as jest.Mock).mockResolvedValue({ data: mockData });

      // Act
      const result = await serviceName.methodName("123");

      // Assert
      expect(result).toEqual(mockData);
      expect(apiService.get).toHaveBeenCalledWith("/endpoint/123");
    });

    it("should handle errors gracefully", async () => {
      (apiService.get as jest.Mock).mockRejectedValue(new Error("API Error"));

      const result = await serviceName.methodName("123");

      expect(result).toBeNull();
    });
  });
});
```

---

## 🎯 Common Mock Setups

### API Service Mock

```typescript
jest.mock("../api.service", () => ({
  apiService: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));
```

### Global Fetch Mock

```typescript
beforeEach(() => {
  global.fetch = jest.fn();
});

(global.fetch as jest.Mock).mockResolvedValue({
  ok: true,
  json: async () => ({ url: "https://example.com/file.jpg" }),
});
```

### LocalStorage Mock

```typescript
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, "localStorage", { value: mockLocalStorage });
```

### Transform Function Mocks

```typescript
jest.mock("@/lib/transforms/entity.transform", () => ({
  transformEntityToBackend: jest.fn((data) => ({ ...data, backend: true })),
  transformEntityToFrontend: jest.fn((data) => ({ ...data, frontend: true })),
}));
```

---

## 📝 Test Patterns

### GET Request

```typescript
it("should fetch entity by ID", async () => {
  (apiService.get as jest.Mock).mockResolvedValue({ data: { id: "123" } });

  const result = await service.getById("123");

  expect(apiService.get).toHaveBeenCalledWith("/entities/123");
  expect(result).toEqual({ id: "123" });
});
```

### POST Request

```typescript
it("should create entity", async () => {
  const createData = { name: "Test" };
  (apiService.post as jest.Mock).mockResolvedValue({
    data: { id: "123", ...createData },
  });

  const result = await service.create(createData);

  expect(apiService.post).toHaveBeenCalledWith("/entities", createData);
  expect(result).toEqual({ id: "123", name: "Test" });
});
```

### PUT Request

```typescript
it("should update entity", async () => {
  const updateData = { name: "Updated" };
  (apiService.put as jest.Mock).mockResolvedValue({
    data: { id: "123", ...updateData },
  });

  const result = await service.update("123", updateData);

  expect(apiService.put).toHaveBeenCalledWith("/entities/123", updateData);
  expect(result).toEqual({ id: "123", name: "Updated" });
});
```

### DELETE Request

```typescript
it("should delete entity", async () => {
  (apiService.delete as jest.Mock).mockResolvedValue({ success: true });

  const result = await service.delete("123");

  expect(apiService.delete).toHaveBeenCalledWith("/entities/123");
  expect(result).toBe(true);
});
```

### Error Handling

```typescript
it("should handle errors gracefully", async () => {
  (apiService.get as jest.Mock).mockRejectedValue(new Error("API Error"));

  const result = await service.method();

  expect(result).toEqual([]); // or null, or { error: "..." }
});
```

### Query Parameters

```typescript
it("should include query parameters", async () => {
  await service.getAll({ page: 2, limit: 20, status: "active" });

  expect(apiService.get).toHaveBeenCalledWith(
    "/entities?page=2&limit=20&status=active"
  );
});
```

---

## ✅ Validation Testing

### Required Fields

```typescript
it("should reject missing required fields", async () => {
  const result = await service.create({ name: "" });

  expect(result.success).toBe(false);
  expect(result.message).toContain("required");
});
```

### Format Validation

```typescript
it("should validate format", () => {
  expect(service.validatePhone("+919876543210")).toBe(true);
  expect(service.validatePhone("invalid")).toBe(false);
});
```

### Range Validation

```typescript
it("should validate range", () => {
  expect(service.validatePrice(-10)).toBe(false);
  expect(service.validatePrice(100)).toBe(true);
});
```

---

## 🔄 Transform Layer Testing

```typescript
describe("transform layer", () => {
  it("should transform data before sending to backend", async () => {
    const frontendData = { isActive: true };
    const backendData = { is_active: true };

    (transformEntityToBackend as jest.Mock).mockReturnValue(backendData);

    await service.create(frontendData);

    expect(transformEntityToBackend).toHaveBeenCalledWith(frontendData);
    expect(apiService.post).toHaveBeenCalledWith("/entities", backendData);
  });

  it("should transform data from backend", async () => {
    const backendData = { created_at: "2025-01-01" };
    const frontendData = { createdAt: "2025-01-01" };

    (apiService.get as jest.Mock).mockResolvedValue({ data: backendData });
    (transformEntityToFrontend as jest.Mock).mockReturnValue(frontendData);

    const result = await service.getById("123");

    expect(transformEntityToFrontend).toHaveBeenCalledWith(backendData);
    expect(result).toEqual(frontendData);
  });
});
```

---

## 📦 Bulk Operations

### Bulk Create

```typescript
it("should create multiple entities", async () => {
  const entities = [{ name: "Entity 1" }, { name: "Entity 2" }];
  (apiService.post as jest.Mock).mockResolvedValue({ data: entities });

  const result = await service.bulkCreate(entities);

  expect(apiService.post).toHaveBeenCalledWith("/entities/bulk", entities);
});
```

### Bulk Update

```typescript
it("should update multiple entities", async () => {
  const updates = [{ id: "1", status: "active" }];
  (apiService.put as jest.Mock).mockResolvedValue({ success: true });

  await service.bulkUpdate(updates);

  expect(apiService.put).toHaveBeenCalledWith("/entities/bulk", updates);
});
```

### Bulk Delete

```typescript
it("should delete multiple entities", async () => {
  const ids = ["1", "2", "3"];
  (apiService.delete as jest.Mock).mockResolvedValue({ success: true });

  await service.bulkDelete(ids);

  expect(apiService.delete).toHaveBeenCalledWith("/entities/bulk", { ids });
});
```

---

## 📂 File Upload Testing

```typescript
it("should upload file", async () => {
  const file = new File(["content"], "test.jpg", { type: "image/jpeg" });
  (global.fetch as jest.Mock).mockResolvedValue({
    ok: true,
    json: async () => ({ url: "https://example.com/test.jpg" }),
  });

  const result = await service.uploadFile(file);

  expect(global.fetch).toHaveBeenCalledWith(
    expect.any(String),
    expect.objectContaining({
      method: "POST",
      body: expect.any(FormData),
    })
  );
});
```

---

## 💾 Storage Testing

### LocalStorage Save

```typescript
it("should save to localStorage", () => {
  service.save("key", { data: "value" });

  expect(localStorage.setItem).toHaveBeenCalledWith(
    "key",
    JSON.stringify({ data: "value" })
  );
});
```

### LocalStorage Get

```typescript
it("should retrieve from localStorage", () => {
  localStorage.getItem = jest.fn(() => JSON.stringify({ data: "value" }));

  const result = service.get("key");

  expect(result).toEqual({ data: "value" });
});
```

### Storage Error Handling

```typescript
it("should handle quota errors", () => {
  localStorage.setItem = jest.fn(() => {
    throw new Error("QuotaExceededError");
  });

  const result = service.save("key", "value");

  expect(result).toBe(false);
});
```

---

## 🔍 Pagination Testing

```typescript
it("should handle pagination", async () => {
  const page1 = { data: [1, 2], hasMore: true };
  const page2 = { data: [3, 4], hasMore: false };

  (apiService.get as jest.Mock)
    .mockResolvedValueOnce({ data: page1 })
    .mockResolvedValueOnce({ data: page2 });

  const result1 = await service.getAll({ page: 1 });
  const result2 = await service.getAll({ page: 2 });

  expect(result1.hasMore).toBe(true);
  expect(result2.hasMore).toBe(false);
});
```

---

## 🎨 Parameterized Tests

```typescript
const testCases = [
  { input: "+919876543210", expected: true },
  { input: "invalid", expected: false },
];

testCases.forEach(({ input, expected }) => {
  it(`should validate ${input} as ${expected}`, () => {
    expect(service.validate(input)).toBe(expected);
  });
});
```

---

## ⚠️ Error Logging

```typescript
import { logError } from "@/lib/firebase-error-logger";

jest.mock("@/lib/firebase-error-logger");

it("should log errors", async () => {
  const error = new Error("Test error");
  (apiService.get as jest.Mock).mockRejectedValue(error);

  await service.method();

  expect(logError).toHaveBeenCalledWith(
    error,
    expect.objectContaining({
      context: "ServiceName.method",
    })
  );
});
```

---

## 🚫 Common Mistakes to Avoid

### ❌ Don't skip tests

```typescript
// BAD
test.skip("incomplete test", () => {});
```

### ✅ Complete all tests

```typescript
// GOOD
test("complete test", () => {
  expect(result).toBeDefined();
});
```

### ❌ Don't forget to clear mocks

```typescript
// BAD - No beforeEach
describe("service", () => {
  it("test 1", () => {
    (apiService.get as jest.Mock).mockResolvedValue({ data: "test1" });
  });
});
```

### ✅ Clear mocks between tests

```typescript
// GOOD
describe("service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
});
```

---

## 📊 Test Checklist

### Every Test File Should Have:

- [ ] Imports and mocks at the top
- [ ] `beforeEach` to clear mocks
- [ ] Tests for success paths
- [ ] Tests for error paths
- [ ] Tests for edge cases
- [ ] API call verification
- [ ] No skipped tests
- [ ] Meaningful test names

### Every Test Should:

- [ ] Follow Arrange-Act-Assert pattern
- [ ] Mock all dependencies
- [ ] Verify expected behavior
- [ ] Handle async operations
- [ ] Test both success and failure

---

## 📚 Reference Examples

### Simple Service

See: `viewing-history.service.test.ts` (localStorage, basic CRUD)

### API Service

See: `coupons.service.test.ts` (REST API, transforms)

### Complex Service

See: `auctions.service.test.ts` (25 describe blocks, 80+ tests)

### External API

See: `sms.service.test.ts`, `whatsapp.service.test.ts`

### Aggregation

See: `homepage.service.test.ts` (multiple API calls)

### Upload Service

See: `media.service.test.ts` (file validation, uploads)

---

## 🔗 Related Documentation

- **Full Documentation:** `TDD/SERVICE-TESTING-COVERAGE-UPDATE-DEC-2025.md`
- **Testing Patterns:** `TDD/SERVICE-TESTING-PATTERNS.md`
- **Jest Docs:** https://jestjs.io/docs/getting-started

---

**Last Updated:** December 2025  
**Quick Ref Version:** 1.0
