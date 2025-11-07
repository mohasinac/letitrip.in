import { apiService } from './api.service';
import type { Order, OrderStatus, PaymentStatus, PaginatedResponse } from '@/types';

interface OrderFilters {
  shopId?: string;
  customerId?: string;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  minAmount?: number;
  maxAmount?: number;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'total' | 'status';
  sortOrder?: 'asc' | 'desc';
}

interface CreateOrderData {
  items: {
    productId: string;
    quantity: number;
    variant?: string;
  }[];
  shippingAddress: {
    name: string;
    phone: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  billingAddress?: {
    name: string;
    phone: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  paymentMethod: 'razorpay' | 'paypal' | 'cod';
  couponCode?: string;
  customerNotes?: string;
}

interface UpdateOrderStatusData {
  status: OrderStatus;
  internalNotes?: string;
}

interface CreateShipmentData {
  trackingNumber: string;
  shippingProvider: string;
  estimatedDelivery?: Date;
}

interface CancelOrderData {
  reason: string;
}

class OrdersService {
  // List orders (role-filtered)
  async list(filters?: OrderFilters): Promise<PaginatedResponse<Order>> {
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
    const endpoint = queryString ? `/orders?${queryString}` : '/orders';
    
    return apiService.get<PaginatedResponse<Order>>(endpoint);
  }

  // Get order by ID
  async getById(id: string): Promise<Order> {
    return apiService.get<Order>(`/orders/${id}`);
  }

  // Create order (customer checkout)
  async create(data: CreateOrderData): Promise<Order> {
    return apiService.post<Order>('/orders', data);
  }

  // Update order status (seller/admin)
  async updateStatus(id: string, data: UpdateOrderStatusData): Promise<Order> {
    return apiService.patch<Order>(`/orders/${id}`, data);
  }

  // Create shipment (seller/admin)
  async createShipment(id: string, data: CreateShipmentData): Promise<Order> {
    return apiService.post<Order>(`/orders/${id}/shipment`, data);
  }

  // Cancel order (user before shipping)
  async cancel(id: string, data: CancelOrderData): Promise<Order> {
    return apiService.post<Order>(`/orders/${id}/cancel`, data);
  }

  // Track shipment
  async track(id: string): Promise<any> {
    return apiService.get<any>(`/orders/${id}/track`);
  }

  // Download invoice
  async downloadInvoice(id: string): Promise<Blob> {
    // Note: This might need special handling for blob response
    const response = await fetch(`/api/orders/${id}/invoice`, {
      method: 'GET',
      headers: {
        'Accept': 'application/pdf',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to download invoice');
    }
    
    return response.blob();
  }

  // Get order statistics
  async getStats(filters?: { shopId?: string; startDate?: string; endDate?: string }): Promise<any> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }

    const queryString = params.toString();
    const endpoint = queryString ? `/orders/stats?${queryString}` : '/orders/stats';
    
    return apiService.get<any>(endpoint);
  }
}

export const ordersService = new OrdersService();
export type {
  OrderFilters,
  CreateOrderData,
  UpdateOrderStatusData,
  CreateShipmentData,
  CancelOrderData,
};
