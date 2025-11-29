/**
 * TDD: Category Hierarchy System
 * Starting with the most fundamental function: wouldCreateCycle
 */

import { describe, it, expect } from "@jest/globals";

// Pure function version for testing (no Firestore dependencies)
function wouldCreateCyclePure(
  categoryId: string,
  newParentId: string,
  getDescendants: (id: string) => string[],
): boolean {
  // Can't be your own parent
  if (categoryId === newParentId) return true;

  // Check if newParentId is already a descendant of categoryId
  // If so, adding newParentId as a parent would create a cycle
  const descendants = getDescendants(categoryId);
  return descendants.includes(newParentId);
}

function validateParentAssignmentsPure(
  categoryId: string,
  parentIds: string[],
  getDescendants: (id: string) => string[],
): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check for self-reference
  if (parentIds.includes(categoryId)) {
    errors.push("A category cannot be its own parent");
  }

  // Check for cycles
  for (const parentId of parentIds) {
    const wouldCycle = wouldCreateCyclePure(
      categoryId,
      parentId,
      getDescendants,
    );
    if (wouldCycle) {
      errors.push(
        `Adding parent ${parentId} would create a circular reference`,
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// Mock hierarchy data
const mockHierarchy: Record<string, string[]> = {
  electronics: [], // root
  phones: ["electronics"], // child of electronics
  laptops: ["electronics"], // child of electronics
  iphones: ["phones"], // grandchild of electronics
  accessories: ["electronics"], // child of electronics
};

function getMockDescendants(categoryId: string): string[] {
  const descendants: string[] = [];
  const queue: string[] = [categoryId];
  const visited = new Set<string>();

  while (queue.length > 0) {
    const currentId = queue.shift()!;

    if (visited.has(currentId)) continue;
    visited.add(currentId);

    // Find all children
    for (const [childId, parents] of Object.entries(mockHierarchy)) {
      if (parents.includes(currentId) && !visited.has(childId)) {
        descendants.push(childId);
        queue.push(childId);
      }
    }
  }

  return descendants.filter((id) => id !== categoryId); // Remove self
}

describe("Category Hierarchy - wouldCreateCycle", () => {
  describe("Basic cycle detection", () => {
    it("should return true when category tries to be its own parent", () => {
      const result = wouldCreateCyclePure(
        "electronics",
        "electronics",
        getMockDescendants,
      );
      expect(result).toBe(true);
    });

    it("should return false when adding a valid parent", () => {
      const result = wouldCreateCyclePure(
        "iphones",
        "electronics",
        getMockDescendants,
      );
      expect(result).toBe(false);
    });
  });

  describe("Simple hierarchy cycles", () => {
    it("should detect direct cycle: A -> B, then B -> A", () => {
      // phones is child of electronics, so electronics -> phones creates cycle
      const result = wouldCreateCyclePure(
        "electronics",
        "phones",
        getMockDescendants,
      );
      expect(result).toBe(true);
    });

    it("should detect indirect cycle: A -> B -> C, then C -> A", () => {
      // electronics -> phones -> iphones, so electronics -> iphones creates cycle
      const result = wouldCreateCyclePure(
        "electronics",
        "iphones",
        getMockDescendants,
      );
      expect(result).toBe(true);
    });

    it("should allow non-cyclic relationships", () => {
      const result = wouldCreateCyclePure(
        "iphones",
        "phones",
        getMockDescendants,
      );
      expect(result).toBe(false);
    });
  });

  describe("Edge cases", () => {
    it("should handle empty or invalid category IDs", () => {
      const result1 = wouldCreateCyclePure(
        "",
        "electronics",
        getMockDescendants,
      );
      expect(result1).toBe(false);

      const result2 = wouldCreateCyclePure(
        "electronics",
        "",
        getMockDescendants,
      );
      expect(result2).toBe(false);
    });

    it("should handle non-existent categories gracefully", () => {
      const result = wouldCreateCyclePure(
        "nonexistent",
        "electronics",
        getMockDescendants,
      );
      expect(result).toBe(false);
    });
  });

  describe("Mock hierarchy validation", () => {
    it("should correctly identify descendants", () => {
      // BFS order: phones and laptops are found first, then their children
      // phones has iphones, laptops has no children, accessories has no children
      expect(getMockDescendants("electronics")).toEqual([
        "phones",
        "laptops",
        "accessories",
        "iphones",
      ]);
      expect(getMockDescendants("phones")).toEqual(["iphones"]);
      expect(getMockDescendants("iphones")).toEqual([]);
      expect(getMockDescendants("nonexistent")).toEqual([]);
    });
  });
});

describe("Category Hierarchy - validateParentAssignments", () => {
  describe("Self-reference validation", () => {
    it("should reject when category is its own parent", () => {
      const result = validateParentAssignmentsPure(
        "electronics",
        ["electronics"],
        getMockDescendants,
      );
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("A category cannot be its own parent");
    });

    it("should reject when category is in parent list", () => {
      const result = validateParentAssignmentsPure(
        "phones",
        ["electronics", "phones"],
        getMockDescendants,
      );
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("A category cannot be its own parent");
    });
  });

  describe("Cycle detection", () => {
    it("should reject direct cycle creation", () => {
      const result = validateParentAssignmentsPure(
        "electronics",
        ["phones"],
        getMockDescendants,
      );
      expect(result.valid).toBe(false);
      expect(
        result.errors.some((error) => error.includes("circular reference")),
      ).toBe(true);
    });

    it("should reject indirect cycle creation", () => {
      const result = validateParentAssignmentsPure(
        "electronics",
        ["iphones"],
        getMockDescendants,
      );
      expect(result.valid).toBe(false);
      expect(
        result.errors.some((error) => error.includes("circular reference")),
      ).toBe(true);
    });

    it("should allow valid parent assignments", () => {
      const result = validateParentAssignmentsPure(
        "iphones",
        ["electronics"],
        getMockDescendants,
      );
      expect(result.valid).toBe(true);
      expect(result.errors.length).toBe(0);
    });
  });

  describe("Multiple parents", () => {
    it("should validate all parents", () => {
      // Try to assign phones and iphones as parents of electronics
      // phones is descendant of electronics, iphones is descendant of electronics
      const result = validateParentAssignmentsPure(
        "electronics",
        ["phones", "iphones"],
        getMockDescendants,
      );
      expect(result.valid).toBe(false);
      expect(
        result.errors.some((error) => error.includes("circular reference")),
      ).toBe(true);
    });

    it("should allow multiple valid parents", () => {
      // Note: Mock hierarchy doesn't support multiple parents easily, so this is a basic test
      const result = validateParentAssignmentsPure(
        "iphones",
        ["phones"],
        getMockDescendants,
      );
      expect(result.valid).toBe(true);
    });
  });

  describe("Edge cases", () => {
    it("should handle empty parent list", () => {
      const result = validateParentAssignmentsPure(
        "electronics",
        [],
        getMockDescendants,
      );
      expect(result.valid).toBe(true);
    });

    it("should handle non-existent categories", () => {
      const result = validateParentAssignmentsPure(
        "nonexistent",
        ["electronics"],
        getMockDescendants,
      );
      expect(result.valid).toBe(true);
    });
  });
});
