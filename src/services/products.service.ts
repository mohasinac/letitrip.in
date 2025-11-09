import { apiService } from './api.service';
import { PRODUCT_ROUTES, buildUrl } from '@/constants/api-routes';
import type {
  Product,
  ProductCondition,
  ProductStatus,
  ProductSpecification,
  ProductVariant,
  ProductDimensions,
  PaginatedResponse,
} from '@/types';

interface ProductFilters {
  shopId?: string;
  categoryId?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: ProductCondition;
  brand?: string;
  manufacturer?: string;
  status?: ProductStatus;
  inStock?: boolean;
  isFeatured?: boolean;
  showOnHomepage?: boolean;
  minRating?: number;
  tags?: string[];
  page?: number;
  limit?: number;
  sortBy?: 'price' | 'rating' | 'sales' | 'views' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

interface CreateProductData {
  shopId: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  price: number;
  originalPrice?: number;
  costPrice?: number;
  stockCount: number;
  lowStockThreshold: number;
  sku?: string;
  condition: ProductCondition;
  brand?: string;
  manufacturer?: string;
  countryOfOrigin: string;
  specifications?: ProductSpecification[];
  variants?: ProductVariant[];
  dimensions?: ProductDimensions;
  shippingClass?: 'standard' | 'express' | 'heavy' | 'fragile';
  tags?: string[];
  isReturnable: boolean;
  returnWindowDays: number;
  warranty?: string;
  metaTitle?: string;
  metaDescription?: string;
  publishDate?: Date;
  status: ProductStatus;
}

interface UpdateProductData extends Partial<CreateProductData> {
  images?: string[];
  videos?: string[];
  isFeatured?: boolean;
  showOnHomepage?: boolean;
}

class ProductsService {
  // List products (role-filtered)
  async list(filters?: ProductFilters): Promise<PaginatedResponse<Product>> {
    const endpoint = buildUrl(PRODUCT_ROUTES.LIST, filters);
    return apiService.get<PaginatedResponse<Product>>(endpoint);
  }

  // Get product by ID
  async getById(id: string): Promise<Product> {
    return apiService.get<Product>(PRODUCT_ROUTES.BY_ID(id));
  }

  // Get product by slug
  async getBySlug(slug: string): Promise<Product> {
    const res = await apiService.get<any>(PRODUCT_ROUTES.BY_SLUG(slug));
    return res.data ?? res; // tolerate both shapes
  }

  // Create product (seller/admin)
  async create(data: CreateProductData): Promise<Product> {
    const res = await apiService.post<any>(PRODUCT_ROUTES.LIST, data);
    return res.data ?? res;
  }

  // Update product (owner/admin)
  async update(slug: string, data: UpdateProductData): Promise<Product> {
    const res = await apiService.patch<any>(PRODUCT_ROUTES.BY_SLUG(slug), data);
    return res.data ?? res;
  }

  // Delete product (owner/admin)
  async delete(slug: string): Promise<{ message: string }> {
    return apiService.delete<{ message: string }>(PRODUCT_ROUTES.BY_SLUG(slug));
  }

  // Get product reviews
  async getReviews(slug: string, page?: number, limit?: number): Promise<any> {
    const endpoint = buildUrl(PRODUCT_ROUTES.REVIEWS(slug), { page, limit });
    return apiService.get<any>(endpoint);
  }

  // Get product variants (same leaf category)
  async getVariants(slug: string): Promise<Product[]> {
    const res = await apiService.get<any>(`${PRODUCT_ROUTES.BY_SLUG(slug)}/variants`);
    return res.data || [];
  }

  // Get similar products
  async getSimilar(slug: string, limit?: number): Promise<Product[]> {
    const endpoint = buildUrl(`${PRODUCT_ROUTES.BY_SLUG(slug)}/similar`, { limit });
    const res = await apiService.get<any>(endpoint);
    return res.data || [];
  }

  // Get seller's other products
  async getSellerProducts(slug: string, limit?: number): Promise<Product[]> {
    const endpoint = buildUrl(`${PRODUCT_ROUTES.BY_SLUG(slug)}/seller-items`, { limit });
    const res = await apiService.get<any>(endpoint);
    return res.data || [];
  }

  // Update product stock
  async updateStock(slug: string, stockCount: number): Promise<Product> {
    return apiService.patch<Product>(PRODUCT_ROUTES.BY_SLUG(slug), { stockCount });
  }

  // Update product status
  async updateStatus(slug: string, status: ProductStatus): Promise<Product> {
    return apiService.patch<Product>(PRODUCT_ROUTES.BY_SLUG(slug), { status });
  }

  // Increment view count
  async incrementView(slug: string): Promise<void> {
    await apiService.post(`${PRODUCT_ROUTES.BY_SLUG(slug)}/view`, {});
  }

  // Get featured products
  async getFeatured(): Promise<Product[]> {
    const endpoint = buildUrl(PRODUCT_ROUTES.LIST, { 
      isFeatured: true, 
      status: 'published', 
      limit: 100 
    });
    const res = await apiService.get<any>(endpoint);
    return res.data || res.products || res;
  }

  // Get homepage products
  async getHomepage(): Promise<Product[]> {
    const endpoint = buildUrl(PRODUCT_ROUTES.LIST, { 
      isFeatured: true, 
      status: 'published', 
      limit: 20 
    });
    const res = await apiService.get<any>(endpoint);
    return res.data || res.products || res;
  }
}

export const productsService = new ProductsService();
export type { ProductFilters, CreateProductData, UpdateProductData };
