/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiService } from "@/services/api.service";
import { categoriesService } from "@/services/categories.service";

// Mock dependencies
jest.mock("@/services/api.service");
jest.mock("@/lib/firebase-error-logger");

describe("CategoriesService", () => {
  const mockApiService = apiService as jest.Mocked<typeof apiService>;

  const mockCategoryBE = {
    id: "cat123",
    name: "Electronics",
    slug: "electronics",
    description: "Electronic devices and accessories",
    image: "https://example.com/electronics.jpg",
    icon: "📱",
    parentId: null,
    level: 0,
    sortOrder: 1,
    productCount: 150,
    isActive: true,
    isFeatured: false,
    metadata: {},
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("list", () => {
    it("should list categories with filters", async () => {
      const mockResponse = {
        data: [mockCategoryBE],
        count: 1,
        pagination: {
          page: 1,
          limit: 20,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        },
      };

      mockApiService.get.mockResolvedValue(mockResponse);

      const result = await categoriesService.list({
        isActive: true,
        page: 1,
      });

      expect(mockApiService.get).toHaveBeenCalled();
      expect(result.data).toHaveLength(1);
      expect(result.count).toBe(1);
    });

    it("should list categories without filters", async () => {
      const mockResponse = {
        data: [mockCategoryBE],
        count: 1,
        pagination: {
          page: 1,
          limit: 20,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        },
      };

      mockApiService.get.mockResolvedValue(mockResponse);

      const result = await categoriesService.list();

      expect(result.data).toHaveLength(1);
    });

    it("should handle empty category list", async () => {
      const mockResponse = {
        data: [],
        count: 0,
        pagination: {
          page: 1,
          limit: 20,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: false,
        },
      };

      mockApiService.get.mockResolvedValue(mockResponse);

      const result = await categoriesService.list();

      expect(result.data).toHaveLength(0);
      expect(result.count).toBe(0);
    });
  });

  describe("getById", () => {
    it("should get category by ID", async () => {
      mockApiService.get.mockResolvedValue({ data: mockCategoryBE });

      const result = await categoriesService.getById("cat123");

      expect(mockApiService.get).toHaveBeenCalledWith("/categories/cat123");
      expect(result.id).toBe("cat123");
    });

    it("should throw error if category not found", async () => {
      const error = new Error("Category not found");
      mockApiService.get.mockRejectedValue(error);

      await expect(categoriesService.getById("invalid")).rejects.toThrow(
        "Category not found"
      );
    });
  });

  describe("getBySlug", () => {
    it("should get category by slug", async () => {
      mockApiService.get.mockResolvedValue({
        success: true,
        data: mockCategoryBE,
      });

      const result = await categoriesService.getBySlug("electronics");

      expect(mockApiService.get).toHaveBeenCalledWith(
        "/categories/electronics"
      );
      expect(result.id).toBe("cat123");
    });

    it("should throw error if category not found", async () => {
      const error = new Error("Category not found");
      mockApiService.get.mockRejectedValue(error);

      await expect(categoriesService.getBySlug("invalid")).rejects.toThrow(
        "Category not found"
      );
    });
  });

  describe("getTree", () => {
    it("should get category tree", async () => {
      const mockTree = [
        {
          category: mockCategoryBE,
          children: [
            {
              category: { ...mockCategoryBE, id: "cat456", parentId: "cat123" },
              children: [],
            },
          ],
        },
      ];

      mockApiService.get.mockResolvedValue({
        success: true,
        data: mockTree,
      });

      const result = await categoriesService.getTree();

      expect(mockApiService.get).toHaveBeenCalledWith("/categories/tree");
      expect(result).toHaveLength(1);
    });

    it("should get category tree with parentId", async () => {
      mockApiService.get.mockResolvedValue({
        success: true,
        data: [
          {
            category: { ...mockCategoryBE, id: "cat456" },
            children: [],
          },
        ],
      });

      const result = await categoriesService.getTree("cat123");

      expect(mockApiService.get).toHaveBeenCalledWith(
        "/categories/tree?parentId=cat123"
      );
      expect(result).toHaveLength(1);
    });
  });

  describe("getLeaves", () => {
    it("should get leaf categories", async () => {
      mockApiService.get.mockResolvedValue({
        success: true,
        data: [mockCategoryBE, { ...mockCategoryBE, id: "cat456" }],
      });

      const result = await categoriesService.getLeaves();

      expect(mockApiService.get).toHaveBeenCalledWith("/categories/leaves");
      expect(result).toHaveLength(2);
    });

    it("should handle empty leaves", async () => {
      mockApiService.get.mockResolvedValue({ success: true, data: [] });

      const result = await categoriesService.getLeaves();

      expect(result).toHaveLength(0);
    });
  });

  describe("create", () => {
    it("should create category successfully", async () => {
      const formData = {
        name: "New Category",
        slug: "new-category",
        description: "A new category",
      };

      mockApiService.post.mockResolvedValue({
        success: true,
        data: mockCategoryBE,
      });

      const result = await categoriesService.create(formData as any);

      expect(mockApiService.post).toHaveBeenCalledWith(
        "/categories",
        expect.any(Object)
      );
      expect(result.id).toBe("cat123");
    });

    it("should throw error if validation fails", async () => {
      const error = new Error("Category name is required");
      mockApiService.post.mockRejectedValue(error);

      await expect(categoriesService.create({} as any)).rejects.toThrow(
        "Category name is required"
      );
    });
  });

  describe("update", () => {
    it("should update category successfully", async () => {
      const updates = {
        name: "Updated Category",
        description: "Updated description",
      };

      mockApiService.patch.mockResolvedValue({
        success: true,
        data: { ...mockCategoryBE, name: "Updated Category" },
      });

      const result = await categoriesService.update(
        "electronics",
        updates as any
      );

      expect(mockApiService.patch).toHaveBeenCalledWith(
        "/categories/electronics",
        expect.any(Object)
      );
      expect(result.id).toBe("cat123");
    });

    it("should throw error if not authorized", async () => {
      const error = new Error("Not authorized");
      mockApiService.patch.mockRejectedValue(error);

      await expect(
        categoriesService.update("electronics", {} as any)
      ).rejects.toThrow("Not authorized");
    });
  });

  describe("delete", () => {
    it("should delete category successfully", async () => {
      mockApiService.delete.mockResolvedValue({
        message: "Category deleted successfully",
      });

      const result = await categoriesService.delete("electronics");

      expect(mockApiService.delete).toHaveBeenCalledWith(
        "/categories/electronics"
      );
      expect(result.message).toBe("Category deleted successfully");
    });

    it("should throw error if category has products", async () => {
      const error = new Error("Cannot delete category with products");
      mockApiService.delete.mockRejectedValue(error);

      await expect(categoriesService.delete("electronics")).rejects.toThrow(
        "Cannot delete category with products"
      );
    });
  });

  describe("addParent", () => {
    it("should add parent to category", async () => {
      mockApiService.post.mockResolvedValue({
        success: true,
        message: "Parent added successfully",
      });

      const result = await categoriesService.addParent(
        "electronics",
        "parent1"
      );

      expect(mockApiService.post).toHaveBeenCalledWith(
        "/categories/electronics/add-parent",
        { parentId: "parent1" }
      );
      expect(result.message).toBe("Parent added successfully");
    });
  });

  describe("removeParent", () => {
    it("should remove parent from category", async () => {
      mockApiService.post.mockResolvedValue({
        success: true,
        message: "Parent removed successfully",
      });

      const result = await categoriesService.removeParent(
        "electronics",
        "parent1"
      );

      expect(mockApiService.post).toHaveBeenCalledWith(
        "/categories/electronics/remove-parent",
        { parentId: "parent1" }
      );
      expect(result.message).toBe("Parent removed successfully");
    });
  });

  describe("getParents", () => {
    it("should get category parents", async () => {
      mockApiService.get.mockResolvedValue({
        success: true,
        data: [{ ...mockCategoryBE, id: "parent1" }],
      });

      const result = await categoriesService.getParents("electronics");

      expect(mockApiService.get).toHaveBeenCalledWith(
        "/categories/electronics/parents"
      );
      expect(result).toHaveLength(1);
    });

    it("should handle empty parents", async () => {
      mockApiService.get.mockResolvedValue({ success: true, data: [] });

      const result = await categoriesService.getParents("electronics");

      expect(result).toHaveLength(0);
    });
  });

  describe("getChildren", () => {
    it("should get category children", async () => {
      mockApiService.get.mockResolvedValue({
        success: true,
        data: [{ ...mockCategoryBE, id: "child1", parentId: "cat123" }],
      });

      const result = await categoriesService.getChildren("electronics");

      expect(mockApiService.get).toHaveBeenCalledWith(
        "/categories/electronics/children"
      );
      expect(result).toHaveLength(1);
    });

    it("should handle empty children", async () => {
      mockApiService.get.mockResolvedValue({ success: true, data: [] });

      const result = await categoriesService.getChildren("electronics");

      expect(result).toHaveLength(0);
    });
  });

  describe("getFeatured", () => {
    it("should get featured categories", async () => {
      mockApiService.get.mockResolvedValue({
        success: true,
        data: [mockCategoryBE, { ...mockCategoryBE, id: "cat456" }],
      });

      const result = await categoriesService.getFeatured();

      expect(mockApiService.get).toHaveBeenCalledWith("/categories/featured");
      expect(result).toHaveLength(2);
    });

    it("should handle empty featured categories", async () => {
      mockApiService.get.mockResolvedValue({ success: true, data: [] });

      const result = await categoriesService.getFeatured();

      expect(result).toHaveLength(0);
    });
  });

  describe("getHomepage", () => {
    it("should get homepage categories", async () => {
      mockApiService.get.mockResolvedValue({
        success: true,
        data: [mockCategoryBE],
      });

      const result = await categoriesService.getHomepage();

      expect(mockApiService.get).toHaveBeenCalledWith("/categories/homepage");
      expect(result).toHaveLength(1);
    });
  });

  describe("search", () => {
    it("should search categories", async () => {
      mockApiService.get.mockResolvedValue({
        success: true,
        data: [mockCategoryBE],
      });

      const result = await categoriesService.search("electronics");

      expect(mockApiService.get).toHaveBeenCalledWith(
        "/categories/search?q=electronics"
      );
      expect(result).toHaveLength(1);
    });

    it("should handle empty search results", async () => {
      mockApiService.get.mockResolvedValue({ success: true, data: [] });

      const result = await categoriesService.search("nonexistent");

      expect(result).toHaveLength(0);
    });
  });

  describe("reorder", () => {
    it("should reorder categories", async () => {
      mockApiService.post.mockResolvedValue({
        message: "Categories reordered successfully",
      });

      const result = await categoriesService.reorder([
        { id: "cat1", sortOrder: 1 },
        { id: "cat2", sortOrder: 2 },
      ]);

      expect(mockApiService.post).toHaveBeenCalledWith("/categories/reorder", {
        orders: [
          { id: "cat1", sortOrder: 1 },
          { id: "cat2", sortOrder: 2 },
        ],
      });
      expect(result.message).toBe("Categories reordered successfully");
    });
  });

  describe("getCategoryProducts", () => {
    it("should get category products", async () => {
      const mockResponse = {
        data: [{ id: "prod1" }, { id: "prod2" }],
        count: 2,
        pagination: {
          page: 1,
          limit: 20,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        },
      };

      mockApiService.get.mockResolvedValue(mockResponse);

      const result = await categoriesService.getCategoryProducts(
        "electronics",
        {
          page: 1,
          limit: 20,
        }
      );

      expect(result.data).toHaveLength(2);
      expect(result.count).toBe(2);
    });

    it("should get category products with subcategories", async () => {
      const mockResponse = {
        data: [{ id: "prod1" }],
        count: 1,
        pagination: {
          page: 1,
          limit: 20,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        },
      };

      mockApiService.get.mockResolvedValue(mockResponse);

      const result = await categoriesService.getCategoryProducts(
        "electronics",
        {
          includeSubcategories: true,
        }
      );

      expect(result.data).toHaveLength(1);
    });
  });

  describe("getSubcategories", () => {
    it("should get subcategories", async () => {
      mockApiService.get.mockResolvedValue({
        data: [{ ...mockCategoryBE, id: "child1" }],
      });

      const result = await categoriesService.getSubcategories("electronics");

      expect(mockApiService.get).toHaveBeenCalledWith(
        "/categories/electronics/subcategories"
      );
      expect(result).toHaveLength(1);
    });

    it("should handle empty subcategories", async () => {
      mockApiService.get.mockResolvedValue({ data: [] });

      const result = await categoriesService.getSubcategories("electronics");

      expect(result).toHaveLength(0);
    });
  });

  describe("getSimilarCategories", () => {
    it("should get similar categories", async () => {
      mockApiService.get.mockResolvedValue({
        data: [{ ...mockCategoryBE, id: "cat456" }],
      });

      const result = await categoriesService.getSimilarCategories(
        "electronics"
      );

      expect(mockApiService.get).toHaveBeenCalledWith(
        "/categories/electronics/similar"
      );
      expect(result).toHaveLength(1);
    });

    it("should get similar categories with limit", async () => {
      mockApiService.get.mockResolvedValue({ data: [] });

      const result = await categoriesService.getSimilarCategories(
        "electronics",
        5
      );

      expect(mockApiService.get).toHaveBeenCalledWith(
        "/categories/electronics/similar?limit=5"
      );
      expect(result).toHaveLength(0);
    });
  });

  describe("getCategoryHierarchy", () => {
    it("should get category hierarchy", async () => {
      mockApiService.get.mockResolvedValue({
        data: [
          { ...mockCategoryBE, id: "parent" },
          { ...mockCategoryBE, id: "cat123" },
        ],
      });

      const result = await categoriesService.getCategoryHierarchy(
        "electronics"
      );

      expect(mockApiService.get).toHaveBeenCalledWith(
        "/categories/electronics/hierarchy"
      );
      expect(result).toHaveLength(2);
    });
  });

  describe("getBreadcrumb", () => {
    it("should get category breadcrumb with nested parents", async () => {
      // Need to include parent_id or parentIds in BE data for transform to pick it up
      // First call - get the target category (has parent_id)
      mockApiService.get.mockResolvedValueOnce({
        data: {
          ...mockCategoryBE,
          parent_id: "parent1",
          parentIds: ["parent1"],
        },
      });

      // Second call - get the parent category (no parent)
      mockApiService.get.mockResolvedValueOnce({
        data: {
          ...mockCategoryBE,
          id: "parent1",
          parent_id: null,
          parentIds: [],
        },
      });

      const result = await categoriesService.getBreadcrumb("cat123");

      expect(result).toHaveLength(2);
    });

    it("should handle error in breadcrumb", async () => {
      mockApiService.get.mockResolvedValueOnce({
        data: { ...mockCategoryBE, parentId: "parent1" },
      });
      mockApiService.get.mockRejectedValueOnce(new Error("Not found"));

      const result = await categoriesService.getBreadcrumb("cat123");

      expect(result).toHaveLength(1);
    });
  });

  describe("bulk operations", () => {
    it("should bulk activate categories", async () => {
      mockApiService.post.mockResolvedValue({ success: true });

      await categoriesService.bulkActivate(["cat1", "cat2"]);

      expect(mockApiService.post).toHaveBeenCalledWith("/categories/bulk", {
        action: "activate",
        ids: ["cat1", "cat2"],
      });
    });

    it("should bulk deactivate categories", async () => {
      mockApiService.post.mockResolvedValue({ success: true });

      await categoriesService.bulkDeactivate(["cat1", "cat2"]);

      expect(mockApiService.post).toHaveBeenCalledWith("/categories/bulk", {
        action: "deactivate",
        ids: ["cat1", "cat2"],
      });
    });

    it("should bulk feature categories", async () => {
      mockApiService.post.mockResolvedValue({ success: true });

      await categoriesService.bulkFeature(["cat1", "cat2"]);

      expect(mockApiService.post).toHaveBeenCalledWith("/categories/bulk", {
        action: "feature",
        ids: ["cat1", "cat2"],
      });
    });

    it("should bulk unfeature categories", async () => {
      mockApiService.post.mockResolvedValue({ success: true });

      await categoriesService.bulkUnfeature(["cat1", "cat2"]);

      expect(mockApiService.post).toHaveBeenCalledWith("/categories/bulk", {
        action: "unfeature",
        ids: ["cat1", "cat2"],
      });
    });

    it("should bulk delete categories", async () => {
      mockApiService.post.mockResolvedValue({ success: true });

      await categoriesService.bulkDelete(["cat1", "cat2"]);

      expect(mockApiService.post).toHaveBeenCalledWith("/categories/bulk", {
        action: "delete",
        ids: ["cat1", "cat2"],
      });
    });

    it("should bulk update categories", async () => {
      const updates = { isFeatured: true };
      mockApiService.post.mockResolvedValue({ success: true });

      await categoriesService.bulkUpdate(["cat1", "cat2"], updates as any);

      expect(mockApiService.post).toHaveBeenCalledWith("/categories/bulk", {
        action: "update",
        ids: ["cat1", "cat2"],
        updates,
      });
    });
  });

  describe("getByIds", () => {
    it("should batch fetch categories by IDs", async () => {
      mockApiService.post.mockResolvedValue({
        data: [mockCategoryBE, { ...mockCategoryBE, id: "cat456" }],
      });

      const result = await categoriesService.getByIds(["cat123", "cat456"]);

      expect(mockApiService.post).toHaveBeenCalledWith("/categories/batch", {
        ids: ["cat123", "cat456"],
      });
      expect(result).toHaveLength(2);
    });

    it("should return empty array for empty IDs", async () => {
      const result = await categoriesService.getByIds([]);

      expect(result).toHaveLength(0);
      expect(mockApiService.post).not.toHaveBeenCalled();
    });

    it("should handle batch fetch error gracefully", async () => {
      const error = new Error("API error");
      mockApiService.post.mockRejectedValue(error);

      const result = await categoriesService.getByIds(["cat123"]);

      expect(result).toHaveLength(0);
    });
  });
});
