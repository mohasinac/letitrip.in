/**
 * Orders API Service
 */

import apiClient from './client';
import type { Order, OrderFilters, PaginatedResponse, Address } from '@/types';

export interface CreateOrderRequest {
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
  shippingAddress: Address;
  billingAddress: Address;
  paymentMethod: 'razorpay' | 'cod';
  couponCode?: string;
  notes?: string;
}

export interface OrderTrackingInfo {
  orderId: string;
  trackingNumber?: string;
  status: string;
  statusHistory: Array<{
    status: string;
    timestamp: string;
    location?: string;
    description?: string;
  }>;
  estimatedDelivery?: string;
  courierName?: string;
  trackingUrl?: string;
}

class OrdersAPI {
  /**
   * Create new order
   */
  async createOrder(orderData: CreateOrderRequest): Promise<Order> {
    const response = await apiClient.post<Order>('/orders', orderData);
    return response;
  }

  /**
   * Get user's orders with filtering and pagination
   */
  async getOrders(filters: OrderFilters = {}): Promise<PaginatedResponse<Order>> {
    const response = await apiClient.get<PaginatedResponse<Order>>('/orders', filters);
    return response || { items: [], total: 0, page: 1, pageSize: 20, totalPages: 0 };
  }

  /**
   * Get order by ID
   */
  async getOrder(orderId: string): Promise<Order | null> {
    try {
      const response = await apiClient.get<Order>(`/orders/${orderId}`);
      return response;
    } catch (error) {
      console.error('Failed to fetch order:', error);
      return null;
    }
  }

  /**
   * Cancel order
   */
  async cancelOrder(orderId: string, reason?: string): Promise<Order> {
    const response = await apiClient.patch<Order>(`/orders/${orderId}/cancel`, {
      reason,
    });
    return response;
  }

  /**
   * Track order
   */
  async trackOrder(orderId: string): Promise<OrderTrackingInfo | null> {
    try {
      const response = await apiClient.get<OrderTrackingInfo>(`/orders/${orderId}/track`);
      return response;
    } catch (error) {
      console.error('Failed to track order:', error);
      return null;
    }
  }

  /**
   * Download order invoice
   */
  async downloadInvoice(orderId: string): Promise<Blob> {
    const response = await fetch(`/api/orders/${orderId}/invoice`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiClient.getToken()}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to download invoice');
    }
    
    return response.blob();
  }

  /**
   * Request order return/refund
   */
  async requestReturn(orderId: string, data: {
    items: Array<{
      productId: string;
      quantity: number;
      reason: string;
    }>;
    returnType: 'return' | 'exchange' | 'refund';
    reason: string;
    comments?: string;
  }): Promise<{
    success: boolean;
    returnId: string;
    message: string;
  }> {
    const response = await apiClient.post<{
      success: boolean;
      returnId: string;
      message: string;
    }>(`/orders/${orderId}/return`, data);
    return response;
  }

  /**
   * Get order returns
   */
  async getReturns(orderId?: string): Promise<Array<{
    id: string;
    orderId: string;
    status: 'pending' | 'approved' | 'rejected' | 'completed';
    returnType: 'return' | 'exchange' | 'refund';
    reason: string;
    items: Array<{
      productId: string;
      productName: string;
      quantity: number;
      refundAmount: number;
    }>;
    createdAt: string;
    updatedAt: string;
  }>> {
    const endpoint = orderId ? `/orders/${orderId}/returns` : '/returns';
    const response = await apiClient.get<Array<{
      id: string;
      orderId: string;
      status: 'pending' | 'approved' | 'rejected' | 'completed';
      returnType: 'return' | 'exchange' | 'refund';
      reason: string;
      items: Array<{
        productId: string;
        productName: string;
        quantity: number;
        refundAmount: number;
      }>;
      createdAt: string;
      updatedAt: string;
    }>>(endpoint);
    return response || [];
  }

  // Admin/Seller methods
  /**
   * Get all orders (admin) or seller's orders (seller)
   */
  async getAllOrders(filters: OrderFilters = {}): Promise<PaginatedResponse<Order>> {
    const response = await apiClient.get<PaginatedResponse<Order>>('/admin/orders', filters);
    return response || { items: [], total: 0, page: 1, pageSize: 20, totalPages: 0 };
  }

  /**
   * Update order status (admin/seller)
   */
  async updateOrderStatus(orderId: string, status: Order['status'], notes?: string): Promise<Order> {
    const response = await apiClient.patch<Order>(`/admin/orders/${orderId}/status`, {
      status,
      notes,
    });
    return response;
  }

  /**
   * Add tracking information (admin/seller)
   */
  async addTracking(orderId: string, trackingData: {
    trackingNumber: string;
    courierName: string;
    estimatedDelivery?: string;
  }): Promise<Order> {
    const response = await apiClient.patch<Order>(`/admin/orders/${orderId}/tracking`, trackingData);
    return response;
  }

  /**
   * Process refund (admin)
   */
  async processRefund(orderId: string, refundData: {
    amount: number;
    reason: string;
    refundMethod: 'original' | 'bank_transfer' | 'store_credit';
  }): Promise<{
    success: boolean;
    refundId: string;
    message: string;
  }> {
    const response = await apiClient.post<{
      success: boolean;
      refundId: string;
      message: string;
    }>(`/admin/orders/${orderId}/refund`, refundData);
    return response;
  }
}

export const ordersAPI = new OrdersAPI();
