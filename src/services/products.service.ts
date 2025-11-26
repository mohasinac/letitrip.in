import { apiService } from "./api.service";
import { PRODUCT_ROUTES, buildUrl } from "@/constants/api-routes";
import { ProductBE, ProductListItemBE } from "@/types/backend/product.types";
import {
  ProductFE,
  ProductCardFE,
  ProductFormFE,
  ProductFiltersFE,
} from "@/types/frontend/product.types";
import {
  toFEProduct,
  toFEProductCards,
  toBEProductCreate,
  toBEProductUpdate,
} from "@/types/transforms/product.transforms";
import type { PaginatedResponse } from "@/types/shared/pagination.types";
import type { BulkActionResponse } from "@/types/shared/common.types";
import { logServiceError } from "@/lib/error-logger";
import { getUserFriendlyError } from "@/components/common/ErrorMessage";

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
    const friendlyMessage = getUserFriendlyError(error);

    // Create enhanced error with friendly message
    const enhancedError: any = new Error(friendlyMessage);
    enhancedError.originalError = error;
    enhancedError.context = context;

    throw enhancedError;
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
      return toFEProduct(response.data);
    } catch (error) {
      this.handleError(error, `getById(${id})`);
    }
  }

  /**
   * Get product by slug (returns full UI-optimized product)
   */
  async getBySlug(slug: string): Promise<ProductFE> {
    try {
      const response: any = await apiService.get(PRODUCT_ROUTES.BY_SLUG(slug));
      return toFEProduct(response.data);
    } catch (error) {
      this.handleError(error, `getBySlug(${slug})`);
    }
  }

  /**
   * Create product (accepts form data, returns created product)
   */
  async create(formData: ProductFormFE): Promise<ProductFE> {
    try {
      const createRequest = toBEProductCreate(formData);
      const response: any = await apiService.post(
        PRODUCT_ROUTES.LIST,
        createRequest
      );
      return toFEProduct(response.data);
    } catch (error) {
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
      const updateRequest = toBEProductUpdate(formData);
      const response: any = await apiService.patch(
        PRODUCT_ROUTES.BY_SLUG(slug),
        updateRequest
      );
      return toFEProduct(response.data);
    } catch (error) {
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
    const response: any = await apiService.patch(PRODUCT_ROUTES.BY_SLUG(slug), {
      stockCount,
    });
    return toFEProduct(response.data);
  }

  /**
   * Update product status
   */
  async updateStatus(slug: string, status: string): Promise<ProductFE> {
    const response: any = await apiService.patch(PRODUCT_ROUTES.BY_SLUG(slug), {
      status,
    });
    return toFEProduct(response.data);
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
      status: "published",
      limit: 20,
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
      const response = await apiService.post<BulkActionResponse>(
        PRODUCT_ROUTES.BULK,
        {
          action,
          ids: productIds,
          updates: data,
        }
      );
      return response;
    } catch (error) {
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
    const productBE = await apiService.patch<ProductBE>(
      PRODUCT_ROUTES.BY_SLUG(slug),
      data
    );
    return toFEProduct(productBE);
  }
}

export const productsService = new ProductsService();
