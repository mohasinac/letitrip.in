import { apiService } from "./api.service";
import { PRODUCT_ROUTES, buildUrl } from "@/constants/api-routes";
import {
  ProductBE,
  ProductListItemBE,
  CreateProductRequestBE,
  UpdateProductRequestBE,
  ProductFiltersBE,
} from "@/types/backend/product.types";
import {
  ProductFE,
  ProductCardFE,
  ProductFormFE,
  ProductFiltersFE,
} from "@/types/frontend/product.types";
import {
  toFEProduct,
  toFEProductCard,
  toFEProducts,
  toFEProductCards,
  toBEProductCreate,
  toBEProductUpdate,
} from "@/types/transforms/product.transforms";
import type { PaginatedResponse } from "@/types/shared/pagination.types";

/**
 * Products Service - Reference Implementation
 *
 * This service uses the new type system with automatic FE/BE transformation.
 * All methods return FE types for components, and accept FE types for forms.
 */
class ProductsService {
  /**
   * List products with filters (returns UI-optimized types)
   */
  async list(
    filters?: ProductFiltersFE
  ): Promise<{ products: ProductCardFE[]; pagination: any }> {
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
      products: toFEProductCards(response.data || []),
      pagination: response.pagination,
    };
  }

  /**
   * Get product by ID (returns full UI-optimized product)
   */
  async getById(id: string): Promise<ProductFE> {
    const response: any = await apiService.get(PRODUCT_ROUTES.BY_ID(id));
    return toFEProduct(response.data);
  }

  /**
   * Get product by slug (returns full UI-optimized product)
   */
  async getBySlug(slug: string): Promise<ProductFE> {
    const response: any = await apiService.get(PRODUCT_ROUTES.BY_SLUG(slug));
    return toFEProduct(response.data);
  }

  /**
   * Create product (accepts form data, returns created product)
   */
  async create(formData: ProductFormFE): Promise<ProductFE> {
    const createRequest = toBEProductCreate(formData);
    const response: any = await apiService.post(
      PRODUCT_ROUTES.LIST,
      createRequest
    );
    return toFEProduct(response.data);
  }

  /**
   * Update product (accepts partial form data)
   */
  async update(
    slug: string,
    formData: Partial<ProductFormFE>
  ): Promise<ProductFE> {
    const updateRequest = toBEProductUpdate(formData);
    const response: any = await apiService.patch(
      PRODUCT_ROUTES.BY_SLUG(slug),
      updateRequest
    );
    return toFEProduct(response.data);
  }

  /**
   * Delete product
   */
  async delete(slug: string): Promise<{ message: string }> {
    return apiService.delete<{ message: string }>(PRODUCT_ROUTES.BY_SLUG(slug));
  }

  /**
   * Get product reviews
   */
  async getReviews(slug: string, page?: number, limit?: number): Promise<any> {
    const endpoint = buildUrl(PRODUCT_ROUTES.REVIEWS(slug), { page, limit });
    return apiService.get<any>(endpoint);
  }

  /**
   * Get product variants (returns FE types)
   */
  async getVariants(slug: string): Promise<ProductCardFE[]> {
    const response: any = await apiService.get(
      `${PRODUCT_ROUTES.BY_SLUG(slug)}/variants`
    );
    return toFEProductCards(response.data || []);
  }

  /**
   * Get similar products (returns FE types)
   */
  async getSimilar(slug: string, limit?: number): Promise<ProductCardFE[]> {
    const endpoint = buildUrl(`${PRODUCT_ROUTES.BY_SLUG(slug)}/similar`, {
      limit,
    });
    const response: any = await apiService.get(endpoint);
    return toFEProductCards(response.data || []);
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
  ): Promise<{ success: boolean; results: any[] }> {
    return apiService.post(PRODUCT_ROUTES.BULK, {
      action,
      productIds,
      data,
    });
  }

  /**
   * Bulk publish products
   */
  async bulkPublish(
    productIds: string[]
  ): Promise<{ success: boolean; results: any[] }> {
    return this.bulkAction("publish", productIds);
  }

  /**
   * Bulk unpublish products
   */
  async bulkUnpublish(
    productIds: string[]
  ): Promise<{ success: boolean; results: any[] }> {
    return this.bulkAction("unpublish", productIds);
  }

  /**
   * Bulk archive products
   */
  async bulkArchive(
    productIds: string[]
  ): Promise<{ success: boolean; results: any[] }> {
    return this.bulkAction("archive", productIds);
  }

  /**
   * Bulk feature products
   */
  async bulkFeature(
    productIds: string[]
  ): Promise<{ success: boolean; results: any[] }> {
    return this.bulkAction("feature", productIds);
  }

  /**
   * Bulk unfeature products
   */
  async bulkUnfeature(
    productIds: string[]
  ): Promise<{ success: boolean; results: any[] }> {
    return this.bulkAction("unfeature", productIds);
  }

  /**
   * Bulk update stock
   */
  async bulkUpdateStock(
    productIds: string[],
    stockCount: number
  ): Promise<{ success: boolean; results: any[] }> {
    return this.bulkAction("update-stock", productIds, { stockCount });
  }

  /**
   * Bulk delete products
   */
  async bulkDelete(
    productIds: string[]
  ): Promise<{ success: boolean; results: any[] }> {
    return this.bulkAction("delete", productIds);
  }

  /**
   * Bulk update products
   */
  async bulkUpdate(
    productIds: string[],
    updates: Partial<ProductFormFE>
  ): Promise<{ success: boolean; results: any[] }> {
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
