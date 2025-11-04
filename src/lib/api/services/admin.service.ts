/**
 * Admin Service
 * Handles all admin-specific API operations
 */

import { apiClient } from "../client";
import type { Product } from "./product.service";
import type { Order } from "./order.service";
import type { Review } from "./review.service";

// ============================================
// Admin User Types
// ============================================

export interface AdminUser {
  id: string;
  email: string;
  displayName?: string;
  role: 'user' | 'seller' | 'admin';
  isActive: boolean;
  isBanned: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// Admin Stats Types
// ============================================

export interface AdminProductStats {
  total: number;
  active: number;
  draft: number;
  archived: number;
  lowStock: number;
  outOfStock: number;
  totalValue: number;
}

export interface AdminOrderStats {
  total: number;
  pending: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
  totalRevenue: number;
}

// ============================================
// Admin Settings Types
// ============================================

export interface SiteSettings {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  supportEmail: string;
  logoUrl?: string;
  faviconUrl?: string;
  currency: string;
  timezone: string;
  maintenanceMode: boolean;
}

export interface HeroSettings {
  enabled: boolean;
  autoPlay: boolean;
  interval: number;
  showDots: boolean;
  showArrows: boolean;
}

export interface HeroSlide {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  linkUrl?: string;
  buttonText?: string;
  order: number;
  isActive: boolean;
}

export interface ThemeSettings {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  darkMode: boolean;
}

// ============================================
// Admin Bulk Operation Types
// ============================================

export interface BulkOperation {
  id: string;
  type: 'product_update' | 'product_delete' | 'order_update' | 'user_update';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  totalItems: number;
  processedItems: number;
  failedItems: number;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// Admin Service Class
// ============================================

export class AdminService {
  // ============================================
  // Product Management
  // ============================================

  /**
   * Get all products (admin view)
   */
  static async getProducts(filters?: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ products: Product[]; total: number }> {
    try {
      const params = new URLSearchParams();
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, String(value));
          }
        });
      }

      const response = await apiClient.get<{ products: Product[]; total: number }>(
        `/api/admin/products?${params.toString()}`
      );
      
      return response;
    } catch (error) {
      console.error("AdminService.getProducts error:", error);
      throw error;
    }
  }

  /**
   * Get product statistics
   */
  static async getProductStats(): Promise<AdminProductStats> {
    try {
      const response = await apiClient.get<AdminProductStats>(
        '/api/admin/products/stats'
      );
      return response;
    } catch (error) {
      console.error("AdminService.getProductStats error:", error);
      throw error;
    }
  }

  // ============================================
  // Order Management
  // ============================================

  /**
   * Get all orders (admin view)
   */
  static async getOrders(filters?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ orders: Order[]; total: number }> {
    try {
      const params = new URLSearchParams();
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, String(value));
          }
        });
      }

      const response = await apiClient.get<{ orders: Order[]; total: number }>(
        `/api/admin/orders?${params.toString()}`
      );
      
      return response;
    } catch (error) {
      console.error("AdminService.getOrders error:", error);
      throw error;
    }
  }

  /**
   * Get order statistics
   */
  static async getOrderStats(): Promise<AdminOrderStats> {
    try {
      const response = await apiClient.get<AdminOrderStats>(
        '/api/admin/orders/stats'
      );
      return response;
    } catch (error) {
      console.error("AdminService.getOrderStats error:", error);
      throw error;
    }
  }

  /**
   * Cancel order (admin)
   */
  static async cancelOrder(orderId: string, reason: string): Promise<void> {
    try {
      await apiClient.post<void>(`/api/admin/orders/${orderId}/cancel`, { reason });
    } catch (error) {
      console.error("AdminService.cancelOrder error:", error);
      throw error;
    }
  }

  // ============================================
  // User Management
  // ============================================

  /**
   * Get all users
   */
  static async getUsers(filters?: {
    role?: string;
    page?: number;
    limit?: number;
  }): Promise<{ users: AdminUser[]; total: number }> {
    try {
      const params = new URLSearchParams();
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, String(value));
          }
        });
      }

      const response = await apiClient.get<{ users: AdminUser[]; total: number }>(
        `/api/admin/users?${params.toString()}`
      );
      
      return response;
    } catch (error) {
      console.error("AdminService.getUsers error:", error);
      throw error;
    }
  }

  /**
   * Search users
   */
  static async searchUsers(query: string): Promise<AdminUser[]> {
    try {
      const response = await apiClient.get<AdminUser[]>(
        `/api/admin/users/search?q=${encodeURIComponent(query)}`
      );
      return response;
    } catch (error) {
      console.error("AdminService.searchUsers error:", error);
      throw error;
    }
  }

  /**
   * Get user by ID
   */
  static async getUser(userId: string): Promise<AdminUser> {
    try {
      const response = await apiClient.get<AdminUser>(`/api/admin/users/${userId}`);
      return response;
    } catch (error) {
      console.error("AdminService.getUser error:", error);
      throw error;
    }
  }

  /**
   * Update user role
   */
  static async updateUserRole(userId: string, role: string): Promise<void> {
    try {
      await apiClient.put<void>(`/api/admin/users/${userId}/role`, { role });
    } catch (error) {
      console.error("AdminService.updateUserRole error:", error);
      throw error;
    }
  }

  /**
   * Ban/Unban user
   */
  static async toggleUserBan(userId: string, banned: boolean): Promise<void> {
    try {
      await apiClient.put<void>(`/api/admin/users/${userId}/ban`, { banned });
    } catch (error) {
      console.error("AdminService.toggleUserBan error:", error);
      throw error;
    }
  }

  // ============================================
  // Review Management
  // ============================================

  /**
   * Get all reviews (admin view)
   */
  static async getReviews(filters?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ reviews: Review[]; total: number }> {
    try {
      const params = new URLSearchParams();
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, String(value));
          }
        });
      }

      const response = await apiClient.get<{ reviews: Review[]; total: number }>(
        `/api/admin/reviews?${params.toString()}`
      );
      
      return response;
    } catch (error) {
      console.error("AdminService.getReviews error:", error);
      throw error;
    }
  }

  // ============================================
  // Settings Management
  // ============================================

  /**
   * Get hero settings
   */
  static async getHeroSettings(): Promise<HeroSettings> {
    try {
      const response = await apiClient.get<HeroSettings>('/api/admin/hero-settings');
      return response;
    } catch (error) {
      console.error("AdminService.getHeroSettings error:", error);
      throw error;
    }
  }

  /**
   * Update hero settings
   */
  static async updateHeroSettings(settings: Partial<HeroSettings>): Promise<void> {
    try {
      await apiClient.put<void>('/api/admin/hero-settings', settings);
    } catch (error) {
      console.error("AdminService.updateHeroSettings error:", error);
      throw error;
    }
  }

  /**
   * Get hero slides
   */
  static async getHeroSlides(): Promise<HeroSlide[]> {
    try {
      const response = await apiClient.get<HeroSlide[]>('/api/admin/hero-slides');
      return response;
    } catch (error) {
      console.error("AdminService.getHeroSlides error:", error);
      throw error;
    }
  }

  /**
   * Create hero slide
   */
  static async createHeroSlide(data: Partial<HeroSlide>): Promise<HeroSlide> {
    try {
      const response = await apiClient.post<HeroSlide>('/api/admin/hero-slides', data);
      return response;
    } catch (error) {
      console.error("AdminService.createHeroSlide error:", error);
      throw error;
    }
  }

  /**
   * Get theme settings
   */
  static async getThemeSettings(): Promise<ThemeSettings> {
    try {
      const response = await apiClient.get<ThemeSettings>('/api/admin/theme-settings');
      return response;
    } catch (error) {
      console.error("AdminService.getThemeSettings error:", error);
      throw error;
    }
  }

  /**
   * Update theme settings
   */
  static async updateThemeSettings(settings: Partial<ThemeSettings>): Promise<void> {
    try {
      await apiClient.put<void>('/api/admin/theme-settings', settings);
    } catch (error) {
      console.error("AdminService.updateThemeSettings error:", error);
      throw error;
    }
  }

  // ============================================
  // Bulk Operations
  // ============================================

  /**
   * Get bulk operations
   */
  static async getBulkOperations(): Promise<BulkOperation[]> {
    try {
      const response = await apiClient.get<BulkOperation[]>('/api/admin/bulk');
      return response;
    } catch (error) {
      console.error("AdminService.getBulkOperations error:", error);
      throw error;
    }
  }

  /**
   * Create bulk operation
   */
  static async createBulkOperation(type: string, data: any): Promise<BulkOperation> {
    try {
      const response = await apiClient.post<BulkOperation>('/api/admin/bulk', {
        type,
        data
      });
      return response;
    } catch (error) {
      console.error("AdminService.createBulkOperation error:", error);
      throw error;
    }
  }

  /**
   * Export data
   */
  static async exportData(type: string, filters?: any): Promise<Blob> {
    try {
      const response = await fetch('/api/admin/bulk/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type, filters }),
      });

      if (!response.ok) {
        throw new Error('Failed to export data');
      }

      return await response.blob();
    } catch (error) {
      console.error("AdminService.exportData error:", error);
      throw error;
    }
  }
}

export default AdminService;
