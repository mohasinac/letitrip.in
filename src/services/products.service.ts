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
    const beFilters: Partial<ProductFiltersBE> = {
      shopId: filters?.shopId,
      categoryId: filters?.categoryId,
      search: filters?.search,
      priceMin: filters?.priceRange?.min,
      priceMax: filters?.priceRange?.max,
      status: filters?.status?.[0],
      inStock: filters?.inStock,
      isFeatured: filters?.isFeatured,
      page: 1,
      limit: 20,
    };

    const endpoint = buildUrl(PRODUCT_ROUTES.LIST, beFilters);
    const response = await apiService.get<PaginatedResponse<ProductListItemBE>>(
      endpoint
    );

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
    const productBE = await apiService.get<ProductBE>(PRODUCT_ROUTES.BY_ID(id));
    return toFEProduct(productBE);
  }

  /**
   * Get product by slug (returns full UI-optimized product)
   */
  async getBySlug(slug: string): Promise<ProductFE> {
    const productBE = await apiService.get<ProductBE>(
      PRODUCT_ROUTES.BY_SLUG(slug)
    );
    return toFEProduct(productBE);
  }

  /**
   * Create product (accepts form data, returns created product)
   */
  async create(formData: ProductFormFE): Promise<ProductFE> {
    const createRequest = toBEProductCreate(formData);
    const productBE = await apiService.post<ProductBE>(
      PRODUCT_ROUTES.LIST,
      createRequest
    );
    return toFEProduct(productBE);
  }

  /**
   * Update product (accepts partial form data)
   */
  async update(
    slug: string,
    formData: Partial<ProductFormFE>
  ): Promise<ProductFE> {
    const updateRequest = toBEProductUpdate(formData);
    const productBE = await apiService.patch<ProductBE>(
      PRODUCT_ROUTES.BY_SLUG(slug),
      updateRequest
    );
    return toFEProduct(productBE);
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
    const response = await apiService.get<ProductListItemBE[]>(
      `${PRODUCT_ROUTES.BY_SLUG(slug)}/variants`
    );
    return toFEProductCards(response);
  }

  /**
   * Get similar products (returns FE types)
   */
  async getSimilar(slug: string, limit?: number): Promise<ProductCardFE[]> {
    const endpoint = buildUrl(`${PRODUCT_ROUTES.BY_SLUG(slug)}/similar`, {
      limit,
    });
    const response = await apiService.get<ProductListItemBE[]>(endpoint);
    return toFEProductCards(response);
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
    const response = await apiService.get<ProductListItemBE[]>(endpoint);
    return toFEProductCards(response);
  }

  /**
   * Update product stock
   */
  async updateStock(slug: string, stockCount: number): Promise<ProductFE> {
    const productBE = await apiService.patch<ProductBE>(
      PRODUCT_ROUTES.BY_SLUG(slug),
      { stockCount }
    );
    return toFEProduct(productBE);
  }

  /**
   * Update product status
   */
  async updateStatus(slug: string, status: string): Promise<ProductFE> {
    const productBE = await apiService.patch<ProductBE>(
      PRODUCT_ROUTES.BY_SLUG(slug),
      { status }
    );
    return toFEProduct(productBE);
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
      isFeatured: true,
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
      isFeatured: true,
      status: "published",
      limit: 20,
    });
    const response = await apiService.get<PaginatedResponse<ProductListItemBE>>(
      endpoint
    );
    return toFEProductCards(response.data || []);
  }

  /**
   * Bulk actions for seller dashboard
   */
  async bulkAction(
    action: string,
    ids: string[],
    input?: any
  ): Promise<{ success: boolean }> {
    return apiService.post("/api/seller/products/bulk", { action, ids, input });
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
    const productBE = await apiService.post<ProductBE>("/api/seller/products", {
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
      `/api/products/${slug}`,
      data
    );
    return toFEProduct(productBE);
  }
}

export const productsService = new ProductsService();
