/**
 * @fileoverview Orders Service (Using BaseService Pattern)
 * @module src/services/orders.service
 * @description Orders service extending BaseService for common CRUD operations
 *
 * @created 2025-12-05
 * @updated 2025-12-06
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

import { ORDER_ROUTES } from "@/constants/api-routes";
import type { OrderBE, OrderFiltersBE } from "@/types/backend/order.types";
import type {
  CreateOrderFormFE,
  OrderCardFE,
  OrderFE,
  OrderStatsFE,
} from "@/types/frontend/order.types";
import {
  toBECreateOrderRequest,
  toBECreateShipmentRequest,
  toBEUpdateOrderStatusRequest,
  toFEOrder,
  toFEOrderCard,
} from "@/types/transforms/order.transforms";
import { apiService } from "./api.service";
import { BaseService } from "./base.service";

/**
 * Orders Service Class
 *
 * Extends BaseService to inherit common CRUD operations.
 * Adds order-specific functionality like status updates, shipment tracking, etc.
 *
 * @extends BaseService<OrderBE, OrderFE, CreateOrderFormFE, OrderFiltersBE>
 *
 * @example
 * const orders = await ordersService.list({ status: 'pending' });
 * const order = await ordersService.getById('order_123');
 */
class OrdersService extends BaseService<
  OrderBE,
  OrderFE,
  CreateOrderFormFE,
  OrderFiltersBE
> {
  protected endpoint = ORDER_ROUTES.LIST;
  protected entityName = "Order";

  /**
   * Transform form data to backend format
   */
  protected toBE(form: CreateOrderFormFE): Partial<OrderBE> {
    return toBECreateOrderRequest(form) as Partial<OrderBE>;
  }

  /**
   * Transform backend data to frontend format
   */
  protected toFE(be: OrderBE): OrderFE {
    return toFEOrder(be);
  }

  /**
   * Transform backend array to frontend card format
   * Overridden to return OrderCardFE instead of OrderFE for list views
   */
  protected toFEArray(beArray: OrderBE[]): OrderCardFE[] {
    return beArray.map((order) => toFEOrderCard(order as any));
  }

  /**
   * Get seller's orders with automatic filtering
   */
  async getSellerOrders(
    filters?: Partial<OrderFiltersBE>
  ): Promise<{ data: OrderCardFE[]; count: number; pagination: any }> {
    return this.list(filters);
  }

  /**
   * Update order status
   */
  async updateStatus(
    id: string,
    status: string,
    internalNotes?: string
  ): Promise<OrderFE> {
    try {
      const request = toBEUpdateOrderStatusRequest(status, internalNotes);
      const orderBE = await apiService.patch<OrderBE>(
        ORDER_ROUTES.BY_ID(id),
        request
      );
      return this.toFE(orderBE);
    } catch (error) {
      return this.handleError(error, `updateStatus:${id}`);
    }
  }

  /**
   * Create shipment for order
   */
  async createShipment(
    id: string,
    trackingNumber: string,
    shippingProvider: string,
    estimatedDelivery?: Date
  ): Promise<OrderFE> {
    try {
      const request = toBECreateShipmentRequest(
        trackingNumber,
        shippingProvider,
        estimatedDelivery
      );
      const orderBE = await apiService.post<OrderBE>(
        `/orders/${id}/shipment`,
        request
      );
      return this.toFE(orderBE);
    } catch (error) {
      return this.handleError(error, `createShipment:${id}`);
    }
  }

  /**
   * Cancel order
   */
  async cancel(id: string, reason: string): Promise<OrderFE> {
    try {
      const orderBE = await apiService.post<OrderBE>(ORDER_ROUTES.CANCEL(id), {
        reason,
      });
      return this.toFE(orderBE);
    } catch (error) {
      return this.handleError(error, `cancel:${id}`);
    }
  }

  /**
   * Track shipment
   */
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
    try {
      return await apiService.get(ORDER_ROUTES.TRACKING(id));
    } catch (error) {
      return this.handleError(error, `track:${id}`);
    }
  }

  /**
   * Download invoice as PDF
   */
  async downloadInvoice(id: string): Promise<Blob> {
    try {
      const response = await fetch(`/api${ORDER_ROUTES.INVOICE(id)}`, {
        method: "GET",
        headers: { Accept: "application/pdf" },
      });

      if (!response.ok) {
        throw new Error("Failed to download invoice");
      }

      return response.blob();
    } catch (error) {
      return this.handleError(error, `downloadInvoice:${id}`);
    }
  }

  /**
   * Get order statistics
   */
  async getStats(filters?: {
    shopId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<OrderStatsFE> {
    try {
      const queryString = this.buildQueryString(filters as any);
      const endpoint = `/orders/stats${queryString}`;
      return await apiService.get<OrderStatsFE>(endpoint);
    } catch (error) {
      return this.handleError(error, "getStats");
    }
  }

  // Bulk operations (inherited bulkUpdate and bulkDelete from BaseService)

  /**
   * Bulk confirm orders
   */
  async bulkConfirm(orderIds: string[]): Promise<any> {
    return apiService.post(ORDER_ROUTES.BULK, {
      action: "confirm",
      orderIds,
    });
  }

  /**
   * Bulk process orders
   */
  async bulkProcess(orderIds: string[]): Promise<any> {
    return apiService.post(ORDER_ROUTES.BULK, {
      action: "process",
      orderIds,
    });
  }

  /**
   * Bulk ship orders
   */
  async bulkShip(orderIds: string[], trackingNumber?: string): Promise<any> {
    return apiService.post(ORDER_ROUTES.BULK, {
      action: "ship",
      orderIds,
      data: { trackingNumber },
    });
  }

  /**
   * Bulk deliver orders
   */
  async bulkDeliver(orderIds: string[]): Promise<any> {
    return apiService.post(ORDER_ROUTES.BULK, {
      action: "deliver",
      orderIds,
    });
  }

  /**
   * Bulk cancel orders
   */
  async bulkCancel(orderIds: string[], reason?: string): Promise<any> {
    return apiService.post(ORDER_ROUTES.BULK, {
      action: "cancel",
      orderIds,
      data: { reason },
    });
  }

  /**
   * Bulk refund orders
   */
  async bulkRefund(
    orderIds: string[],
    refundAmount?: number,
    reason?: string
  ): Promise<any> {
    return apiService.post(ORDER_ROUTES.BULK, {
      action: "refund",
      orderIds,
      data: { refundAmount, reason },
    });
  }
}

export const ordersService = new OrdersService();
