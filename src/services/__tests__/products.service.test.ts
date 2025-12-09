import type { ProductFiltersFE } from "@/types/frontend/product.types";
import { apiService } from "../api.service";
import { productsService } from "../products.service";

// Mock the api service
jest.mock("../api.service");

// Mock error logger
jest.mock("@/lib/error-logger", () => ({
  logServiceError: jest.fn(),
}));

// Mock transforms
jest.mock("@/types/transforms/product.transforms", () => ({
  toFEProduct: jest.fn((data) => ({ ...data, id: data.id })),
  toFEProductCards: jest.fn((data) => data.map((item: any) => ({ ...item }))),
  toBEProductCreate: jest.fn((data) => data),
  toBEProductUpdate: jest.fn((data) => data),
}));

describe("ProductsService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("list", () => {
    it("fetches products list successfully", async () => {
      const mockResponse = {
        data: [
          { id: "1", name: "Product 1", price: 100 },
          { id: "2", name: "Product 2", price: 200 },
        ],
        count: 2,
        pagination: { page: 1, limit: 20, total: 2 },
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await productsService.list();

      expect(result.data).toHaveLength(2);
      expect(result.count).toBe(2);
      expect(apiService.get).toHaveBeenCalled();
    });

    it("applies filters correctly", async () => {
      const mockResponse = {
        data: [],
        count: 0,
        pagination: { page: 1, limit: 20, total: 0 },
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const filters: ProductFiltersFE = {
        search: "test",
        categoryId: "cat-1",
        priceRange: { min: 100, max: 500 },
        inStock: true,
        page: 1,
        limit: 10,
      };

      await productsService.list(filters);

      expect(apiService.get).toHaveBeenCalled();
      const calledUrl = (apiService.get as jest.Mock).mock.calls[0][0];
      expect(calledUrl).toContain("search=test");
    });

    it("handles empty results", async () => {
      const mockResponse = {
        data: [],
        count: 0,
        pagination: { page: 1, limit: 20, total: 0 },
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await productsService.list();

      expect(result.data).toEqual([]);
      expect(result.count).toBe(0);
    });

    it("handles errors", async () => {
      (apiService.get as jest.Mock).mockRejectedValue(
        new Error("Failed to fetch products")
      );

      await expect(productsService.list()).rejects.toThrow(
        "Failed to fetch products"
      );
    });
  });

  describe("getById", () => {
    it("fetches product by ID successfully", async () => {
      const mockProduct = {
        data: {
          id: "prod-1",
          name: "Test Product",
          price: 299.99,
          description: "Test description",
        },
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockProduct);

      const result = await productsService.getById("prod-1");

      expect(result).toBeDefined();
      expect(result.id).toBe("prod-1");
      expect(apiService.get).toHaveBeenCalledWith(
        expect.stringContaining("prod-1")
      );
    });

    it("handles not found error", async () => {
      (apiService.get as jest.Mock).mockRejectedValue(
        new Error("Product not found")
      );

      await expect(productsService.getById("invalid-id")).rejects.toThrow(
        "Product not found"
      );
    });
  });

  describe("getBySlug", () => {
    it("fetches product by slug successfully", async () => {
      const mockProduct = {
        data: {
          id: "prod-1",
          slug: "test-product",
          name: "Test Product",
          price: 299.99,
        },
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockProduct);

      const result = await productsService.getBySlug("test-product");

      expect(result).toBeDefined();
      expect(apiService.get).toHaveBeenCalledWith(
        expect.stringContaining("test-product")
      );
    });

    it("handles invalid slug error", async () => {
      (apiService.get as jest.Mock).mockRejectedValue(
        new Error("Product not found")
      );

      await expect(productsService.getBySlug("invalid-slug")).rejects.toThrow(
        "Product not found"
      );
    });
  });

  describe("create", () => {
    it("creates product successfully", async () => {
      const mockProduct = {
        data: {
          id: "prod-new",
          name: "New Product",
          price: 499.99,
        },
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockProduct);

      const formData = {
        name: "New Product",
        price: 499.99,
        description: "New product description",
      };

      const result = await productsService.create(formData);

      expect(result).toBeDefined();
      expect(apiService.post).toHaveBeenCalled();
    });

    it("handles validation errors", async () => {
      (apiService.post as jest.Mock).mockRejectedValue(
        new Error("Validation failed")
      );

      const formData = {
        name: "",
        price: -10,
      };

      await expect(productsService.create(formData as any)).rejects.toThrow(
        "Validation failed"
      );
    });
  });

  describe("update", () => {
    it("updates product successfully", async () => {
      const mockProduct = {
        data: {
          id: "prod-1",
          name: "Updated Product",
          price: 599.99,
        },
      };

      (apiService.patch as jest.Mock).mockResolvedValue(mockProduct);

      const updates = {
        name: "Updated Product",
        price: 599.99,
      };

      const result = await productsService.update("prod-1", updates);

      expect(result).toBeDefined();
      expect(apiService.patch).toHaveBeenCalledWith(
        expect.stringContaining("prod-1"),
        expect.any(Object)
      );
    });

    it("handles not found error", async () => {
      (apiService.patch as jest.Mock).mockRejectedValue(
        new Error("Product not found")
      );

      await expect(
        productsService.update("invalid-id", { name: "Test" })
      ).rejects.toThrow("Product not found");
    });
  });

  describe("delete", () => {
    it("deletes product successfully", async () => {
      const mockResponse = { message: "Product deleted successfully" };

      (apiService.delete as jest.Mock).mockResolvedValue(mockResponse);

      await productsService.delete("prod-1");

      expect(apiService.delete).toHaveBeenCalledWith(
        expect.stringContaining("prod-1")
      );
    });

    it("handles delete error", async () => {
      (apiService.delete as jest.Mock).mockRejectedValue(
        new Error("Failed to delete product")
      );

      await expect(productsService.delete("prod-1")).rejects.toThrow(
        "Failed to delete product"
      );
    });
  });

  describe("bulkDelete", () => {
    it("deletes multiple products successfully", async () => {
      const mockResponse = {
        success: true,
        deletedCount: 3,
        failedIds: [],
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await productsService.bulkDelete([
        "prod-1",
        "prod-2",
        "prod-3",
      ]);

      expect(result.deletedCount).toBe(3);
      expect(result.failedIds).toHaveLength(0);
    });

    it("handles partial failures", async () => {
      const mockResponse = {
        success: false,
        deletedCount: 2,
        failedIds: ["prod-3"],
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await productsService.bulkDelete([
        "prod-1",
        "prod-2",
        "prod-3",
      ]);

      expect(result.deletedCount).toBe(2);
      expect(result.failedIds).toContain("prod-3");
    });
  });

  describe("getReviews", () => {
    it("gets product reviews with pagination", async () => {
      const mockResponse = {
        data: [
          { id: "rev1", rating: 5, comment: "Great product!" },
          { id: "rev2", rating: 4, comment: "Good quality" },
        ],
        count: 2,
        pagination: { page: 1, limit: 10 },
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await productsService.getReviews("prod-1", 1, 10);

      expect(apiService.get).toHaveBeenCalledWith(
        expect.stringContaining("prod-1/reviews")
      );
      expect(result.data).toHaveLength(2);
    });
  });

  describe("getVariants", () => {
    it("gets product variants", async () => {
      const mockResponse = {
        data: [
          { id: "var1", name: "Variant 1", price: 1000 },
          { id: "var2", name: "Variant 2", price: 1200 },
        ],
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await productsService.getVariants("prod-1");

      expect(apiService.get).toHaveBeenCalledWith(
        expect.stringContaining("prod-1/variants")
      );
      expect(result).toHaveLength(2);
    });
  });

  describe("getSimilar", () => {
    it("gets similar products with limit", async () => {
      const mockResponse = {
        data: [
          { id: "sim1", name: "Similar 1", price: 950 },
          { id: "sim2", name: "Similar 2", price: 1050 },
        ],
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await productsService.getSimilar("prod-1", 2);

      expect(apiService.get).toHaveBeenCalledWith(
        expect.stringContaining("prod-1/similar")
      );
      expect(result).toHaveLength(2);
    });
  });

  describe("getSellerProducts", () => {
    it("gets other products from same seller", async () => {
      const mockResponse = {
        data: [
          { id: "seller-prod1", name: "Product 1", price: 800 },
          { id: "seller-prod2", name: "Product 2", price: 900 },
        ],
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await productsService.getSellerProducts("prod-1", 10);

      expect(apiService.get).toHaveBeenCalledWith(
        expect.stringContaining("prod-1/seller-items")
      );
      expect(result).toHaveLength(2);
    });
  });

  describe("updateStock", () => {
    it("updates product stock count", async () => {
      const mockResponse = {
        data: { id: "prod1", stockCount: 50 },
      };

      (apiService.patch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await productsService.updateStock("prod-1", 50);

      expect(apiService.patch).toHaveBeenCalledWith(
        expect.stringContaining("prod-1"),
        expect.objectContaining({ stockCount: 50 })
      );
      expect(result.stockCount).toBe(50);
    });
  });

  describe("updateStatus", () => {
    it("updates product status", async () => {
      const mockResponse = {
        data: { id: "prod1", status: "published" },
      };

      (apiService.patch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await productsService.updateStatus("prod-1", "published");

      expect(apiService.patch).toHaveBeenCalledWith(
        expect.stringContaining("prod-1"),
        expect.objectContaining({ status: "published" })
      );
      expect(result.status).toBe("published");
    });
  });

  describe("incrementView", () => {
    it("increments product view count", async () => {
      (apiService.post as jest.Mock).mockResolvedValue({});

      await productsService.incrementView("prod-1");

      expect(apiService.post).toHaveBeenCalledWith(
        expect.stringContaining("prod-1/view"),
        {}
      );
    });
  });

  describe("getFeatured", () => {
    it("gets featured products", async () => {
      const mockResponse = {
        data: [
          { id: "feat1", name: "Featured 1", featured: true },
          { id: "feat2", name: "Featured 2", featured: true },
        ],
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await productsService.getFeatured();

      expect(apiService.get).toHaveBeenCalledWith(
        expect.stringContaining("featured=true")
      );
      expect(result).toHaveLength(2);
    });
  });

  describe("getHomepage", () => {
    it("gets homepage products", async () => {
      const mockResponse = {
        data: [
          { id: "home1", name: "Homepage 1" },
          { id: "home2", name: "Homepage 2" },
        ],
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await productsService.getHomepage();

      expect(apiService.get).toHaveBeenCalledWith(
        expect.stringContaining("featured=true")
      );
      expect(result).toHaveLength(2);
    });
  });

  describe("bulk operations", () => {
    it("bulk publishes products", async () => {
      const mockResponse = {
        success: true,
        results: { success: ["prod1", "prod2"], failed: [] },
        summary: { total: 2, succeeded: 2, failed: 0 },
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      await productsService.bulkPublish(["prod1", "prod2"]);

      expect(apiService.post).toHaveBeenCalledWith(
        "/products/bulk",
        expect.objectContaining({ action: "publish" })
      );
    });

    it("bulk unpublishes products", async () => {
      const mockResponse = {
        success: true,
        results: { success: ["prod1"], failed: [] },
        summary: { total: 1, succeeded: 1, failed: 0 },
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      await productsService.bulkUnpublish(["prod1"]);

      expect(apiService.post).toHaveBeenCalledWith(
        "/products/bulk",
        expect.objectContaining({ action: "unpublish" })
      );
    });

    it("bulk archives products", async () => {
      const mockResponse = {
        success: true,
        results: { success: ["prod1", "prod2"], failed: [] },
        summary: { total: 2, succeeded: 2, failed: 0 },
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      await productsService.bulkArchive(["prod1", "prod2"]);

      expect(apiService.post).toHaveBeenCalledWith(
        "/products/bulk",
        expect.objectContaining({ action: "archive" })
      );
    });

    it("bulk features products", async () => {
      const mockResponse = {
        success: true,
        results: { success: ["prod1"], failed: [] },
        summary: { total: 1, succeeded: 1, failed: 0 },
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      await productsService.bulkFeature(["prod1"]);

      expect(apiService.post).toHaveBeenCalledWith(
        "/products/bulk",
        expect.objectContaining({ action: "feature" })
      );
    });

    it("bulk unfeatures products", async () => {
      const mockResponse = {
        success: true,
        results: { success: ["prod1"], failed: [] },
        summary: { total: 1, succeeded: 1, failed: 0 },
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      await productsService.bulkUnfeature(["prod1"]);

      expect(apiService.post).toHaveBeenCalledWith(
        "/products/bulk",
        expect.objectContaining({ action: "unfeature" })
      );
    });

    it("bulk updates stock", async () => {
      const mockResponse = {
        success: true,
        results: { success: ["prod1", "prod2"], failed: [] },
        summary: { total: 2, succeeded: 2, failed: 0 },
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      await productsService.bulkUpdateStock(["prod1", "prod2"], 100);

      expect(apiService.post).toHaveBeenCalledWith(
        "/products/bulk",
        expect.objectContaining({
          action: "update-stock",
          updates: { stockCount: 100 },
        })
      );
    });

    it("bulk updates products with custom data", async () => {
      const mockResponse = {
        success: true,
        results: { success: ["prod1"], failed: [] },
        summary: { total: 1, succeeded: 1, failed: 0 },
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      await productsService.bulkUpdate(["prod1"], {
        price: 999,
        discount: 10,
      } as any);

      expect(apiService.post).toHaveBeenCalledWith(
        "/products/bulk",
        expect.objectContaining({ action: "update" })
      );
    });

    it("handles partial failures in bulk operations", async () => {
      const mockResponse = {
        success: false,
        results: {
          success: ["prod1"],
          failed: [{ id: "prod2", error: "Product not found" }],
        },
        summary: { total: 2, succeeded: 1, failed: 1 },
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await productsService.bulkPublish(["prod1", "prod2"]);

      expect(result.summary.succeeded).toBe(1);
      expect(result.summary.failed).toBe(1);
    });
  });

  describe("quickCreate", () => {
    it("creates product with minimal data", async () => {
      const mockProduct = {
        id: "prod1",
        name: "Quick Product",
        price: 500,
        stockCount: 10,
        categoryId: "cat1",
        slug: "quick-product",
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockProduct);

      const result = await productsService.quickCreate({
        name: "Quick Product",
        price: 500,
        stockCount: 10,
        categoryId: "cat1",
      });

      expect(apiService.post).toHaveBeenCalledWith(
        "/products",
        expect.objectContaining({
          name: "Quick Product",
          price: 500,
          description: "",
        })
      );
      expect(result).toBeDefined();
    });
  });

  describe("quickUpdate", () => {
    it("updates product inline", async () => {
      const mockProduct = {
        id: "prod1",
        name: "Updated Product",
        price: 750,
      };

      (apiService.patch as jest.Mock).mockResolvedValue(mockProduct);

      const result = await productsService.quickUpdate("prod-1", {
        price: 750,
      });

      expect(apiService.patch).toHaveBeenCalledWith(
        expect.stringContaining("prod-1"),
        expect.objectContaining({ price: 750 })
      );
      expect(result.price).toBe(750);
    });
  });

  describe("getByIds", () => {
    it("fetches products by batch IDs", async () => {
      const mockResponse = {
        data: [
          { id: "prod1", name: "Product 1" },
          { id: "prod2", name: "Product 2" },
        ],
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await productsService.getByIds(["prod1", "prod2"]);

      expect(apiService.post).toHaveBeenCalledWith("/products/batch", {
        ids: ["prod1", "prod2"],
      });
      expect(result).toHaveLength(2);
    });

    it("returns empty array for empty IDs", async () => {
      const result = await productsService.getByIds([]);

      expect(result).toEqual([]);
      expect(apiService.post).not.toHaveBeenCalled();
    });
  });

  describe("edge cases", () => {
    it("handles products with special characters in name", async () => {
      const mockFormData = {
        name: "Special @#$% & Product 😊",
        price: 1000,
        description: "Unicode: नमस्ते مرحبا 你好",
        categoryId: "cat1",
      };

      const mockProduct = {
        id: "prod1",
        name: mockFormData.name,
        slug: "special-product",
      };

      (apiService.post as jest.Mock).mockResolvedValue({
        data: mockProduct,
      });

      const result = await productsService.create(mockFormData as any);

      expect(result).toBeDefined();
    });

    it("handles concurrent bulk operations", async () => {
      const mockResponse = {
        success: true,
        results: { success: ["prod1"], failed: [] },
        summary: { total: 1, succeeded: 1, failed: 0 },
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const promises = [
        productsService.bulkPublish(["prod1"]),
        productsService.bulkFeature(["prod2"]),
        productsService.bulkUpdateStock(["prod3"], 50),
      ];

      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      expect(apiService.post).toHaveBeenCalledTimes(3);
    });

    it("handles filters with multiple values", async () => {
      const mockResponse = {
        data: [{ id: "prod1", name: "Filtered Product" }],
        count: 1,
        pagination: { page: 1, limit: 20 },
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      await productsService.list({
        categoryId: "cat1",
        search: "test",
        priceRange: { min: 100, max: 1000 },
        inStock: true,
        featured: true,
      });

      expect(apiService.get).toHaveBeenCalledWith(
        expect.stringContaining("categoryId=cat1")
      );
    });
  });
});
