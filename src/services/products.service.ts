import { apiService } from './api.service';
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
  status?: ProductStatus;
  inStock?: boolean;
  isFeatured?: boolean;
  showOnHomepage?: boolean;
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
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v.toString()));
          } else {
            params.append(key, value.toString());
          }
        }
      });
    }

    const queryString = params.toString();
    const endpoint = queryString ? `/products?${queryString}` : '/products';
    
    return apiService.get<PaginatedResponse<Product>>(endpoint);
  }

  // Get product by ID
  async getById(id: string): Promise<Product> {
    return apiService.get<Product>(`/products/${id}`);
  }

  // Get product by slug
  async getBySlug(slug: string): Promise<Product> {
    const res = await apiService.get<any>(`/products/${slug}`);
    return res.data ?? res; // tolerate both shapes
  }

  // Create product (seller/admin)
  async create(data: CreateProductData): Promise<Product> {
    const res = await apiService.post<any>('/products', data);
    return res.data ?? res;
  }

  // Update product (owner/admin)
  async update(slug: string, data: UpdateProductData): Promise<Product> {
    const res = await apiService.patch<any>(`/products/${slug}`, data);
    return res.data ?? res;
  }

  // Delete product (owner/admin)
  async delete(slug: string): Promise<{ message: string }> {
    return apiService.delete<{ message: string }>(`/products/${slug}`);
  }

  // Get product reviews
  async getReviews(slug: string, page?: number, limit?: number): Promise<any> {
    const params = new URLSearchParams();
    if (page) params.append('page', page.toString());
    if (limit) params.append('limit', limit.toString());
    const qs = params.toString();
    const endpoint = qs ? `/products/${slug}/reviews?${qs}` : `/products/${slug}/reviews`;
    return apiService.get<any>(endpoint);
  }

  // Get product variants (same leaf category)
  async getVariants(slug: string): Promise<Product[]> {
    const res = await apiService.get<any>(`/products/${slug}/variants`);
    return res.data || [];
  }

  // Get similar products
  async getSimilar(slug: string, limit?: number): Promise<Product[]> {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    const qs = params.toString();
    const endpoint = qs ? `/products/${slug}/similar?${qs}` : `/products/${slug}/similar`;
    const res = await apiService.get<any>(endpoint);
    return res.data || [];
  }

  // Get seller's other products
  async getSellerProducts(slug: string, limit?: number): Promise<Product[]> {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    const qs = params.toString();
    const endpoint = qs ? `/products/${slug}/seller-items?${qs}` : `/products/${slug}/seller-items`;
    const res = await apiService.get<any>(endpoint);
    return res.data || [];
  }

  // Update product stock
  async updateStock(slug: string, stockCount: number): Promise<Product> {
    return apiService.patch<Product>(`/products/${slug}`, { stockCount });
  }

  // Update product status
  async updateStatus(slug: string, status: ProductStatus): Promise<Product> {
    return apiService.patch<Product>(`/products/${slug}`, { status });
  }

  // Increment view count
  async incrementView(slug: string): Promise<void> {
    await apiService.post(`/products/${slug}/view`, {});
  }

  // Get featured products
  async getFeatured(): Promise<Product[]> {
    const res = await apiService.get<any>('/products?isFeatured=true&status=published&limit=100');
    return res.data || res.products || res;
  }

  // Get homepage products
  async getHomepage(): Promise<Product[]> {
    const res = await apiService.get<any>('/products?isFeatured=true&status=published&limit=20');
    return res.data || res.products || res;
  }
}

export const productsService = new ProductsService();
export type { ProductFilters, CreateProductData, UpdateProductData };
