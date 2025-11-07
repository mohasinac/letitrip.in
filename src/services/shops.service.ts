import { apiService } from './api.service';
import type { Shop, PaginatedResponse } from '@/types';

interface ShopFilters {
  verified?: boolean;
  featured?: boolean;
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
    
    return apiService.get<PaginatedResponse<Shop>>(endpoint);
  }

  // Get shop by ID
  async getById(id: string): Promise<Shop> {
    return apiService.get<Shop>(`/shops/${id}`);
  }

  // Create shop (seller/admin)
  async create(data: CreateShopData): Promise<Shop> {
    return apiService.post<Shop>('/shops', data);
  }

  // Update shop (owner/admin)
  async update(id: string, data: UpdateShopData): Promise<Shop> {
    return apiService.patch<Shop>(`/shops/${id}`, data);
  }

  // Delete shop (owner/admin)
  async delete(id: string): Promise<{ message: string }> {
    return apiService.delete<{ message: string }>(`/shops/${id}`);
  }

  // Verify shop (admin only)
  async verify(id: string, data: ShopVerificationData): Promise<Shop> {
    return apiService.patch<Shop>(`/shops/${id}/verify`, data);
  }

  // Ban/unban shop (admin only)
  async ban(id: string, data: ShopBanData): Promise<Shop> {
    return apiService.patch<Shop>(`/shops/${id}/ban`, data);
  }

  // Set feature flags (admin only)
  async setFeatureFlags(id: string, data: ShopFeatureData): Promise<Shop> {
    return apiService.patch<Shop>(`/shops/${id}/feature`, data);
  }

  // Get shop payments (owner/admin)
  async getPayments(id: string): Promise<any[]> {
    return apiService.get<any[]>(`/shops/${id}/payments`);
  }

  // Process payment (admin only)
  async processPayment(id: string, data: ShopPaymentData): Promise<any> {
    return apiService.post<any>(`/shops/${id}/payments`, data);
  }

  // Get shop statistics
  async getStats(id: string): Promise<any> {
    return apiService.get<any>(`/shops/${id}/stats`);
  }

  // Get shop by slug
  async getBySlug(slug: string): Promise<Shop> {
    return apiService.get<Shop>(`/shops/slug/${slug}`);
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
