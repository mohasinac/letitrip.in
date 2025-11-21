# TDD Implementation Plan: Category Hierarchy System

## 🎯 Feature: Category Hierarchy Management

**User Story**: As a seller/admin, I want to manage product categories in a hierarchical structure so that I can organize products logically and provide better navigation for buyers.

**Acceptance Criteria**:

- Categories can have parent-child relationships
- Prevent circular references
- Calculate product counts for categories and subcategories
- Support category queries with descendants
- Validate category operations

---

## 📋 Phase 1: Planning & Design

### ✅ What We Can Do:

**1. Define Requirements Clearly**

- User stories for category management
- Business rules for hierarchy constraints
- Performance requirements for large category trees

**2. Design API/Interface First**

```typescript
// Core functions to implement:
export async function getAllDescendantIds(
  categoryId: string
): Promise<string[]>;
export async function getAllAncestorIds(categoryId: string): Promise<string[]>;
export async function wouldCreateCycle(
  categoryId: string,
  newParentId: string
): Promise<boolean>;
export async function countCategoryProducts(
  categoryId: string
): Promise<number>;
export async function validateParentAssignments(
  categoryId: string,
  parentIds: string[]
): Promise<{ valid: boolean; errors: string[] }>;
export async function isCategoryLeaf(categoryId: string): Promise<boolean>;
```

**3. Identify Test Scenarios**

- Happy path: Normal category operations
- Edge cases: Empty categories, root categories, deep hierarchies
- Error conditions: Circular references, non-existent categories
- Performance: Large category trees (1000+ categories)

---

## 📋 Phase 2: Write Tests First (RED)

### ✅ What We Can Do:

**1. Write Acceptance Tests**

```typescript
describe("Category Hierarchy - Acceptance Tests", () => {
  it("should prevent circular category references", async () => {
    // Test that A -> B -> A is not allowed
  });

  it("should calculate correct product counts for category tree", async () => {
    // Test that parent counts = sum of children counts
  });

  it("should support category queries with all descendants", async () => {
    // Test finding all products in Electronics > Phones > iPhones
  });
});
```

**2. Write Unit Tests**

```typescript
describe("getAllDescendantIds", () => {
  it("should return all child and grandchild category IDs", async () => {
    // Test BFS traversal
  });

  it("should handle categories with no children", async () => {
    // Test leaf nodes
  });

  it("should prevent infinite loops in circular references", async () => {
    // Test cycle detection
  });
});
```

**3. Test Structure**

- Mock Firestore operations
- Test both success and failure scenarios
- Validate error messages and edge cases

---

## 📋 Phase 3: Implement Code (GREEN)

### ✅ What We Can Do:

**1. Write Minimal Code**

```typescript
// Start with simplest implementation
export async function getAllDescendantIds(
  categoryId: string
): Promise<string[]> {
  // Basic implementation - will expand as tests demand
  return [];
}

export async function wouldCreateCycle(
  categoryId: string,
  newParentId: string
): Promise<boolean> {
  // Start with basic self-reference check
  return categoryId === newParentId;
}
```

**2. Run Tests Frequently**

- Run tests after each function implementation
- Ensure new tests pass, existing tests still pass
- Add error handling as tests reveal needs

**3. Handle Edge Cases**

- Add proper Firestore queries
- Implement BFS/DFS algorithms
- Add validation and error handling

---

## 📋 Phase 4: Refactor (REFACTOR)

### ✅ What We Can Do:

**1. Improve Code Quality**

- Extract common Firestore operations
- Add proper TypeScript types
- Improve error messages and logging

**2. Performance Optimization**

- Add caching for frequently accessed data
- Optimize database queries
- Consider memory usage for large trees

**3. Maintain Test Coverage**

- Add integration tests with real Firestore
- Test performance with large datasets
- Ensure all edge cases covered

---

## 🚀 Alternative Feature: Batch Fetch System

**User Story**: As a developer, I want to batch fetch multiple documents efficiently so that I can avoid N+1 query problems and improve application performance.

### Phase 1-4 for Batch Fetch:

**Phase 1: Design**

```typescript
export async function batchFetchDocuments<T>(
  collectionName: string,
  ids: string[]
): Promise<Map<string, T>>;
export function mapToOrderedArray<T>(
  map: Map<string, T>,
  orderedIds: string[]
): (T | null)[];
export function chunkArray<T>(array: T[], size: number): T[][];
```

**Phase 2: Tests First**

```typescript
describe("batchFetchDocuments", () => {
  it("should fetch documents in batches of 10", async () => {
    // Test Firestore 'in' query limits
  });

  it("should handle empty ID arrays", async () => {
    // Test edge case
  });

  it("should remove duplicate IDs", async () => {
    // Test deduplication
  });
});
```

---

## 🎯 Which Feature Should We Start With?

**Recommended: Category Hierarchy System**

- More complex business logic
- Better demonstrates TDD principles
- Real-world hierarchical data management
- Multiple interacting functions

**Alternative: Batch Fetch System**

- Simpler utility functions
- Good for learning TDD basics
- Performance-focused
- Easier to implement incrementally

---

## 🛠️ TDD Workflow for Chosen Feature

1. **Pick One Function** (e.g., `wouldCreateCycle`)
2. **Write Failing Tests** for that function
3. **Implement Minimal Code** to pass tests
4. **Refactor** if needed
5. **Repeat** for next function
6. **Add Integration Tests** when functions work together

Would you like to start with **Category Hierarchy** or **Batch Fetch** system?</content>
<parameter name="filePath">d:\proj\justforview.in\TDD-PHASES.md
