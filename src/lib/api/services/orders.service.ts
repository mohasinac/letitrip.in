/**
 * Orders Service
 * Frontend service for order-related API calls
 */

import { apiClient } from '../client';
import { API_ENDPOINTS, buildQueryString } from '../constants/endpoints';
import type {
  Order,
  OrderFilters,
  OrderStatus,
  PaymentStatus,
} from '@/types';
import type { PaginatedData } from '../responses';

export interface OrderStats {
  total: number;
  pending: number;
  confirmed: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
  refunded: number;
  totalRevenue: number;
  averageOrderValue: number;
}

export interface CreateOrderData {
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  shippingAddressId: string;
  billingAddressId: string;
  paymentMethod: 'razorpay' | 'cod';
  couponCode?: string;
  notes?: string;
}

export interface TrackOrderParams {
  orderNumber: string;
  email: string;
}

export interface TrackOrderResult {
  order: Order;
  timeline: Array<{
    status: OrderStatus;
    timestamp: string;
    description: string;
  }>;
}

export class OrdersService {
  /**
   * Get list of user's orders
   * @param filters - Filter parameters
   * @returns Paginated list of orders
   */
  async list(filters?: OrderFilters): Promise<PaginatedData<Order>> {
    const params: Record<string, any> = {};
    
    if (filters?.status) params.status = filters.status;
    if (filters?.paymentStatus) params.paymentStatus = filters.paymentStatus;
    if (filters?.startDate) params.startDate = filters.startDate;
    if (filters?.endDate) params.endDate = filters.endDate;
    if (filters?.search) params.search = filters.search;
    if (filters?.page) params.page = filters.page;
    if (filters?.pageSize) params.limit = filters.pageSize;
    
    const queryString = buildQueryString(params);
    const url = `${API_ENDPOINTS.ORDERS.LIST}${queryString}`;
    
    return apiClient.get<PaginatedData<Order>>(url);
  }

  /**
   * Get single order by ID
   * @param id - Order ID
   * @returns Order details
   */
  async getById(id: string): Promise<Order> {
    return apiClient.get<Order>(API_ENDPOINTS.ORDERS.GET(id));
  }

  /**
   * Create new order
   * @param data - Order data
   * @returns Created order
   */
  async create(data: CreateOrderData): Promise<Order> {
    return apiClient.post<Order>(API_ENDPOINTS.ORDERS.CREATE, data);
  }

  /**
   * Update order status
   * @param id - Order ID
   * @param status - New status
   * @returns Updated order
   */
  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    return apiClient.patch<Order>(API_ENDPOINTS.ORDERS.UPDATE_STATUS(id), { status });
  }

  /**
   * Cancel order
   * @param id - Order ID
   * @param reason - Cancellation reason
   * @returns Updated order
   */
  async cancel(id: string, reason?: string): Promise<Order> {
    return apiClient.post<Order>(API_ENDPOINTS.ORDERS.CANCEL(id), { reason });
  }

  /**
   * Track order by order number and email
   * @param params - Tracking parameters
   * @returns Order tracking information
   */
  async track(params: TrackOrderParams): Promise<TrackOrderResult> {
    const queryString = buildQueryString(params);
    const url = `${API_ENDPOINTS.ORDERS.TRACK}${queryString}`;
    return apiClient.get<TrackOrderResult>(url);
  }

  /**
   * Get all orders (admin only)
   * @param filters - Filter parameters
   * @returns Paginated list of all orders
   */
  async adminList(filters?: OrderFilters): Promise<PaginatedData<Order>> {
    const params: Record<string, any> = {};
    
    if (filters?.status) params.status = filters.status;
    if (filters?.paymentStatus) params.paymentStatus = filters.paymentStatus;
    if (filters?.startDate) params.startDate = filters.startDate;
    if (filters?.endDate) params.endDate = filters.endDate;
    if (filters?.search) params.search = filters.search;
    if (filters?.page) params.page = filters.page;
    if (filters?.pageSize) params.limit = filters.pageSize;
    
    const queryString = buildQueryString(params);
    const url = `${API_ENDPOINTS.ORDERS.ADMIN_LIST}${queryString}`;
    
    return apiClient.get<PaginatedData<Order>>(url);
  }

  /**
   * Get order statistics (admin only)
   * @returns Order statistics
   */
  async getStats(): Promise<OrderStats> {
    return apiClient.get<OrderStats>(API_ENDPOINTS.ORDERS.ADMIN_STATS);
  }

  /**
   * Get seller's orders
   * @param filters - Filter parameters
   * @returns Paginated list of seller's orders
   */
  async sellerList(filters?: OrderFilters): Promise<PaginatedData<Order>> {
    const params: Record<string, any> = {};
    
    if (filters?.status) params.status = filters.status;
    if (filters?.paymentStatus) params.paymentStatus = filters.paymentStatus;
    if (filters?.startDate) params.startDate = filters.startDate;
    if (filters?.endDate) params.endDate = filters.endDate;
    if (filters?.search) params.search = filters.search;
    if (filters?.page) params.page = filters.page;
    if (filters?.pageSize) params.limit = filters.pageSize;
    
    const queryString = buildQueryString(params);
    const url = `${API_ENDPOINTS.ORDERS.SELLER_LIST}${queryString}`;
    
    return apiClient.get<PaginatedData<Order>>(url);
  }
}

// Export singleton instance
export const ordersService = new OrdersService();
