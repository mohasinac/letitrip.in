/**
 * Products Service Tests
 *
 * Tests for the ProductsService which handles product CRUD operations
 * with FE/BE type transformations.
 */
import { productsService } from "../products.service";
import { apiService } from "../api.service";
import {
  toFEProduct,
  toFEProductCards,
  toBEProductCreate,
  toBEProductUpdate,
} from "@/types/transforms/product.transforms";

// Mock the api service
jest.mock("../api.service", () => ({
  apiService: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

// Mock the transforms
jest.mock("@/types/transforms/product.transforms", () => ({
  toFEProduct: jest.fn((data) => ({ ...data, transformed: true })),
  toFEProductCards: jest.fn((data) =>
    data.map((d: any) => ({ ...d, card: true })),
  ),
  toBEProductCreate: jest.fn((data) => ({ ...data, beCreate: true })),
  toBEProductUpdate: jest.fn((data) => ({ ...data, beUpdate: true })),
}));

// Mock error logger
jest.mock("@/lib/error-logger", () => ({
  logServiceError: jest.fn(),
}));

const mockApiService = apiService as jest.Mocked<typeof apiService>;
const mockToFEProduct = toFEProduct as jest.MockedFunction<typeof toFEProduct>;
const mockToFEProductCards = toFEProductCards as jest.MockedFunction<
  typeof toFEProductCards
>;
const mockToBEProductCreate = toBEProductCreate as jest.MockedFunction<
  typeof toBEProductCreate
>;
const mockToBEProductUpdate = toBEProductUpdate as jest.MockedFunction<
  typeof toBEProductUpdate
>;

describe("ProductsService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("list", () => {
    it("should fetch products with default filters", async () => {
      const mockProducts = [
        { id: "p1", name: "Product 1", price: 100 },
        { id: "p2", name: "Product 2", price: 200 },
      ];

      mockApiService.get.mockResolvedValue({
        data: mockProducts,
        count: 2,
        pagination: { page: 1, limit: 20, total: 2 },
      });

      const result = await productsService.list();

      expect(mockApiService.get).toHaveBeenCalled();
      expect(mockToFEProductCards).toHaveBeenCalledWith(mockProducts);
      expect(result.data).toHaveLength(2);
      expect(result.count).toBe(2);
    });

    it("should apply filters to the request", async () => {
      mockApiService.get.mockResolvedValue({
        data: [],
        count: 0,
        pagination: {},
      });

      await productsService.list({
        categoryId: "cat1",
        priceRange: { min: 100, max: 500 },
        inStock: true,
        page: 2,
        limit: 10,
      });

      expect(mockApiService.get).toHaveBeenCalled();
      const calledEndpoint = mockApiService.get.mock.calls[0][0];
      expect(calledEndpoint).toContain("categoryId=cat1");
      expect(calledEndpoint).toContain("priceMin=100");
      expect(calledEndpoint).toContain("priceMax=500");
      expect(calledEndpoint).toContain("inStock=true");
      expect(calledEndpoint).toContain("page=2");
      expect(calledEndpoint).toContain("limit=10");
    });

    it("should handle empty results", async () => {
      mockApiService.get.mockResolvedValue({
        data: [],
        count: 0,
        pagination: {},
      });

      const result = await productsService.list();

      expect(result.data).toEqual([]);
      expect(result.count).toBe(0);
    });

    it("should throw on API error", async () => {
      mockApiService.get.mockRejectedValue(new Error("Network error"));

      await expect(productsService.list()).rejects.toThrow("Network error");
    });
  });

  describe("getById", () => {
    it("should fetch product by ID and transform", async () => {
      const mockProduct = {
        id: "p1",
        name: "Test Product",
        price: 150,
        status: "published",
      };

      mockApiService.get.mockResolvedValue({ data: mockProduct });

      const result = await productsService.getById("p1");

      expect(mockApiService.get).toHaveBeenCalledWith("/products/p1");
      expect(mockToFEProduct).toHaveBeenCalledWith(mockProduct);
      expect(result.transformed).toBe(true);
    });

    it("should throw on not found", async () => {
      mockApiService.get.mockRejectedValue(new Error("Product not found"));

      await expect(productsService.getById("nonexistent")).rejects.toThrow(
        "Product not found",
      );
    });
  });

  describe("getBySlug", () => {
    it("should fetch product by slug and transform", async () => {
      const mockProduct = {
        id: "p1",
        name: "Test Product",
        slug: "test-product",
        price: 150,
      };

      mockApiService.get.mockResolvedValue({ data: mockProduct });

      const result = await productsService.getBySlug("test-product");

      expect(mockApiService.get).toHaveBeenCalledWith("/products/test-product");
      expect(mockToFEProduct).toHaveBeenCalledWith(mockProduct);
    });
  });

  describe("create", () => {
    it("should transform form data and create product", async () => {
      const formData = {
        name: "New Product",
        price: 200,
        description: "A new product",
        categoryId: "cat1",
      };

      const mockCreated = {
        id: "newp1",
        ...formData,
        status: "draft",
      };

      mockApiService.post.mockResolvedValue({ data: mockCreated });

      const result = await productsService.create(formData as any);

      expect(mockToBEProductCreate).toHaveBeenCalledWith(formData);
      expect(mockApiService.post).toHaveBeenCalled();
      expect(mockToFEProduct).toHaveBeenCalledWith(mockCreated);
    });

    it("should throw on validation error", async () => {
      mockApiService.post.mockRejectedValue(new Error("Validation failed"));

      await expect(
        productsService.create({ name: "" } as any),
      ).rejects.toThrow();
    });
  });

  describe("update", () => {
    it("should transform update data and update product", async () => {
      const updateData = {
        name: "Updated Product",
        price: 250,
      };

      const mockUpdated = {
        id: "p1",
        name: "Updated Product",
        price: 250,
      };

      mockApiService.patch.mockResolvedValue({ data: mockUpdated });

      const result = await productsService.update("p1", updateData as any);

      expect(mockToBEProductUpdate).toHaveBeenCalledWith(updateData);
      expect(mockApiService.patch).toHaveBeenCalled();
      expect(mockToFEProduct).toHaveBeenCalledWith(mockUpdated);
    });
  });

  describe("delete", () => {
    it("should delete product by ID", async () => {
      mockApiService.delete.mockResolvedValue({ success: true });

      await productsService.delete("p1");

      expect(mockApiService.delete).toHaveBeenCalledWith("/products/p1");
    });

    it("should throw on delete error", async () => {
      mockApiService.delete.mockRejectedValue(new Error("Cannot delete"));

      await expect(productsService.delete("p1")).rejects.toThrow(
        "Cannot delete",
      );
    });
  });

  describe("bulkDelete", () => {
    it("should delete multiple products", async () => {
      mockApiService.post.mockResolvedValue({
        success: true,
        deleted: 3,
        failed: 0,
      });

      const result = await productsService.bulkDelete(["p1", "p2", "p3"]);

      expect(mockApiService.post).toHaveBeenCalledWith(
        "/products/bulk",
        expect.objectContaining({
          action: "delete",
          ids: ["p1", "p2", "p3"],
        }),
      );
    });
  });

  describe("bulkPublish", () => {
    it("should publish multiple products", async () => {
      mockApiService.post.mockResolvedValue({
        success: true,
        updated: 2,
        failed: 0,
      });

      const result = await productsService.bulkPublish(["p1", "p2"]);

      expect(mockApiService.post).toHaveBeenCalledWith(
        "/products/bulk",
        expect.objectContaining({
          action: "publish",
          ids: ["p1", "p2"],
        }),
      );
    });
  });
});
