import { apiService } from "./api.service";
import { ORDER_ROUTES, buildUrl } from "@/constants/api-routes";
import {
  OrderBE,
  OrderFiltersBE,
  UpdateOrderStatusRequestBE,
} from "@/types/backend/order.types";
import {
  OrderFE,
  OrderCardFE,
  CreateOrderFormFE,
  OrderStatsFE,
} from "@/types/frontend/order.types";
import {
  toFEOrder,
  toFEOrderCard,
  toBECreateOrderRequest,
  toBEUpdateOrderStatusRequest,
  toBECreateShipmentRequest,
} from "@/types/transforms/order.transforms";
import type {
  PaginatedResponseBE,
  PaginatedResponseFE,
  BulkActionResponse,
} from "@/types/shared/common.types";
import { logServiceError } from "@/lib/error-logger";

class OrdersService {
  // List orders (role-filtered)
  async list(
    filters?: Partial<OrderFiltersBE>
  ): Promise<PaginatedResponseFE<OrderCardFE>> {
    const endpoint = buildUrl(ORDER_ROUTES.LIST, filters);
    const response = await apiService.get<PaginatedResponseBE<any>>(endpoint);

    return {
      data: (response.data || []).map(toFEOrderCard),
      count: response.count,
      pagination: response.pagination,
    };
  }

  // Get seller's orders specifically (uses unified route with automatic filtering)
  async getSellerOrders(
    filters?: Partial<OrderFiltersBE>
  ): Promise<PaginatedResponseFE<OrderCardFE>> {
    // The unified route automatically filters by seller's shop
    return this.list(filters);
  }

  // Get order by ID
  async getById(id: string): Promise<OrderFE> {
    const orderBE = await apiService.get<OrderBE>(ORDER_ROUTES.BY_ID(id));
    return toFEOrder(orderBE);
  }

  // Create order (customer checkout)
  async create(formData: CreateOrderFormFE): Promise<OrderFE> {
    const request = toBECreateOrderRequest(formData);
    const orderBE = await apiService.post<OrderBE>(
      ORDER_ROUTES.CREATE,
      request
    );
    return toFEOrder(orderBE);
  }

  // Update order status (seller/admin)
  async updateStatus(
    id: string,
    status: string,
    internalNotes?: string
  ): Promise<OrderFE> {
    const request = toBEUpdateOrderStatusRequest(status, internalNotes);
    const orderBE = await apiService.patch<OrderBE>(
      ORDER_ROUTES.BY_ID(id),
      request
    );
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
    const orderBE = await apiService.post<OrderBE>(ORDER_ROUTES.CANCEL(id), {
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
    return apiService.get(ORDER_ROUTES.TRACKING(id));
  }

  // Download invoice
  async downloadInvoice(id: string): Promise<Blob> {
    const response = await fetch(`/api${ORDER_ROUTES.INVOICE(id)}`, {
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

  /**
   * Bulk actions - supports: confirm, process, ship, deliver, cancel, refund, delete, update
   */
  async bulkAction(
    action: string,
    orderIds: string[],
    data?: any
  ): Promise<BulkActionResponse> {
    try {
      const response = await apiService.post<BulkActionResponse>(
        ORDER_ROUTES.BULK,
        {
          action,
          orderIds,
          data,
        }
      );
      return response;
    } catch (error) {
      logServiceError("OrdersService", "bulkAction", error as Error);
      throw error;
    }
  }

  /**
   * Bulk confirm orders
   */
  async bulkConfirm(orderIds: string[]): Promise<BulkActionResponse> {
    return this.bulkAction("confirm", orderIds);
  }

  /**
   * Bulk process orders
   */
  async bulkProcess(orderIds: string[]): Promise<BulkActionResponse> {
    return this.bulkAction("process", orderIds);
  }

  /**
   * Bulk ship orders
   */
  async bulkShip(
    orderIds: string[],
    trackingNumber?: string
  ): Promise<BulkActionResponse> {
    return this.bulkAction("ship", orderIds, { trackingNumber });
  }

  /**
   * Bulk deliver orders
   */
  async bulkDeliver(orderIds: string[]): Promise<BulkActionResponse> {
    return this.bulkAction("deliver", orderIds);
  }

  /**
   * Bulk cancel orders
   */
  async bulkCancel(
    orderIds: string[],
    reason?: string
  ): Promise<BulkActionResponse> {
    return this.bulkAction("cancel", orderIds, { reason });
  }

  /**
   * Bulk refund orders
   */
  async bulkRefund(
    orderIds: string[],
    refundAmount?: number,
    reason?: string
  ): Promise<BulkActionResponse> {
    return this.bulkAction("refund", orderIds, { refundAmount, reason });
  }

  /**
   * Bulk delete orders
   */
  async bulkDelete(orderIds: string[]): Promise<BulkActionResponse> {
    return this.bulkAction("delete", orderIds);
  }

  /**
   * Bulk update orders
   */
  async bulkUpdate(
    orderIds: string[],
    updates: Partial<UpdateOrderStatusRequestBE>
  ): Promise<BulkActionResponse> {
    return this.bulkAction("update", orderIds, updates);
  }
}

export const ordersService = new OrdersService();
