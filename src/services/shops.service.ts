import { apiService } from './api.service';
import type { Shop, PaginatedResponse, Product } from '@/types';

interface ShopFilters {
  verified?: boolean;
  featured?: boolean;
  showOnHomepage?: boolean;
  banned?: boolean;
  search?: string;
  categories?: string[];
  minRating?: number;
  page?: number;
  limit?: number;
}

interface CreateShopData {
  name: string;
  slug: string;
  description?: string;
  email?: string;
  phone?: string;
  location?: string;
  address?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  categories?: string[];
  website?: string;
  facebook?: string;
  instagram?: string;
  twitter?: string;
  gst?: string;
  pan?: string;
  returnPolicy?: string;
  shippingPolicy?: string;
}

interface UpdateShopData extends Partial<CreateShopData> {
  logo?: string;
  banner?: string;
  bankDetails?: {
    accountHolderName: string;
    accountNumber: string;
    ifscCode: string;
    bankName: string;
    branchName?: string;
  };
  upiId?: string;
}

interface ShopVerificationData {
  isVerified: boolean;
  verificationNotes?: string;
}

interface ShopFeatureData {
  isFeatured: boolean;
  showOnHomepage: boolean;
}

interface ShopBanData {
  isBanned: boolean;
  banReason?: string;
}

interface ShopPaymentData {
  amount: number;
  description: string;
  dueDate?: Date;
}

class ShopsService {
  // List shops (filtered by role)
  async list(filters?: ShopFilters): Promise<PaginatedResponse<Shop>> {
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
    const endpoint = queryString ? `/shops?${queryString}` : '/shops';
    
    const res = await apiService.get<any>(endpoint);
    // Handle { success, shops } or { data } format
    return {
      data: res.shops || res.data || res,
      pagination: res.pagination || {
        page: 1,
        limit: 20,
        total: (res.shops || res.data || res).length,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      }
    };
  }

  // Get shop by slug
  async getBySlug(slug: string): Promise<Shop> {
    const res = await apiService.get<any>(`/shops/${slug}`);
    return res.data ?? res.shop ?? res;
  }

  // Create shop (seller/admin)
  async create(data: CreateShopData): Promise<Shop> {
    const res = await apiService.post<any>('/shops', data);
    return res.data ?? res.shop ?? res;
  }

  // Update shop (owner/admin)
  async update(slug: string, data: UpdateShopData): Promise<Shop> {
    const res = await apiService.patch<any>(`/shops/${slug}`, data);
    return res.data ?? res.shop ?? res;
  }

  // Delete shop (owner/admin)
  async delete(slug: string): Promise<{ message: string }> {
    return apiService.delete<{ message: string }>(`/shops/${slug}`);
  }

  // Verify shop (admin only)
  async verify(slug: string, data: ShopVerificationData): Promise<Shop> {
    return apiService.patch<Shop>(`/shops/${slug}/verify`, data);
  }

  // Ban/unban shop (admin only)
  async ban(slug: string, data: ShopBanData): Promise<Shop> {
    return apiService.patch<Shop>(`/shops/${slug}/ban`, data);
  }

  // Set feature flags (admin only)
  async setFeatureFlags(slug: string, data: ShopFeatureData): Promise<Shop> {
    return apiService.patch<Shop>(`/shops/${slug}/feature`, data);
  }

  // Get shop payments (owner/admin)
  async getPayments(slug: string): Promise<any[]> {
    return apiService.get<any[]>(`/shops/${slug}/payments`);
  }

  // Process payment (admin only)
  async processPayment(slug: string, data: ShopPaymentData): Promise<any> {
    return apiService.post<any>(`/shops/${slug}/payments`, data);
  }

  // Get shop statistics
  async getStats(slug: string): Promise<any> {
    return apiService.get<any>(`/shops/${slug}/stats`);
  }

  // Get products for a shop (supports pagination & basic filters)
  async getShopProducts(
    slug: string,
    options?: { page?: number; limit?: number; filters?: Record<string, any> }
  ): Promise<PaginatedResponse<Product>> {
    const params = new URLSearchParams();
    if (options?.page) params.append('page', String(options.page));
    if (options?.limit) params.append('limit', String(options.limit));
    if (options?.filters) {
      Object.entries(options.filters).forEach(([k, v]) => {
        if (v !== undefined && v !== null) params.append(k, String(v));
      });
    }

    const qs = params.toString();
    const endpoint = qs ? `/shops/${slug}/products?${qs}` : `/shops/${slug}/products`;
    const res = await apiService.get<any>(endpoint);

    return {
      data: res.products || res.data || res,
      pagination: res.pagination || {
        page: options?.page || 1,
        limit: options?.limit || 20,
        total: (res.products || res.data || res).length || 0,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      },
    } as PaginatedResponse<Product>;
  }
  
  // Get shop reviews (paginated)
  async getShopReviews(slug: string, page?: number, limit?: number): Promise<any> {
    const params = new URLSearchParams();
    if (page) params.append('page', String(page));
    if (limit) params.append('limit', String(limit));
    const qs = params.toString();
    const endpoint = qs ? `/shops/${slug}/reviews?${qs}` : `/shops/${slug}/reviews`;
    return apiService.get<any>(endpoint);
  }

  // Follow shop (user feature)
  async follow(slug: string): Promise<{ message: string }> {
    return apiService.post<{ message: string }>(`/shops/${slug}/follow`, {});
  }

  // Unfollow shop (user feature)
  async unfollow(slug: string): Promise<{ message: string }> {
    return apiService.delete<{ message: string }>(`/shops/${slug}/follow`);
  }

  // Check if following shop
  async checkFollowing(slug: string): Promise<{ isFollowing: boolean }> {
    return apiService.get<{ isFollowing: boolean }>(`/shops/${slug}/follow`);
  }

  // Get following shops list
  async getFollowing(): Promise<{ shops: Shop[]; count: number }> {
    return apiService.get<{ shops: Shop[]; count: number }>('/shops/following');
  }

  // Get featured shops
  async getFeatured(): Promise<Shop[]> {
    const res = await apiService.get<any>('/shops?featured=true&verified=true&limit=100');
    return res.shops || res.data || res;
  }

  // Get homepage shops
  async getHomepage(): Promise<Shop[]> {
    const res = await apiService.get<any>('/shops?featured=true&verified=true&limit=20');
    return res.shops || res.data || res;
  }
}

export const shopsService = new ShopsService();
export type {
  ShopFilters,
  CreateShopData,
  UpdateShopData,
  ShopVerificationData,
  ShopFeatureData,
  ShopBanData,
  ShopPaymentData,
};
