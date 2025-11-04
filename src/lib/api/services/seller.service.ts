/**
 * Seller Service
 * Handles all seller-specific API operations
 */

import { apiClient } from "../client";
import type { Product } from "./product.service";
import type { Order } from "./order.service";

// ============================================
// Seller Product Types
// ============================================

export interface SellerProductStats {
  total: number;
  active: number;
  draft: number;
  archived: number;
  lowStock: number;
  outOfStock: number;
}

// ============================================
// Seller Order Types
// ============================================

export interface SellerOrderStats {
  total: number;
  pending: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
}

// ============================================
// Seller Analytics Types
// ============================================

export interface SellerAnalytics {
  revenue: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    growth: number;
  };
  orders: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    growth: number;
  };
  products: {
    total: number;
    active: number;
    lowStock: number;
  };
  topProducts: Array<{
    id: string;
    name: string;
    sales: number;
    revenue: number;
  }>;
}

// ============================================
// Seller Coupon Types
// ============================================

export interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrderValue?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usageCount: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  sellerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCouponData {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrderValue?: number;
  maxDiscount?: number;
  usageLimit?: number;
  startDate: string;
  endDate: string;
  isActive?: boolean;
}

// ============================================
// Seller Shipment Types
// ============================================

export interface Shipment {
  id: string;
  orderId: string;
  trackingNumber: string;
  carrier: string;
  status: 'pending' | 'in_transit' | 'delivered' | 'failed';
  estimatedDelivery?: string;
  actualDelivery?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// Seller Shop Types
// ============================================

export interface SellerShop {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  banner?: string;
  address?: string;
  phone?: string;
  email?: string;
  rating?: number;
  reviewCount?: number;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// Seller Alert Types
// ============================================

export interface SellerAlert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

// ============================================
// Seller Service Class
// ============================================

export class SellerService {
  // ============================================
  // Product Methods
  // ============================================

  /**
   * Get seller's products
   */
  static async getProducts(filters?: {
    status?: 'active' | 'draft' | 'archived';
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
        `/api/seller/products?${params.toString()}`
      );
      
      return response;
    } catch (error) {
      console.error("SellerService.getProducts error:", error);
      throw error;
    }
  }

  /**
   * Get seller's product statistics
   */
  static async getProductStats(): Promise<SellerProductStats> {
    try {
      const response = await apiClient.get<SellerProductStats>(
        '/api/seller/products/stats'
      );
      return response;
    } catch (error) {
      console.error("SellerService.getProductStats error:", error);
      throw error;
    }
  }

  /**
   * Get leaf categories for product creation
   */
  static async getLeafCategories(): Promise<any[]> {
    try {
      const response = await apiClient.get<any[]>(
        '/api/seller/products/categories/leaf'
      );
      return response;
    } catch (error) {
      console.error("SellerService.getLeafCategories error:", error);
      throw error;
    }
  }

  /**
   * Upload product media
   */
  static async uploadMedia(file: File): Promise<{ url: string }> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/seller/products/media', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload media');
      }

      return await response.json();
    } catch (error) {
      console.error("SellerService.uploadMedia error:", error);
      throw error;
    }
  }

  // ============================================
  // Order Methods
  // ============================================

  /**
   * Get seller's orders
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
        `/api/seller/orders?${params.toString()}`
      );
      
      return response;
    } catch (error) {
      console.error("SellerService.getOrders error:", error);
      throw error;
    }
  }

  /**
   * Get order by ID
   */
  static async getOrder(orderId: string): Promise<Order> {
    try {
      const response = await apiClient.get<Order>(`/api/seller/orders/${orderId}`);
      return response;
    } catch (error) {
      console.error("SellerService.getOrder error:", error);
      throw error;
    }
  }

  /**
   * Approve order
   */
  static async approveOrder(orderId: string): Promise<void> {
    try {
      await apiClient.post<void>(`/api/seller/orders/${orderId}/approve`, {});
    } catch (error) {
      console.error("SellerService.approveOrder error:", error);
      throw error;
    }
  }

  /**
   * Reject order
   */
  static async rejectOrder(orderId: string, reason: string): Promise<void> {
    try {
      await apiClient.post<void>(`/api/seller/orders/${orderId}/reject`, { reason });
    } catch (error) {
      console.error("SellerService.rejectOrder error:", error);
      throw error;
    }
  }

  /**
   * Cancel order
   */
  static async cancelOrder(orderId: string, reason: string): Promise<void> {
    try {
      await apiClient.post<void>(`/api/seller/orders/${orderId}/cancel`, { reason });
    } catch (error) {
      console.error("SellerService.cancelOrder error:", error);
      throw error;
    }
  }

  /**
   * Generate invoice
   */
  static async generateInvoice(orderId: string): Promise<Blob> {
    try {
      const response = await fetch(`/api/seller/orders/${orderId}/invoice`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to generate invoice');
      }

      return await response.blob();
    } catch (error) {
      console.error("SellerService.generateInvoice error:", error);
      throw error;
    }
  }

  // ============================================
  // Coupon Methods
  // ============================================

  /**
   * Get seller's coupons
   */
  static async getCoupons(): Promise<Coupon[]> {
    try {
      const response = await apiClient.get<Coupon[]>('/api/seller/coupons');
      return response;
    } catch (error) {
      console.error("SellerService.getCoupons error:", error);
      throw error;
    }
  }

  /**
   * Create coupon
   */
  static async createCoupon(data: CreateCouponData): Promise<Coupon> {
    try {
      const response = await apiClient.post<Coupon>('/api/seller/coupons', data);
      return response;
    } catch (error) {
      console.error("SellerService.createCoupon error:", error);
      throw error;
    }
  }

  /**
   * Validate coupon
   */
  static async validateCoupon(code: string, orderTotal: number): Promise<{ valid: boolean; discount: number }> {
    try {
      const response = await apiClient.post<{ valid: boolean; discount: number }>(
        '/api/seller/coupons/validate',
        { code, orderTotal }
      );
      return response;
    } catch (error) {
      console.error("SellerService.validateCoupon error:", error);
      throw error;
    }
  }

  /**
   * Toggle coupon status
   */
  static async toggleCouponStatus(couponId: string): Promise<void> {
    try {
      await apiClient.post<void>(`/api/seller/coupons/${couponId}/toggle`, {});
    } catch (error) {
      console.error("SellerService.toggleCouponStatus error:", error);
      throw error;
    }
  }

  // ============================================
  // Shipment Methods
  // ============================================

  /**
   * Get seller's shipments
   */
  static async getShipments(): Promise<Shipment[]> {
    try {
      const response = await apiClient.get<Shipment[]>('/api/seller/shipments');
      return response;
    } catch (error) {
      console.error("SellerService.getShipments error:", error);
      throw error;
    }
  }

  /**
   * Track shipment
   */
  static async trackShipment(shipmentId: string): Promise<Shipment> {
    try {
      const response = await apiClient.get<Shipment>(
        `/api/seller/shipments/${shipmentId}/track`
      );
      return response;
    } catch (error) {
      console.error("SellerService.trackShipment error:", error);
      throw error;
    }
  }

  // ============================================
  // Analytics Methods
  // ============================================

  /**
   * Get seller analytics overview
   */
  static async getAnalytics(): Promise<SellerAnalytics> {
    try {
      const response = await apiClient.get<SellerAnalytics>(
        '/api/seller/analytics/overview'
      );
      return response;
    } catch (error) {
      console.error("SellerService.getAnalytics error:", error);
      throw error;
    }
  }

  // ============================================
  // Shop Methods
  // ============================================

  /**
   * Get seller shop profile
   */
  static async getShop(): Promise<SellerShop> {
    try {
      const response = await apiClient.get<SellerShop>('/api/seller/shop');
      return response;
    } catch (error) {
      console.error("SellerService.getShop error:", error);
      throw error;
    }
  }

  /**
   * Update shop profile
   */
  static async updateShop(data: Partial<SellerShop>): Promise<SellerShop> {
    try {
      const response = await apiClient.put<SellerShop>('/api/seller/shop', data);
      return response;
    } catch (error) {
      console.error("SellerService.updateShop error:", error);
      throw error;
    }
  }

  // ============================================
  // Alert Methods
  // ============================================

  /**
   * Get seller alerts
   */
  static async getAlerts(): Promise<SellerAlert[]> {
    try {
      const response = await apiClient.get<SellerAlert[]>('/api/seller/alerts');
      return response;
    } catch (error) {
      console.error("SellerService.getAlerts error:", error);
      throw error;
    }
  }

  /**
   * Mark alert as read
   */
  static async markAlertAsRead(alertId: string): Promise<void> {
    try {
      await apiClient.post<void>(`/api/seller/alerts/${alertId}/read`, {});
    } catch (error) {
      console.error("SellerService.markAlertAsRead error:", error);
      throw error;
    }
  }

  /**
   * Bulk mark alerts as read
   */
  static async bulkMarkAlertsAsRead(alertIds: string[]): Promise<void> {
    try {
      await apiClient.post<void>('/api/seller/alerts/bulk-read', { alertIds });
    } catch (error) {
      console.error("SellerService.bulkMarkAlertsAsRead error:", error);
      throw error;
    }
  }
}

export default SellerService;
