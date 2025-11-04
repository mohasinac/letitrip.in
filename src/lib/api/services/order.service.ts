/**
 * Order Service
 * Handles all order-related API operations
 */

import { apiClient } from "../client";
import type {
  Order,
  OrderItem,
  OrderAddress,
  CreateOrderInput,
  OrderFilters
} from "@/types/shared";

// Local response type for this service
export interface OrderListResponse {
  orders: Order[];
  total: number;
  page: number;
  limit: number;
}

// Re-export for convenience
export type { Order, OrderItem, OrderAddress as ShippingAddress, CreateOrderInput as CreateOrderData };

export class OrderService {
  /**
   * Get all orders for current user
   */
  static async getOrders(filters?: OrderFilters): Promise<OrderListResponse> {
    try {
      const params = new URLSearchParams();
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, String(value));
          }
        });
      }

      const response = await apiClient.get<OrderListResponse>(
        `/api/orders?${params.toString()}`
      );
      
      return response;
    } catch (error) {
      console.error("OrderService.getOrders error:", error);
      throw error;
    }
  }

  /**
   * Get single order by ID
   */
  static async getOrder(orderId: string): Promise<Order> {
    try {
      const response = await apiClient.get<Order>(`/api/orders/${orderId}`);
      return response;
    } catch (error) {
      console.error("OrderService.getOrder error:", error);
      throw error;
    }
  }

  /**
   * Create new order
   */
  static async createOrder(orderData: CreateOrderInput): Promise<Order> {
    try {
      const response = await apiClient.post<Order>("/api/orders", orderData);
      return response;
    } catch (error) {
      console.error("OrderService.createOrder error:", error);
      throw error;
    }
  }

  /**
   * Cancel order
   */
  static async cancelOrder(orderId: string, reason?: string): Promise<Order> {
    try {
      const response = await apiClient.patch<Order>(
        `/api/orders/${orderId}/cancel`,
        { reason }
      );
      return response;
    } catch (error) {
      console.error("OrderService.cancelOrder error:", error);
      throw error;
    }
  }

  /**
   * Track order
   */
  static async trackOrder(orderId: string): Promise<{
    order: Order;
    timeline: Array<{
      status: string;
      timestamp: string;
      description: string;
    }>;
  }> {
    try {
      const response = await apiClient.get(
        `/api/orders/${orderId}/track`
      );
      return response;
    } catch (error) {
      console.error("OrderService.trackOrder error:", error);
      throw error;
    }
  }

  /**
   * Download invoice
   */
  static async downloadInvoice(orderId: string): Promise<Blob> {
    try {
      // This would need special handling for blob response
      const response = await fetch(`/api/orders/${orderId}/invoice`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to download invoice');
      }
      
      return await response.blob();
    } catch (error) {
      console.error("OrderService.downloadInvoice error:", error);
      throw error;
    }
  }
}

export default OrderService;
