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
});
