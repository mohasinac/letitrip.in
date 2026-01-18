/**
 * Product Service Adapter
 *
 * Adapts products.service.ts for use with @letitrip/react-library components.
 *
 * @example
 * import { ProductServiceAdapter } from '@/lib/adapters/product-adapter';
 * import { ProductList } from '@letitrip/react-library';
 *
 * const adapter = new ProductServiceAdapter();
 *
 * <ProductList service={adapter} />
 */

import { productsService } from "@/services/products.service";
import type { ProductCardFE, ProductFE } from "@/types/frontend/product.types";
import type { PaginatedResponse } from "@/types/shared/pagination.types";
import { ServiceAdapter } from "./service-adapter";
import type { ListQueryParams, ServiceAdapterOptions } from "./types";

/**
 * Product service interface for library components
 * Library components depend on this interface, not the concrete implementation
 */
export interface IProductService {
  /**
   * Get paginated list of products
   */
  getProducts(
    params?: ListQueryParams,
  ): Promise<PaginatedResponse<ProductCardFE>>;

  /**
   * Get single product by slug
   */
  getProduct(slug: string): Promise<ProductFE>;

  /**
   * Search products
   */
  searchProducts(
    query: string,
    params?: ListQueryParams,
  ): Promise<PaginatedResponse<ProductCardFE>>;

  /**
   * Get products by category
   */
  getProductsByCategory(
    categorySlug: string,
    params?: ListQueryParams,
  ): Promise<PaginatedResponse<ProductCardFE>>;

  /**
   * Get products by shop
   */
  getProductsByShop(
    shopSlug: string,
    params?: ListQueryParams,
  ): Promise<PaginatedResponse<ProductCardFE>>;

  /**
   * Get featured products
   */
  getFeaturedProducts(limit?: number): Promise<ProductCardFE[]>;

  /**
   * Get similar products
   */
  getSimilarProducts(
    productSlug: string,
    limit?: number,
  ): Promise<ProductCardFE[]>;
}

/**
 * Product Service Adapter
 * Implements IProductService using the app's products.service
 */
export class ProductServiceAdapter
  extends ServiceAdapter<ProductCardFE>
  implements IProductService
{
  constructor(options?: ServiceAdapterOptions) {
    super(options);
  }

  async getProducts(
    params?: ListQueryParams,
  ): Promise<PaginatedResponse<ProductCardFE>> {
    return this.execute(
      () =>
        productsService.getProducts({
          page: params?.page,
          limit: params?.limit,
          sortBy: params?.sortBy,
          sortOrder: params?.sortOrder,
          search: params?.search,
          ...params?.filters,
        }),
      "Failed to fetch products",
    );
  }

  async getProduct(slug: string): Promise<ProductFE> {
    return this.execute(
      () => productsService.getProduct(slug),
      `Failed to fetch product: ${slug}`,
    );
  }

  async searchProducts(
    query: string,
    params?: ListQueryParams,
  ): Promise<PaginatedResponse<ProductCardFE>> {
    return this.execute(
      () =>
        productsService.searchProducts(query, {
          page: params?.page,
          limit: params?.limit,
        }),
      "Failed to search products",
    );
  }

  async getProductsByCategory(
    categorySlug: string,
    params?: ListQueryParams,
  ): Promise<PaginatedResponse<ProductCardFE>> {
    return this.execute(
      () =>
        productsService.getProductsByCategory(categorySlug, {
          page: params?.page,
          limit: params?.limit,
          sortBy: params?.sortBy,
          sortOrder: params?.sortOrder,
        }),
      `Failed to fetch products for category: ${categorySlug}`,
    );
  }

  async getProductsByShop(
    shopSlug: string,
    params?: ListQueryParams,
  ): Promise<PaginatedResponse<ProductCardFE>> {
    return this.execute(
      () =>
        productsService.getProductsByShop(shopSlug, {
          page: params?.page,
          limit: params?.limit,
        }),
      `Failed to fetch products for shop: ${shopSlug}`,
    );
  }

  async getFeaturedProducts(limit: number = 10): Promise<ProductCardFE[]> {
    const response = await this.execute(
      () =>
        productsService.getProducts({
          featured: true,
          limit,
          page: 1,
        }),
      "Failed to fetch featured products",
    );
    return response.data;
  }

  async getSimilarProducts(
    productSlug: string,
    limit: number = 6,
  ): Promise<ProductCardFE[]> {
    const response = await this.execute(
      () => productsService.getSimilarProducts(productSlug, limit),
      `Failed to fetch similar products for: ${productSlug}`,
    );
    return response;
  }

  protected transformResponse(data: any): ProductCardFE {
    // Transform if needed, or return as-is if service already returns correct format
    return data;
  }
}

// Export singleton instance for convenience
export const productServiceAdapter = new ProductServiceAdapter();

export default ProductServiceAdapter;
