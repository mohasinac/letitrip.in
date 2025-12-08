/**
 * CATEGORY TRANSFORMATION TESTS
 *
 * Tests for category type transformations between Backend and Frontend
 */

import { Timestamp } from "firebase/firestore";
import {
  CategoryBE,
  CategoryBreadcrumbBE,
  CategoryTreeNodeBE,
} from "../../backend/category.types";
import { CategoryFormFE } from "../../frontend/category.types";
import { Status } from "../../shared/common.types";
import {
  toBECreateCategoryRequest,
  toFECategories,
  toFECategory,
  toFECategoryBreadcrumb,
  toFECategoryTreeNode,
} from "../category.transforms";

describe("Category Transformations", () => {
  const mockTimestamp = Timestamp.fromDate(new Date("2024-01-15T10:30:00Z"));

  const mockCategoryBE: CategoryBE = {
    id: "cat_123",
    name: "Electronics",
    slug: "electronics",
    description: "Electronic devices and accessories",
    image: "https://example.com/electronics.jpg",
    banner: "https://example.com/banner.jpg",
    icon: "electronics-icon.svg",
    parentIds: ["cat_root"],
    level: 1,
    order: 5,
    status: Status.PUBLISHED,
    productCount: 150,
    inStockCount: 120,
    outOfStockCount: 30,
    liveAuctionCount: 5,
    endedAuctionCount: 10,
    isLeaf: false,
    metadata: {
      featured: true,
      description: "Top electronics",
    },
    createdAt: mockTimestamp,
    updatedAt: mockTimestamp,
  };

  describe("toFECategory", () => {
    it("should transform basic category fields", () => {
      const result = toFECategory(mockCategoryBE);

      expect(result.id).toBe("cat_123");
      expect(result.name).toBe("Electronics");
      expect(result.slug).toBe("electronics");
      expect(result.description).toBe("Electronic devices and accessories");
      expect(result.image).toBe("https://example.com/electronics.jpg");
      expect(result.banner).toBe("https://example.com/banner.jpg");
      expect(result.icon).toBe("electronics-icon.svg");
    });

    it("should handle parent hierarchy", () => {
      const result = toFECategory(mockCategoryBE);

      expect(result.parentIds).toEqual(["cat_root"]);
      expect(result.parentId).toBe("cat_root");
      expect(result.level).toBe(1);
      expect(result.hasParents).toBe(true);
      expect(result.isRoot).toBe(false);
    });

    it("should handle root category", () => {
      const rootCategory = { ...mockCategoryBE, parentIds: [], level: 0 };
      const result = toFECategory(rootCategory);

      expect(result.isRoot).toBe(true);
      expect(result.hasParents).toBe(false);
      expect(result.parentId).toBeNull();
    });

    it("should calculate product stats", () => {
      const result = toFECategory(mockCategoryBE);

      expect(result.productCount).toBe(150);
      expect(result.inStockCount).toBe(120);
      expect(result.outOfStockCount).toBe(30);
      expect(result.hasProducts).toBe(true);
    });

    it("should handle category with no products", () => {
      const emptyCategory = { ...mockCategoryBE, productCount: 0 };
      const result = toFECategory(emptyCategory);

      expect(result.hasProducts).toBe(false);
    });

    it("should calculate auction stats", () => {
      const result = toFECategory(mockCategoryBE);

      expect(result.liveAuctionCount).toBe(5);
      expect(result.endedAuctionCount).toBe(10);
    });

    it("should set status and isActive flag", () => {
      const result = toFECategory(mockCategoryBE);

      expect(result.status).toBe(Status.PUBLISHED);
      expect(result.isActive).toBe(true);
    });

    it("should handle draft status", () => {
      const draftCategory = { ...mockCategoryBE, status: Status.DRAFT };
      const result = toFECategory(draftCategory);

      expect(result.status).toBe(Status.DRAFT);
      expect(result.isActive).toBe(false);
    });

    it("should set order and sortOrder", () => {
      const result = toFECategory(mockCategoryBE);

      expect(result.order).toBe(5);
      expect(result.sortOrder).toBe(5);
    });

    it("should set isLeaf flag", () => {
      const result = toFECategory(mockCategoryBE);

      expect(result.isLeaf).toBe(false);
    });

    it("should handle leaf category", () => {
      const leafCategory = { ...mockCategoryBE, isLeaf: true };
      const result = toFECategory(leafCategory);

      expect(result.isLeaf).toBe(true);
    });

    it("should generate URL path", () => {
      const result = toFECategory(mockCategoryBE);

      expect(result.urlPath).toBe("/categories/electronics");
    });

    it("should set display name", () => {
      const result = toFECategory(mockCategoryBE);

      expect(result.displayName).toBe("Electronics");
    });

    it("should handle metadata", () => {
      const result = toFECategory(mockCategoryBE);

      expect(result.metadata).toEqual({
        featured: true,
        description: "Top electronics",
      });
      expect(result.featured).toBe(true);
    });

    it("should handle missing metadata", () => {
      const categoryWithoutMetadata = {
        ...mockCategoryBE,
        metadata: undefined,
      };
      const result = toFECategory(categoryWithoutMetadata);

      expect(result.metadata).toEqual({});
      expect(result.featured).toBe(false);
    });

    it("should parse dates correctly", () => {
      const result = toFECategory(mockCategoryBE);

      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });

    it("should handle snake_case API format", () => {
      const snakeCaseData = {
        id: "cat_123",
        name: "Electronics",
        slug: "electronics",
        parent_ids: ["cat_root"],
        product_count: 150,
        in_stock_count: 120,
        out_of_stock_count: 30,
        live_auction_count: 5,
        ended_auction_count: 10,
        is_leaf: false,
        created_at: mockTimestamp,
        updated_at: mockTimestamp,
      };
      const result = toFECategory(snakeCaseData);

      expect(result.parentIds).toEqual(["cat_root"]);
      expect(result.productCount).toBe(150);
      expect(result.inStockCount).toBe(120);
      expect(result.outOfStockCount).toBe(30);
      expect(result.liveAuctionCount).toBe(5);
      expect(result.endedAuctionCount).toBe(10);
      expect(result.isLeaf).toBe(false);
    });

    it("should handle parent_id (singular) format", () => {
      const dataWithSingleParentId = {
        id: "cat_123",
        name: "Electronics",
        slug: "electronics",
        parent_id: "cat_root",
      };
      const result = toFECategory(dataWithSingleParentId);

      expect(result.parentIds).toEqual(["cat_root"]);
      expect(result.parentId).toBe("cat_root");
    });

    it("should handle hasChildren field", () => {
      const dataWithHasChildren = {
        ...mockCategoryBE,
        hasChildren: true,
        isLeaf: undefined,
      };
      const result = toFECategory(dataWithHasChildren);

      expect(result.isLeaf).toBe(false);
    });

    it("should handle has_children snake_case", () => {
      const dataWithHasChildren = {
        ...mockCategoryBE,
        has_children: true,
        isLeaf: undefined,
      };
      const result = toFECategory(dataWithHasChildren);

      expect(result.isLeaf).toBe(false);
    });

    it("should handle sortOrder field", () => {
      const dataWithSortOrder = {
        ...mockCategoryBE,
        sortOrder: 10,
        order: undefined,
      };
      const result = toFECategory(dataWithSortOrder);

      expect(result.order).toBe(10);
      expect(result.sortOrder).toBe(10);
    });

    it("should handle is_active snake_case", () => {
      const dataWithIsActive = {
        ...mockCategoryBE,
        is_active: true,
        status: undefined,
      };
      const result = toFECategory(dataWithIsActive);

      expect(result.isActive).toBe(true);
      expect(result.status).toBe(Status.PUBLISHED);
    });

    it("should handle is_featured in metadata", () => {
      const dataWithIsFeatured = {
        ...mockCategoryBE,
        is_featured: true,
        featured: undefined,
      };
      const result = toFECategory(dataWithIsFeatured);

      expect(result.featured).toBe(true);
    });

    it("should handle null optional fields", () => {
      const minimalCategory = {
        id: "cat_123",
        name: "Electronics",
        slug: "electronics",
        description: null,
        image: null,
        banner: null,
        icon: null,
      };
      const result = toFECategory(minimalCategory);

      expect(result.description).toBeNull();
      expect(result.image).toBeNull();
      expect(result.banner).toBeNull();
      expect(result.icon).toBeNull();
    });

    it("should handle special characters in name", () => {
      const categoryWithSpecialChars = {
        ...mockCategoryBE,
        name: "Electronics & Appliances",
        description: "Items with 'special' characters",
      };
      const result = toFECategory(categoryWithSpecialChars);

      expect(result.name).toContain("&");
      expect(result.description).toContain("'");
    });

    it("should handle Unicode characters", () => {
      const categoryWithUnicode = {
        ...mockCategoryBE,
        name: "इलेक्ट्रॉनिक्स",
        description: "इलेक्ट्रॉनिक उपकरण",
      };
      const result = toFECategory(categoryWithUnicode);

      expect(result.name).toBe("इलेक्ट्रॉनिक्स");
      expect(result.description).toContain("इलेक्ट्रॉनिक");
    });
  });

  describe("toFECategoryTreeNode", () => {
    const mockTreeNodeBE: CategoryTreeNodeBE = {
      category: mockCategoryBE,
      children: [
        {
          category: {
            ...mockCategoryBE,
            id: "cat_child1",
            name: "Smartphones",
            slug: "smartphones",
            parentIds: ["cat_123"],
            level: 2,
          },
          children: [],
          depth: 1,
        },
        {
          category: {
            ...mockCategoryBE,
            id: "cat_child2",
            name: "Laptops",
            slug: "laptops",
            parentIds: ["cat_123"],
            level: 2,
          },
          children: [],
          depth: 1,
        },
      ],
      depth: 0,
    };

    it("should transform tree node with children", () => {
      const result = toFECategoryTreeNode(mockTreeNodeBE);

      expect(result.category.id).toBe("cat_123");
      expect(result.depth).toBe(0);
      expect(result.hasChildren).toBe(true);
      expect(result.children).toHaveLength(2);
      expect(result.isExpanded).toBe(false);
    });

    it("should recursively transform children", () => {
      const result = toFECategoryTreeNode(mockTreeNodeBE);

      expect(result.children[0].category.id).toBe("cat_child1");
      expect(result.children[0].category.name).toBe("Smartphones");
      expect(result.children[1].category.id).toBe("cat_child2");
      expect(result.children[1].category.name).toBe("Laptops");
    });

    it("should handle leaf node", () => {
      const leafNode: CategoryTreeNodeBE = {
        category: mockCategoryBE,
        children: [],
        depth: 0,
      };
      const result = toFECategoryTreeNode(leafNode);

      expect(result.hasChildren).toBe(false);
      expect(result.children).toEqual([]);
    });

    it("should handle deep nesting", () => {
      const deepTreeNode: CategoryTreeNodeBE = {
        category: mockCategoryBE,
        children: [
          {
            category: {
              ...mockCategoryBE,
              id: "cat_child",
              level: 2,
            },
            children: [
              {
                category: {
                  ...mockCategoryBE,
                  id: "cat_grandchild",
                  level: 3,
                },
                children: [],
                depth: 2,
              },
            ],
            depth: 1,
          },
        ],
        depth: 0,
      };
      const result = toFECategoryTreeNode(deepTreeNode);

      expect(result.children[0].children[0].category.id).toBe("cat_grandchild");
      expect(result.children[0].children[0].depth).toBe(2);
    });
  });

  describe("toFECategoryBreadcrumb", () => {
    const mockBreadcrumbBE: CategoryBreadcrumbBE = {
      id: "cat_123",
      name: "Electronics",
      slug: "electronics",
      level: 1,
    };

    it("should transform breadcrumb", () => {
      const result = toFECategoryBreadcrumb(mockBreadcrumbBE);

      expect(result.id).toBe("cat_123");
      expect(result.name).toBe("Electronics");
      expect(result.slug).toBe("electronics");
      expect(result.level).toBe(1);
    });

    it("should generate URL path", () => {
      const result = toFECategoryBreadcrumb(mockBreadcrumbBE);

      expect(result.urlPath).toBe("/categories/electronics");
    });
  });

  describe("toBECreateCategoryRequest", () => {
    const mockFormData: CategoryFormFE = {
      name: "New Category",
      slug: "new-category",
      description: "A new category description",
      image: "https://example.com/image.jpg",
      icon: "icon.svg",
      parentIds: ["cat_root"],
      order: 10,
      metadata: {
        featured: true,
      },
    };

    it("should transform form data to BE request", () => {
      const result = toBECreateCategoryRequest(mockFormData);

      expect(result.name).toBe("New Category");
      expect(result.slug).toBe("new-category");
      expect(result.description).toBe("A new category description");
      expect(result.image).toBe("https://example.com/image.jpg");
      expect(result.icon).toBe("icon.svg");
      expect(result.parentIds).toEqual(["cat_root"]);
      expect(result.order).toBe(10);
      expect(result.metadata).toEqual({ featured: true });
    });

    it("should handle optional fields", () => {
      const minimalForm: CategoryFormFE = {
        name: "Minimal Category",
        slug: "minimal-category",
        parentIds: [],
        order: 0,
      };
      const result = toBECreateCategoryRequest(minimalForm);

      expect(result.name).toBe("Minimal Category");
      expect(result.slug).toBe("minimal-category");
      expect(result.description).toBeUndefined();
      expect(result.image).toBeUndefined();
      expect(result.icon).toBeUndefined();
    });

    it("should convert empty strings to undefined", () => {
      const formWithEmptyStrings: CategoryFormFE = {
        name: "Category",
        slug: "category",
        description: "",
        image: "",
        icon: "",
        parentIds: [],
        order: 0,
      };
      const result = toBECreateCategoryRequest(formWithEmptyStrings);

      expect(result.description).toBeUndefined();
      expect(result.image).toBeUndefined();
      expect(result.icon).toBeUndefined();
    });
  });

  describe("toFECategories", () => {
    it("should transform multiple categories", () => {
      const categories = [
        mockCategoryBE,
        { ...mockCategoryBE, id: "cat_456", name: "Fashion" },
      ];
      const result = toFECategories(categories);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("cat_123");
      expect(result[1].id).toBe("cat_456");
      expect(result[1].name).toBe("Fashion");
    });

    it("should handle empty array", () => {
      const result = toFECategories([]);

      expect(result).toEqual([]);
    });
  });

  describe("Edge cases", () => {
    it("should handle zero values correctly", () => {
      const categoryWithZeros = {
        ...mockCategoryBE,
        level: 0,
        order: 0,
        productCount: 0,
        inStockCount: 0,
        outOfStockCount: 0,
        liveAuctionCount: 0,
        endedAuctionCount: 0,
      };
      const result = toFECategory(categoryWithZeros);

      expect(result.level).toBe(0);
      expect(result.order).toBe(0);
      expect(result.productCount).toBe(0);
      expect(result.isRoot).toBe(true);
      expect(result.hasProducts).toBe(false);
    });

    it("should handle very large numbers", () => {
      const categoryWithLargeNumbers = {
        ...mockCategoryBE,
        productCount: 100000,
        inStockCount: 80000,
        outOfStockCount: 20000,
      };
      const result = toFECategory(categoryWithLargeNumbers);

      expect(result.productCount).toBe(100000);
      expect(result.inStockCount).toBe(80000);
      expect(result.outOfStockCount).toBe(20000);
    });

    it("should handle multiple parent IDs", () => {
      const categoryWithMultipleParents = {
        ...mockCategoryBE,
        parentIds: ["cat_1", "cat_2", "cat_3"],
      };
      const result = toFECategory(categoryWithMultipleParents);

      expect(result.parentIds).toEqual(["cat_1", "cat_2", "cat_3"]);
      expect(result.parentId).toBe("cat_1");
      expect(result.hasParents).toBe(true);
    });

    it("should handle missing dates", () => {
      const categoryWithoutDates = {
        ...mockCategoryBE,
        createdAt: undefined,
        updatedAt: undefined,
      };
      const result = toFECategory(categoryWithoutDates);

      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });
  });
});
