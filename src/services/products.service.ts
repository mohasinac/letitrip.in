import { buildUrl, PRODUCT_ROUTES } from "@/constants/api-routes";
import { PAGINATION } from "@/constants/limits";
import { PRODUCT_STATUS } from "@/constants/statuses";
import { logServiceError } from "@/lib/error-logger";
import { ErrorCode, NotFoundError, ValidationError } from "@/lib/errors";
import { ProductBE, ProductListItemBE } from "@/types/backend/product.types";
import {
  ProductCardFE,
  ProductFE,
  ProductFiltersFE,
  ProductFormFE,
} from "@/types/frontend/product.types";
import type { BulkActionResponse } from "@/types/shared/common.types";
import type { PaginatedResponse } from "@/types/shared/pagination.types";
import {
  toBEProductCreate,
  toBEProductUpdate,
  toFEProduct,
  toFEProductCards,
} from "@/types/transforms/product.transforms";
import { z, ZodError } from "zod";
import { apiService } from "./api.service";

/**
 * Zod validation schemas for product operations
 */

// Product form schema for create/update
export const ProductFormSchema = z.object({
  name: z
    .string()
    .min(3, "Product name must be at least 3 characters")
    .max(200, "Product name must not exceed 200 characters"),
  slug: z
    .string()
    .min(3, "Slug must be at least 3 characters")
    .max(200, "Slug must not exceed 200 characters")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug must contain only lowercase letters, numbers, and hyphens"
    )
    .optional(),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(5000, "Description must not exceed 5000 characters"),
  price: z
    .number()
    .positive("Price must be greater than 0")
    .max(10000000, "Price must not exceed ₹1,00,00,000"),
  compareAtPrice: z.number().positive().optional().nullable(),
  costPerItem: z.number().positive().optional().nullable(),
  stockCount: z
    .number()
    .int("Stock count must be a whole number")
    .min(0, "Stock count cannot be negative"),
  sku: z.string().optional().nullable(),
  barcode: z.string().optional().nullable(),
  trackQuantity: z.boolean().optional().default(true),
  continueSellingWhenOutOfStock: z.boolean().optional().default(false),
  requiresShipping: z.boolean().optional().default(true),
  weight: z.number().positive().optional().nullable(),
  categoryId: z.string().min(1, "Category is required"),
  shopId: z.string().min(1, "Shop ID is required"),
  sellerId: z.string().min(1, "Seller ID is required"),
  tags: z.array(z.string()).optional().default([]),
  images: z
    .array(z.string().url("Invalid image URL"))
    .min(1, "At least one image is required")
    .max(10, "Maximum 10 images allowed"),
  status: z
    .enum(["draft", "published", "archived"])
    .optional()
    .default("draft"),
  featured: z.boolean().optional().default(false),
  seo: z
    .object({
      title: z
        .string()
        .max(60, "SEO title must not exceed 60 characters")
        .optional()
        .nullable(),
      description: z
        .string()
        .max(160, "SEO description must not exceed 160 characters")
        .optional()
        .nullable(),
    })
    .optional(),
});

// Stock update schema
export const StockUpdateSchema = z.object({
  stockCount: z
    .number()
    .int("Stock count must be a whole number")
    .min(0, "Stock count cannot be negative"),
});

// Status update schema
export const StatusUpdateSchema = z.object({
  status: z.enum(["draft", "published", "archived"], {
    errorMap: () => ({
      message: "Status must be draft, published, or archived",
    }),
  }),
});

// Quick create schema (minimal fields)
export const QuickCreateSchema = z.object({
  name: z
    .string()
    .min(3, "Product name must be at least 3 characters")
    .max(200, "Product name must not exceed 200 characters"),
  price: z
    .number()
    .positive("Price must be greater than 0")
    .max(10000000, "Price must not exceed ₹1,00,00,000"),
  stockCount: z
    .number()
    .int("Stock count must be a whole number")
    .min(0, "Stock count cannot be negative"),
  categoryId: z.string().min(1, "Category is required"),
  status: z.enum(["draft", "published", "archived"]).optional(),
  images: z.array(z.string().url("Invalid image URL")).optional(),
});

// Bulk action schema
export const BulkActionSchema = z.object({
  action: z.enum([
    "publish",
    "unpublish",
    "archive",
    "feature",
    "unfeature",
    "update-stock",
    "delete",
    "update",
  ]),
  productIds: z
    .array(z.string().min(1, "Product ID cannot be empty"))
    .min(1, "At least one product must be selected"),
  data: z.any().optional(),
});

/**
 * Products Service - Reference Implementation
 *
 * This service uses the new type system with automatic FE/BE transformation.
 * All methods return FE types for components, and accept FE types for forms.
 */
class ProductsService {
  /**
   * Handle service errors and convert to user-friendly messages
   */
  private handleError(error: any, context: string): never {
    logServiceError("ProductsService", context, error);
    throw error;
  }

  /**
   * List products with filters (returns UI-optimized types)
   */
  async list(
    filters?: ProductFiltersFE
  ): Promise<{ data: ProductCardFE[]; count: number; pagination: any }> {
    try {
      // Convert FE filters to BE filters - simplified mapping
      const beFilters: any = {
        shopId: filters?.shopId,
        categoryId: filters?.categoryId,
        search: filters?.search,
        priceMin: filters?.priceRange?.min,
        priceMax: filters?.priceRange?.max,
        status: filters?.status?.[0],
        inStock: filters?.inStock,
        featured: filters?.featured,
        page: filters?.page || 1,
        limit: filters?.limit || 20,
        sortBy: filters?.sortBy,
      };

      const endpoint = buildUrl(PRODUCT_ROUTES.LIST, beFilters);
      const response: any = await apiService.get(endpoint);

      // Transform BE list items to FE cards
      return {
        data: toFEProductCards(response.data || []),
        count: response.count || 0,
        pagination: response.pagination,
      };
    } catch (error) {
      this.handleError(error, "list");
    }
  }

  /**
   * Get product by ID (returns full UI-optimized product)
   */
  async getById(id: string): Promise<ProductFE> {
    try {
      const response: any = await apiService.get(PRODUCT_ROUTES.BY_ID(id));
      if (!response.data) {
        throw new NotFoundError(
          "Product not found",
          ErrorCode.PRODUCT_NOT_FOUND,
          { productId: id }
        );
      }
      return toFEProduct(response.data);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      // API might return 404, convert to NotFoundError
      if (
        (error as any)?.status === 404 ||
        (error as any)?.response?.status === 404
      ) {
        throw new NotFoundError(
          "Product not found",
          ErrorCode.PRODUCT_NOT_FOUND,
          { productId: id }
        );
      }
      this.handleError(error, `getById(${id})`);
    }
  }

  /**
   * Get product by slug (returns full UI-optimized product)
   */
  async getBySlug(slug: string): Promise<ProductFE> {
    try {
      const response: any = await apiService.get(PRODUCT_ROUTES.BY_SLUG(slug));
      if (!response.data) {
        throw new NotFoundError(
          "Product not found",
          ErrorCode.PRODUCT_NOT_FOUND,
          { slug }
        );
      }
      return toFEProduct(response.data);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      // API might return 404, convert to NotFoundError
      if (
        (error as any)?.status === 404 ||
        (error as any)?.response?.status === 404
      ) {
        throw new NotFoundError(
          "Product not found",
          ErrorCode.PRODUCT_NOT_FOUND,
          { slug }
        );
      }
      this.handleError(error, `getBySlug(${slug})`);
    }
  }

  /**
   * Create product (accepts form data, returns created product)
   */
  async create(formData: ProductFormFE): Promise<ProductFE> {
    try {
      // Validate input data
      const validatedData = ProductFormSchema.parse(formData);

      const createRequest = toBEProductCreate(validatedData);
      const response: any = await apiService.post(
        PRODUCT_ROUTES.LIST,
        createRequest
      );
      return toFEProduct(response.data);
    } catch (error) {
      if (error instanceof ZodError) {
        throw new ValidationError(
          "Invalid product data",
          ErrorCode.VALIDATION_ERROR,
          { errors: error.errors }
        );
      }
      this.handleError(error, "create");
    }
  }

  /**
   * Update product (accepts partial form data)
   */
  async update(
    slug: string,
    formData: Partial<ProductFormFE>
  ): Promise<ProductFE> {
    try {
      // Validate input data (allow partial updates)
      const validatedData = ProductFormSchema.partial().parse(formData);

      const updateRequest = toBEProductUpdate(validatedData);
      const response: any = await apiService.patch(
        PRODUCT_ROUTES.BY_SLUG(slug),
        updateRequest
      );
      return toFEProduct(response.data);
    } catch (error) {
      if (error instanceof ZodError) {
        throw new ValidationError(
          "Invalid product data",
          ErrorCode.VALIDATION_ERROR,
          { errors: error.errors }
        );
      }
      if (
        (error as any)?.status === 404 ||
        (error as any)?.response?.status === 404
      ) {
        throw new NotFoundError(
          "Product not found",
          ErrorCode.PRODUCT_NOT_FOUND,
          { slug }
        );
      }
      this.handleError(error, `update(${slug})`);
    }
  }

  /**
   * Delete product
   */
  async delete(slug: string): Promise<{ message: string }> {
    try {
      return apiService.delete<{ message: string }>(
        PRODUCT_ROUTES.BY_SLUG(slug)
      );
    } catch (error) {
      if (
        (error as any)?.status === 404 ||
        (error as any)?.response?.status === 404
      ) {
        throw new NotFoundError(
          "Product not found",
          ErrorCode.PRODUCT_NOT_FOUND,
          { slug }
        );
      }
      this.handleError(error, `delete(${slug})`);
    }
  }

  /**
   * Get product reviews
   */
  async getReviews(slug: string, page?: number, limit?: number): Promise<any> {
    try {
      const endpoint = buildUrl(PRODUCT_ROUTES.REVIEWS(slug), { page, limit });
      return apiService.get<any>(endpoint);
    } catch (error) {
      this.handleError(error, `getReviews(${slug})`);
    }
  }

  /**
   * Get product variants (returns FE types)
   */
  async getVariants(slug: string): Promise<ProductCardFE[]> {
    try {
      const response: any = await apiService.get(
        `${PRODUCT_ROUTES.BY_SLUG(slug)}/variants`
      );
      return toFEProductCards(response.data || []);
    } catch (error) {
      this.handleError(error, `getVariants(${slug})`);
    }
  }

  /**
   * Get similar products (returns FE types)
   */
  async getSimilar(slug: string, limit?: number): Promise<ProductCardFE[]> {
    try {
      const endpoint = buildUrl(`${PRODUCT_ROUTES.BY_SLUG(slug)}/similar`, {
        limit,
      });
      const response: any = await apiService.get(endpoint);
      return toFEProductCards(response.data || []);
    } catch (error) {
      this.handleError(error, `getSimilar(${slug})`);
    }
  }

  /**
   * Get seller's other products (returns FE types)
   */
  async getSellerProducts(
    slug: string,
    limit?: number
  ): Promise<ProductCardFE[]> {
    const endpoint = buildUrl(`${PRODUCT_ROUTES.BY_SLUG(slug)}/seller-items`, {
      limit,
    });
    const response: any = await apiService.get(endpoint);
    return toFEProductCards(response.data || []);
  }

  /**
   * Update product stock
   */
  async updateStock(slug: string, stockCount: number): Promise<ProductFE> {
    try {
      // Validate stock count
      const validatedData = StockUpdateSchema.parse({ stockCount });

      const response: any = await apiService.patch(
        PRODUCT_ROUTES.BY_SLUG(slug),
        {
          stockCount: validatedData.stockCount,
        }
      );
      return toFEProduct(response.data);
    } catch (error) {
      if (error instanceof ZodError) {
        throw new ValidationError(
          "Invalid stock count",
          ErrorCode.VALIDATION_ERROR,
          { errors: error.errors }
        );
      }
      if (
        (error as any)?.status === 404 ||
        (error as any)?.response?.status === 404
      ) {
        throw new NotFoundError(
          "Product not found",
          ErrorCode.PRODUCT_NOT_FOUND,
          { slug }
        );
      }
      throw error;
    }
  }

  /**
   * Update product status
   */
  async updateStatus(slug: string, status: string): Promise<ProductFE> {
    try {
      // Validate status
      const validatedData = StatusUpdateSchema.parse({ status });

      const response: any = await apiService.patch(
        PRODUCT_ROUTES.BY_SLUG(slug),
        {
          status: validatedData.status,
        }
      );
      return toFEProduct(response.data);
    } catch (error) {
      if (error instanceof ZodError) {
        throw new ValidationError(
          "Invalid product status",
          ErrorCode.VALIDATION_ERROR,
          { errors: error.errors }
        );
      }
      if (
        (error as any)?.status === 404 ||
        (error as any)?.response?.status === 404
      ) {
        throw new NotFoundError(
          "Product not found",
          ErrorCode.PRODUCT_NOT_FOUND,
          { slug }
        );
      }
      throw error;
    }
  }

  /**
   * Increment view count
   */
  async incrementView(slug: string): Promise<void> {
    await apiService.post(`${PRODUCT_ROUTES.BY_SLUG(slug)}/view`, {});
  }

  /**
   * Get featured products (returns FE cards)
   */
  async getFeatured(): Promise<ProductCardFE[]> {
    const endpoint = buildUrl(PRODUCT_ROUTES.LIST, {
      featured: true,
      status: "published",
      limit: 100,
    });
    const response = await apiService.get<PaginatedResponse<ProductListItemBE>>(
      endpoint
    );
    return toFEProductCards(response.data || []);
  }

  /**
   * Get homepage products (returns FE cards)
   */
  async getHomepage(): Promise<ProductCardFE[]> {
    const endpoint = buildUrl(PRODUCT_ROUTES.LIST, {
      featured: true,
      status: PRODUCT_STATUS.PUBLISHED,
      limit: PAGINATION.DEFAULT_PAGE_SIZE,
    });
    const response = await apiService.get<PaginatedResponse<ProductListItemBE>>(
      endpoint
    );
    return toFEProductCards(response.data || []);
  }

  /**
   * Bulk actions - supports: publish, unpublish, archive, feature, unfeature, update-stock, delete, update
   */
  async bulkAction(
    action: string,
    productIds: string[],
    data?: any
  ): Promise<BulkActionResponse> {
    try {
      // Validate bulk action inputs
      const validatedAction = BulkActionSchema.parse({
        action,
        productIds,
        data,
      });

      const response = await apiService.post<BulkActionResponse>(
        PRODUCT_ROUTES.BULK,
        {
          action: validatedAction.action,
          ids: validatedAction.productIds,
          updates: validatedAction.data,
        }
      );
      return response;
    } catch (error) {
      if (error instanceof ZodError) {
        throw new ValidationError(
          "Invalid bulk action data",
          ErrorCode.VALIDATION_ERROR,
          { errors: error.errors }
        );
      }
      logServiceError("Products", "bulkAction", error as Error);
      throw error;
    }
  }

  /**
   * Bulk publish products
   */
  async bulkPublish(productIds: string[]): Promise<BulkActionResponse> {
    return this.bulkAction("publish", productIds);
  }

  /**
   * Bulk unpublish products
   */
  async bulkUnpublish(productIds: string[]): Promise<BulkActionResponse> {
    return this.bulkAction("unpublish", productIds);
  }

  /**
   * Bulk archive products
   */
  async bulkArchive(productIds: string[]): Promise<BulkActionResponse> {
    return this.bulkAction("archive", productIds);
  }

  /**
   * Bulk feature products
   */
  async bulkFeature(productIds: string[]): Promise<BulkActionResponse> {
    return this.bulkAction("feature", productIds);
  }

  /**
   * Bulk unfeature products
   */
  async bulkUnfeature(productIds: string[]): Promise<BulkActionResponse> {
    return this.bulkAction("unfeature", productIds);
  }

  /**
   * Bulk update stock
   */
  async bulkUpdateStock(
    productIds: string[],
    stockCount: number
  ): Promise<BulkActionResponse> {
    return this.bulkAction("update-stock", productIds, { stockCount });
  }

  /**
   * Bulk delete products
   */
  async bulkDelete(productIds: string[]): Promise<BulkActionResponse> {
    return this.bulkAction("delete", productIds);
  }

  /**
   * Bulk update products
   */
  async bulkUpdate(
    productIds: string[],
    updates: Partial<ProductFormFE>
  ): Promise<BulkActionResponse> {
    return this.bulkAction("update", productIds, toBEProductUpdate(updates));
  }

  /**
   * Quick create for inline editing
   */
  async quickCreate(data: {
    name: string;
    price: number;
    stockCount: number;
    categoryId: string;
    status?: string;
    images?: string[];
  }): Promise<ProductFE> {
    const productBE = await apiService.post<ProductBE>(PRODUCT_ROUTES.LIST, {
      ...data,
      description: "",
      slug: data.name.toLowerCase().replace(/\s+/g, "-"),
    });
    return toFEProduct(productBE);
  }

  /**
   * Quick update for inline editing
   */
  async quickUpdate(slug: string, data: any): Promise<ProductFE> {
    try {
      // Validate using partial schema
      const validatedData = ProductFormSchema.partial().parse(data);

      const productBE = await apiService.patch<ProductBE>(
        PRODUCT_ROUTES.BY_SLUG(slug),
        validatedData
      );
      return toFEProduct(productBE);
    } catch (error) {
      if (error instanceof ZodError) {
        throw new ValidationError(
          "Invalid product update data",
          ErrorCode.VALIDATION_ERROR,
          { errors: error.errors }
        );
      }
      if (
        (error as any)?.status === 404 ||
        (error as any)?.response?.status === 404
      ) {
        throw new NotFoundError(
          "Product not found",
          ErrorCode.PRODUCT_NOT_FOUND,
          { slug }
        );
      }
      throw error;
    }
  }

  /**
   * Batch fetch products by IDs
   * Used for admin-curated featured sections
   */
  async getByIds(ids: string[]): Promise<ProductCardFE[]> {
    if (!ids || ids.length === 0) return [];
    try {
      const response: any = await apiService.post("/products/batch", { ids });
      return toFEProductCards(response.data || []);
    } catch (error) {
      this.handleError(error, "getByIds");
    }
  }
}

export const productsService = new ProductsService();
