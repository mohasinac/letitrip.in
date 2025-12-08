import type { CategoryBE } from "@/types/backend/category.types";
import type { CategoryFormFE } from "@/types/frontend/category.types";
import { apiService } from "../api.service";
import { categoriesService } from "../categories.service";

// Mock dependencies
jest.mock("../api.service");
jest.mock("@/lib/firebase-error-logger");

describe("CategoriesService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("list", () => {
    it("lists categories with pagination", async () => {
      const mockResponse = {
        data: [
          {
            id: "cat1",
            name: "Electronics",
            slug: "electronics",
            description: "Electronic items",
            image: "image.jpg",
            isActive: true,
            isFeatured: false,
            sortOrder: 1,
            productCount: 100,
            createdAt: "2024-01-01",
            updatedAt: "2024-01-01",
          },
        ],
        count: 1,
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await categoriesService.list();

      expect(apiService.get).toHaveBeenCalledWith("/categories");
      expect(result.data).toHaveLength(1);
      expect(result.count).toBe(1);
    });

    it("lists categories with filters", async () => {
      const mockResponse = {
        data: [],
        count: 0,
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      await categoriesService.list({ page: 2, limit: 10, isActive: true });

      expect(apiService.get).toHaveBeenCalledWith(
        "/categories?page=2&limit=10&isActive=true"
      );
    });

    it("handles list errors", async () => {
      (apiService.get as jest.Mock).mockRejectedValue(
        new Error("Failed to fetch")
      );

      await expect(categoriesService.list()).rejects.toThrow("Failed to fetch");
    });
  });

  describe("getById", () => {
    it("gets category by ID", async () => {
      const mockCategory: CategoryBE = {
        id: "cat1",
        name: "Electronics",
        slug: "electronics",
        description: "Electronic items",
        image: "image.jpg",
        isActive: true,
        isFeatured: false,
        sortOrder: 1,
        productCount: 100,
        createdAt: "2024-01-01",
        updatedAt: "2024-01-01",
      };

      (apiService.get as jest.Mock).mockResolvedValue({ data: mockCategory });

      const result = await categoriesService.getById("cat1");

      expect(apiService.get).toHaveBeenCalledWith("/categories/cat1");
      expect(result.id).toBe("cat1");
      expect(result.name).toBe("Electronics");
    });

    it("handles getById errors", async () => {
      (apiService.get as jest.Mock).mockRejectedValue(
        new Error("Category not found")
      );

      await expect(categoriesService.getById("invalid")).rejects.toThrow(
        "Category not found"
      );
    });
  });

  describe("getBySlug", () => {
    it("gets category by slug", async () => {
      const mockCategory: CategoryBE = {
        id: "cat1",
        name: "Electronics",
        slug: "electronics",
        description: "Electronic items",
        image: "image.jpg",
        isActive: true,
        isFeatured: false,
        sortOrder: 1,
        productCount: 100,
        createdAt: "2024-01-01",
        updatedAt: "2024-01-01",
      };

      (apiService.get as jest.Mock).mockResolvedValue({
        success: true,
        data: mockCategory,
      });

      const result = await categoriesService.getBySlug("electronics");

      expect(apiService.get).toHaveBeenCalledWith("/categories/electronics");
      expect(result.slug).toBe("electronics");
    });

    it("handles getBySlug errors", async () => {
      (apiService.get as jest.Mock).mockRejectedValue(
        new Error("Category not found")
      );

      await expect(categoriesService.getBySlug("nonexistent")).rejects.toThrow(
        "Category not found"
      );
    });
  });

  describe("getTree", () => {
    it("gets category tree without parentId", async () => {
      const mockTree = [
        {
          category: {
            id: "cat1",
            name: "Electronics",
            slug: "electronics",
            description: "Electronics",
            image: "image.jpg",
            isActive: true,
            isFeatured: false,
            sortOrder: 1,
            productCount: 100,
            createdAt: "2024-01-01",
            updatedAt: "2024-01-01",
          },
          children: [],
          depth: 0,
        },
      ];

      (apiService.get as jest.Mock).mockResolvedValue({
        success: true,
        data: mockTree,
      });

      const result = await categoriesService.getTree();

      expect(apiService.get).toHaveBeenCalledWith("/categories/tree");
      expect(result).toHaveLength(1);
    });

    it("gets category tree with parentId", async () => {
      const mockTree = [
        {
          category: {
            id: "cat2",
            name: "Laptops",
            slug: "laptops",
            description: "Laptops",
            image: "image.jpg",
            isActive: true,
            isFeatured: false,
            sortOrder: 1,
            productCount: 50,
            createdAt: "2024-01-01",
            updatedAt: "2024-01-01",
          },
          children: [],
          depth: 1,
        },
      ];

      (apiService.get as jest.Mock).mockResolvedValue({
        success: true,
        data: mockTree,
      });

      await categoriesService.getTree("cat1");

      expect(apiService.get).toHaveBeenCalledWith(
        "/categories/tree?parentId=cat1"
      );
    });

    it("handles empty tree response", async () => {
      (apiService.get as jest.Mock).mockResolvedValue({
        success: true,
        data: [],
      });

      const result = await categoriesService.getTree();

      expect(result).toEqual([]);
    });
  });

  describe("getLeaves", () => {
    it("gets leaf categories", async () => {
      const mockLeaves: CategoryBE[] = [
        {
          id: "cat3",
          name: "Gaming Laptops",
          slug: "gaming-laptops",
          description: "Gaming laptops",
          image: "image.jpg",
          isActive: true,
          isFeatured: false,
          sortOrder: 1,
          productCount: 50,
          createdAt: "2024-01-01",
          updatedAt: "2024-01-01",
        },
      ];

      (apiService.get as jest.Mock).mockResolvedValue({
        success: true,
        data: mockLeaves,
      });

      const result = await categoriesService.getLeaves();

      expect(apiService.get).toHaveBeenCalledWith("/categories/leaves");
      expect(result).toHaveLength(1);
    });

    it("handles empty leaves response", async () => {
      (apiService.get as jest.Mock).mockResolvedValue({
        success: true,
        data: [],
      });

      const result = await categoriesService.getLeaves();

      expect(result).toEqual([]);
    });
  });

  describe("create", () => {
    it("creates category successfully", async () => {
      const formData: CategoryFormFE = {
        name: "New Category",
        slug: "new-category",
        description: "A new category",
        image: "image.jpg",
        isActive: true,
        isFeatured: false,
        sortOrder: 1,
      };

      const mockResponse: CategoryBE = {
        id: "new-cat",
        ...formData,
        productCount: 0,
        createdAt: "2024-01-01",
        updatedAt: "2024-01-01",
      };

      (apiService.post as jest.Mock).mockResolvedValue({
        success: true,
        data: mockResponse,
      });

      const result = await categoriesService.create(formData);

      expect(apiService.post).toHaveBeenCalledWith(
        "/categories",
        expect.any(Object)
      );
      expect(result.name).toBe("New Category");
    });

    it("handles create errors", async () => {
      const formData: CategoryFormFE = {
        name: "",
        slug: "",
        description: "",
        isActive: true,
        isFeatured: false,
        sortOrder: 1,
      };

      (apiService.post as jest.Mock).mockRejectedValue(
        new Error("Validation failed")
      );

      await expect(categoriesService.create(formData)).rejects.toThrow(
        "Validation failed"
      );
    });
  });

  describe("update", () => {
    it("updates category successfully", async () => {
      const updates: Partial<CategoryFormFE> = {
        name: "Updated Category",
        description: "Updated description",
      };

      const mockResponse: CategoryBE = {
        id: "cat1",
        name: "Updated Category",
        slug: "electronics",
        description: "Updated description",
        image: "image.jpg",
        isActive: true,
        isFeatured: false,
        sortOrder: 1,
        productCount: 100,
        createdAt: "2024-01-01",
        updatedAt: "2024-12-08",
      };

      (apiService.patch as jest.Mock).mockResolvedValue({
        success: true,
        data: mockResponse,
      });

      const result = await categoriesService.update(
        "electronics",
        updates as CategoryFormFE
      );

      expect(apiService.patch).toHaveBeenCalledWith(
        "/categories/electronics",
        expect.any(Object)
      );
      expect(result.name).toBe("Updated Category");
    });

    it("handles update errors", async () => {
      (apiService.patch as jest.Mock).mockRejectedValue(
        new Error("Update failed")
      );

      await expect(
        categoriesService.update("invalid", {} as CategoryFormFE)
      ).rejects.toThrow("Update failed");
    });
  });

  describe("delete", () => {
    it("deletes category successfully", async () => {
      const mockResponse = { message: "Category deleted" };

      (apiService.delete as jest.Mock).mockResolvedValue(mockResponse);

      const result = await categoriesService.delete("electronics");

      expect(apiService.delete).toHaveBeenCalledWith("/categories/electronics");
      expect(result.message).toBe("Category deleted");
    });

    it("handles delete errors", async () => {
      (apiService.delete as jest.Mock).mockRejectedValue(
        new Error("Delete failed")
      );

      await expect(categoriesService.delete("invalid")).rejects.toThrow(
        "Delete failed"
      );
    });
  });

  describe("addParent", () => {
    it("adds parent to category", async () => {
      (apiService.post as jest.Mock).mockResolvedValue({
        success: true,
        message: "Parent added",
      });

      const result = await categoriesService.addParent("laptops", "cat1");

      expect(apiService.post).toHaveBeenCalledWith(
        "/categories/laptops/add-parent",
        { parentId: "cat1" }
      );
      expect(result.message).toBe("Parent added");
    });
  });

  describe("removeParent", () => {
    it("removes parent from category", async () => {
      (apiService.post as jest.Mock).mockResolvedValue({
        success: true,
        message: "Parent removed",
      });

      const result = await categoriesService.removeParent("laptops", "cat1");

      expect(apiService.post).toHaveBeenCalledWith(
        "/categories/laptops/remove-parent",
        { parentId: "cat1" }
      );
      expect(result.message).toBe("Parent removed");
    });
  });

  describe("getParents", () => {
    it("gets category parents", async () => {
      const mockParents: CategoryBE[] = [
        {
          id: "cat1",
          name: "Electronics",
          slug: "electronics",
          description: "Electronics",
          image: "image.jpg",
          isActive: true,
          isFeatured: false,
          sortOrder: 1,
          productCount: 100,
          createdAt: "2024-01-01",
          updatedAt: "2024-01-01",
        },
      ];

      (apiService.get as jest.Mock).mockResolvedValue({
        success: true,
        data: mockParents,
      });

      const result = await categoriesService.getParents("laptops");

      expect(apiService.get).toHaveBeenCalledWith(
        "/categories/laptops/parents"
      );
      expect(result).toHaveLength(1);
    });
  });

  describe("getChildren", () => {
    it("gets category children", async () => {
      const mockChildren: CategoryBE[] = [
        {
          id: "cat2",
          name: "Laptops",
          slug: "laptops",
          description: "Laptops",
          image: "image.jpg",
          isActive: true,
          isFeatured: false,
          sortOrder: 1,
          productCount: 50,
          createdAt: "2024-01-01",
          updatedAt: "2024-01-01",
        },
      ];

      (apiService.get as jest.Mock).mockResolvedValue({
        success: true,
        data: mockChildren,
      });

      const result = await categoriesService.getChildren("electronics");

      expect(apiService.get).toHaveBeenCalledWith(
        "/categories/electronics/children"
      );
      expect(result).toHaveLength(1);
    });
  });

  describe("getFeatured", () => {
    it("gets featured categories", async () => {
      const mockFeatured: CategoryBE[] = [
        {
          id: "cat1",
          name: "Electronics",
          slug: "electronics",
          description: "Electronics",
          image: "image.jpg",
          isActive: true,
          isFeatured: true,
          featured: true,
          sortOrder: 1,
          productCount: 100,
          createdAt: "2024-01-01",
          updatedAt: "2024-01-01",
        } as any,
      ];

      (apiService.get as jest.Mock).mockResolvedValue({
        success: true,
        data: mockFeatured,
      });

      const result = await categoriesService.getFeatured();

      expect(apiService.get).toHaveBeenCalledWith("/categories/featured");
      expect(result).toHaveLength(1);
      expect(result[0].featured).toBe(true);
    });
  });

  describe("getHomepage", () => {
    it("gets homepage categories", async () => {
      const mockHomepage: CategoryBE[] = [
        {
          id: "cat1",
          name: "Electronics",
          slug: "electronics",
          description: "Electronics",
          image: "image.jpg",
          isActive: true,
          isFeatured: true,
          sortOrder: 1,
          productCount: 100,
          createdAt: "2024-01-01",
          updatedAt: "2024-01-01",
        },
      ];

      (apiService.get as jest.Mock).mockResolvedValue({
        success: true,
        data: mockHomepage,
      });

      const result = await categoriesService.getHomepage();

      expect(apiService.get).toHaveBeenCalledWith("/categories/homepage");
      expect(result).toHaveLength(1);
    });
  });

  describe("search", () => {
    it("searches categories", async () => {
      const mockResults: CategoryBE[] = [
        {
          id: "cat1",
          name: "Electronics",
          slug: "electronics",
          description: "Electronics",
          image: "image.jpg",
          isActive: true,
          isFeatured: false,
          sortOrder: 1,
          productCount: 100,
          createdAt: "2024-01-01",
          updatedAt: "2024-01-01",
        },
      ];

      (apiService.get as jest.Mock).mockResolvedValue({
        success: true,
        data: mockResults,
      });

      const result = await categoriesService.search("electron");

      expect(apiService.get).toHaveBeenCalledWith(
        "/categories/search?q=electron"
      );
      expect(result).toHaveLength(1);
    });

    it("encodes special characters in search query", async () => {
      (apiService.get as jest.Mock).mockResolvedValue({
        success: true,
        data: [],
      });

      await categoriesService.search("test & query");

      expect(apiService.get).toHaveBeenCalledWith(
        "/categories/search?q=test%20%26%20query"
      );
    });
  });

  describe("reorder", () => {
    it("reorders categories", async () => {
      const orders = [
        { id: "cat1", sortOrder: 2 },
        { id: "cat2", sortOrder: 1 },
      ];

      (apiService.post as jest.Mock).mockResolvedValue({
        message: "Categories reordered",
      });

      const result = await categoriesService.reorder(orders);

      expect(apiService.post).toHaveBeenCalledWith("/categories/reorder", {
        orders,
      });
      expect(result.message).toBe("Categories reordered");
    });
  });

  describe("getCategoryProducts", () => {
    it("gets category products", async () => {
      const mockResponse = {
        data: [
          {
            id: "prod1",
            name: "Product 1",
            slug: "product-1",
            price: 100,
            image: "image.jpg",
          },
        ],
        count: 1,
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await categoriesService.getCategoryProducts("electronics");

      expect(apiService.get).toHaveBeenCalledWith(
        "/categories/electronics/products"
      );
      expect(result.data).toHaveLength(1);
    });

    it("gets category products with filters", async () => {
      const mockResponse = {
        data: [],
        count: 0,
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      await categoriesService.getCategoryProducts("electronics", {
        page: 2,
        limit: 10,
        includeSubcategories: true,
      });

      expect(apiService.get).toHaveBeenCalledWith(
        "/categories/electronics/products?page=2&limit=10&includeSubcategories=true"
      );
    });
  });

  describe("getSubcategories", () => {
    it("gets subcategories", async () => {
      const mockSubs: CategoryBE[] = [
        {
          id: "cat2",
          name: "Laptops",
          slug: "laptops",
          description: "Laptops",
          image: "image.jpg",
          isActive: true,
          isFeatured: false,
          sortOrder: 1,
          productCount: 50,
          createdAt: "2024-01-01",
          updatedAt: "2024-01-01",
        },
      ];

      (apiService.get as jest.Mock).mockResolvedValue({ data: mockSubs });

      const result = await categoriesService.getSubcategories("electronics");

      expect(apiService.get).toHaveBeenCalledWith(
        "/categories/electronics/subcategories"
      );
      expect(result).toHaveLength(1);
    });
  });

  describe("getSimilarCategories", () => {
    it("gets similar categories without limit", async () => {
      const mockSimilar: CategoryBE[] = [
        {
          id: "cat3",
          name: "Appliances",
          slug: "appliances",
          description: "Appliances",
          image: "image.jpg",
          isActive: true,
          isFeatured: false,
          sortOrder: 1,
          productCount: 30,
          createdAt: "2024-01-01",
          updatedAt: "2024-01-01",
        },
      ];

      (apiService.get as jest.Mock).mockResolvedValue({ data: mockSimilar });

      const result = await categoriesService.getSimilarCategories(
        "electronics"
      );

      expect(apiService.get).toHaveBeenCalledWith(
        "/categories/electronics/similar"
      );
      expect(result).toHaveLength(1);
    });

    it("gets similar categories with limit", async () => {
      (apiService.get as jest.Mock).mockResolvedValue({ data: [] });

      await categoriesService.getSimilarCategories("electronics", 5);

      expect(apiService.get).toHaveBeenCalledWith(
        "/categories/electronics/similar?limit=5"
      );
    });
  });

  describe("getCategoryHierarchy", () => {
    it("gets category hierarchy", async () => {
      const mockHierarchy: CategoryBE[] = [
        {
          id: "cat1",
          name: "Electronics",
          slug: "electronics",
          description: "Electronics",
          image: "image.jpg",
          isActive: true,
          isFeatured: false,
          sortOrder: 1,
          productCount: 100,
          createdAt: "2024-01-01",
          updatedAt: "2024-01-01",
        },
      ];

      (apiService.get as jest.Mock).mockResolvedValue({
        data: mockHierarchy,
      });

      const result = await categoriesService.getCategoryHierarchy("laptops");

      expect(apiService.get).toHaveBeenCalledWith(
        "/categories/laptops/hierarchy"
      );
      expect(result).toHaveLength(1);
    });
  });

  describe("bulk operations", () => {
    it("bulk activates categories", async () => {
      (apiService.post as jest.Mock).mockResolvedValue({});

      await categoriesService.bulkActivate(["cat1", "cat2"]);

      expect(apiService.post).toHaveBeenCalledWith("/categories/bulk", {
        action: "activate",
        ids: ["cat1", "cat2"],
      });
    });

    it("bulk deactivates categories", async () => {
      (apiService.post as jest.Mock).mockResolvedValue({});

      await categoriesService.bulkDeactivate(["cat1", "cat2"]);

      expect(apiService.post).toHaveBeenCalledWith("/categories/bulk", {
        action: "deactivate",
        ids: ["cat1", "cat2"],
      });
    });

    it("bulk features categories", async () => {
      (apiService.post as jest.Mock).mockResolvedValue({});

      await categoriesService.bulkFeature(["cat1", "cat2"]);

      expect(apiService.post).toHaveBeenCalledWith("/categories/bulk", {
        action: "feature",
        ids: ["cat1", "cat2"],
      });
    });

    it("bulk unfeatures categories", async () => {
      (apiService.post as jest.Mock).mockResolvedValue({});

      await categoriesService.bulkUnfeature(["cat1", "cat2"]);

      expect(apiService.post).toHaveBeenCalledWith("/categories/bulk", {
        action: "unfeature",
        ids: ["cat1", "cat2"],
      });
    });

    it("bulk deletes categories", async () => {
      (apiService.post as jest.Mock).mockResolvedValue({});

      await categoriesService.bulkDelete(["cat1", "cat2"]);

      expect(apiService.post).toHaveBeenCalledWith("/categories/bulk", {
        action: "delete",
        ids: ["cat1", "cat2"],
      });
    });

    it("bulk updates categories", async () => {
      const updates: Partial<CategoryFormFE> = {
        isActive: false,
      };

      (apiService.post as jest.Mock).mockResolvedValue({});

      await categoriesService.bulkUpdate(["cat1", "cat2"], updates);

      expect(apiService.post).toHaveBeenCalledWith("/categories/bulk", {
        action: "update",
        ids: ["cat1", "cat2"],
        updates,
      });
    });
  });

  describe("getByIds", () => {
    it("fetches categories by IDs", async () => {
      const mockCategories: CategoryBE[] = [
        {
          id: "cat1",
          name: "Electronics",
          slug: "electronics",
          description: "Electronics",
          image: "image.jpg",
          isActive: true,
          isFeatured: false,
          sortOrder: 1,
          productCount: 100,
          createdAt: "2024-01-01",
          updatedAt: "2024-01-01",
        },
      ];

      (apiService.post as jest.Mock).mockResolvedValue({
        data: mockCategories,
      });

      const result = await categoriesService.getByIds(["cat1", "cat2"]);

      expect(apiService.post).toHaveBeenCalledWith("/categories/batch", {
        ids: ["cat1", "cat2"],
      });
      expect(result).toHaveLength(1);
    });

    it("returns empty array for empty IDs", async () => {
      const result = await categoriesService.getByIds([]);

      expect(apiService.post).not.toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it("handles batch fetch errors gracefully", async () => {
      (apiService.post as jest.Mock).mockRejectedValue(
        new Error("Batch fetch failed")
      );

      const result = await categoriesService.getByIds(["cat1"]);

      expect(result).toEqual([]);
    });
  });
});
