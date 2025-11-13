import { apiService } from "./api.service";
import {
  OrderBE,
  OrderFiltersBE,
  CreateOrderRequestBE,
  UpdateOrderStatusRequestBE,
  CreateShipmentRequestBE,
  CancelOrderRequestBE,
} from "@/types/backend/order.types";
import {
  OrderFE,
  OrderCardFE,
  CreateOrderFormFE,
  OrderStatsFE,
} from "@/types/frontend/order.types";
import {
  toFEOrder,
  toFEOrders,
  toFEOrderCard,
  toBECreateOrderRequest,
  toBEUpdateOrderStatusRequest,
  toBECreateShipmentRequest,
} from "@/types/transforms/order.transforms";
import type {
  PaginatedResponseBE,
  PaginatedResponseFE,
} from "@/types/shared/common.types";

class OrdersService {
  // List orders (role-filtered)
  async list(
    filters?: Partial<OrderFiltersBE>
  ): Promise<PaginatedResponseFE<OrderCardFE>> {
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach((v) => params.append(key, v.toString()));
          } else {
            params.append(key, value.toString());
          }
        }
      });
    }

    const queryString = params.toString();
    const endpoint = queryString ? `/orders?${queryString}` : "/orders";

    const response = await apiService.get<PaginatedResponseBE<OrderBE>>(
      endpoint
    );

    return {
      data: response.data.map(toFEOrderCard),
      total: response.total,
      page: response.page,
      limit: response.limit,
      totalPages: response.totalPages,
      hasMore: response.hasMore,
    };
  }

  // Get seller's orders specifically
  async getSellerOrders(
    filters?: Partial<OrderFiltersBE>
  ): Promise<PaginatedResponseFE<OrderCardFE>> {
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach((v) => params.append(key, v.toString()));
          } else {
            params.append(key, value.toString());
          }
        }
      });
    }

    const queryString = params.toString();
    const endpoint = queryString
      ? `/seller/orders?${queryString}`
      : "/seller/orders";

    const response = await apiService.get<PaginatedResponseBE<OrderBE>>(
      endpoint
    );

    return {
      data: response.data.map(toFEOrderCard),
      total: response.total,
      page: response.page,
      limit: response.limit,
      totalPages: response.totalPages,
      hasMore: response.hasMore,
    };
  }

  // Get order by ID
  async getById(id: string): Promise<OrderFE> {
    const orderBE = await apiService.get<OrderBE>(`/orders/${id}`);
    return toFEOrder(orderBE);
  }

  // Create order (customer checkout)
  async create(formData: CreateOrderFormFE): Promise<OrderFE> {
    const request = toBECreateOrderRequest(formData);
    const orderBE = await apiService.post<OrderBE>("/orders", request);
    return toFEOrder(orderBE);
  }

  // Update order status (seller/admin)
  async updateStatus(
    id: string,
    status: string,
    internalNotes?: string
  ): Promise<OrderFE> {
    const request = toBEUpdateOrderStatusRequest(status, internalNotes);
    const orderBE = await apiService.patch<OrderBE>(`/orders/${id}`, request);
    return toFEOrder(orderBE);
  }

  // Create shipment (seller/admin)
  async createShipment(
    id: string,
    trackingNumber: string,
    shippingProvider: string,
    estimatedDelivery?: Date
  ): Promise<OrderFE> {
    const request = toBECreateShipmentRequest(
      trackingNumber,
      shippingProvider,
      estimatedDelivery
    );
    const orderBE = await apiService.post<OrderBE>(
      `/orders/${id}/shipment`,
      request
    );
    return toFEOrder(orderBE);
  }

  // Cancel order (user before shipping)
  async cancel(id: string, reason: string): Promise<OrderFE> {
    const orderBE = await apiService.post<OrderBE>(`/orders/${id}/cancel`, {
      reason,
    });
    return toFEOrder(orderBE);
  }

  // Track shipment
  async track(id: string): Promise<{
    trackingNumber: string;
    shippingProvider: string;
    currentStatus: string;
    estimatedDelivery: Date | null;
    trackingUrl: string;
    events: Array<{
      status: string;
      location: string;
      timestamp: Date;
      description: string;
    }>;
  }> {
    return apiService.get(`/orders/${id}/track`);
  }

  // Download invoice
  async downloadInvoice(id: string): Promise<Blob> {
    const response = await fetch(`/api/orders/${id}/invoice`, {
      method: "GET",
      headers: {
        Accept: "application/pdf",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to download invoice");
    }

    return response.blob();
  }

  // Get order statistics
  async getStats(filters?: {
    shopId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<OrderStatsFE> {
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }

    const queryString = params.toString();
    const endpoint = queryString
      ? `/orders/stats?${queryString}`
      : "/orders/stats";

    return apiService.get<OrderStatsFE>(endpoint);
  }
}

export const ordersService = new OrdersService();
