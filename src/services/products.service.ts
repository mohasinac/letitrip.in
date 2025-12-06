/**
 * @fileoverview Products Service - Extends BaseService
 * @module src/services/products.service
 * @description Product management service with CRUD operations
 *
 * @pattern BaseService - Inherits common CRUD operations
 * @created 2025-12-05
 * @refactored 2026-01-08 - Migrated to BaseService pattern
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

import { PRODUCT_ROUTES, buildUrl } from "@/constants/api-routes";
import { PAGINATION } from "@/constants/limits";
import { PRODUCT_STATUS } from "@/constants/statuses";
import { logServiceError } from "@/lib/error-logger";
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
import { apiService } from "./api.service";
import { BaseService } from "./base.service";

/**
 * Products Service
 * Extends BaseService for common CRUD operations
 * Adds product-specific methods (reviews, variants, stock management, etc.)
 */
class ProductsService extends BaseService<
  ProductBE,
  ProductFE,
  ProductFormFE,
  ProductFiltersFE
> {
  protected endpoint = PRODUCT_ROUTES.LIST;
  protected entityName = "Product";

  protected toBE(form: ProductFormFE): Partial<ProductBE> {
    return toBEProductCreate(form) as Partial<ProductBE>;
  }

  protected toFE(be: ProductBE): ProductFE {
    return toFEProduct(be);
  }
  // Note: list(), getById(), create(), update(), delete() inherited from BaseService

  /**
   * Override list to transform to ProductCardFE instead of ProductFE
   */
  async list(
    filters?: ProductFiltersFE
  ): Promise<{ data: ProductCardFE[]; count: number; pagination: any }> {
    try {
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
   * Get product by slug (products use slug instead of ID)
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
    /** Slug */
    slug: string,
    /** Limit */
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
      /** Featured */
      featured: true,
      /** Status */
      status: "published",
      /** Limit */
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
      /** Featured */
      featured: true,
      /** Status */
      status: PRODUCT_STATUS.PUBLISHED,
      /** Limit */
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
    /** Action */
    action: string,
    /** Product Ids */
    productIds: string[],
    /** Data */
    data?: any
  ): Promise<BulkActionResponse> {
    try {
      const response = await apiService.post<BulkActionResponse>(
        PRODUCT_ROUTES.BULK,
        {
          action,
          /** Ids */
          ids: productIds,
          /** Updates */
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
    /** Product Ids */
    productIds: string[],
    /** Stock Count */
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
    /** Product Ids */
    productIds: string[],
    /** Updates */
    updates: Partial<ProductFormFE>
  ): Promise<BulkActionResponse> {
    return this.bulkAction("update", productIds, toBEProductUpdate(updates));
  }

  /**
   * Quick create for inline editing
   */
  async quickCreate(data: {
    /** Name */
    name: string;
    /** Price */
    price: number;
    /** Stock Count */
    stockCount: number;
    /** Category Id */
    categoryId: string;
    /** Status */
    status?: string;
    /** Images */
    images?: string[];
  }): Promise<ProductFE> {
    const productBE = await apiService.post<ProductBE>(PRODUCT_ROUTES.LIST, {
      ...data,
      /** Description */
      description: "",
      /** Slug */
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
