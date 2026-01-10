import { ORDER_ROUTES, buildUrl } from "@/constants/api-routes";
import { logServiceError } from "@/lib/error-logger";
import {
  OrderBE,
  OrderFiltersBE,
  UpdateOrderStatusRequestBE,
} from "@/types/backend/order.types";
import {
  CreateOrderFormFE,
  OrderCardFE,
  OrderFE,
  OrderStatsFE,
} from "@/types/frontend/order.types";
import type {
  BulkActionResponse,
  PaginatedResponseBE,
  PaginatedResponseFE,
} from "@/types/shared/common.types";
import {
  toBECreateOrderRequest,
  toBECreateShipmentRequest,
  toBEUpdateOrderStatusRequest,
  toFEOrder,
  toFEOrderCard,
} from "@/types/transforms/order.transforms";
import { z } from "zod";
import { apiService } from "./api.service";

/**
 * Zod validation schemas for order operations
 */

// Create order schema
export const CreateOrderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1, "Product ID is required"),
        variantId: z.string().optional(),
        quantity: z
          .number()
          .int("Quantity must be a whole number")
          .min(1, "Quantity must be at least 1")
          .max(100, "Quantity cannot exceed 100"),
      })
    )
    .min(1, "At least one item is required"),
  shippingAddressId: z.string().min(1, "Shipping address is required"),
  paymentMethod: z.enum(["cod", "card", "upi", "netbanking", "wallet"], {
    errorMap: () => ({ message: "Invalid payment method" }),
  }),
  shippingMethod: z.enum(["standard", "express", "overnight"], {
    errorMap: () => ({ message: "Invalid shipping method" }),
  }),
  couponCode: z
    .string()
    .min(3, "Coupon code must be at least 3 characters")
    .max(50, "Coupon code must not exceed 50 characters")
    .regex(
      /^[A-Z0-9-]+$/,
      "Coupon code must contain only uppercase letters, numbers, and hyphens"
    )
    .optional(),
  customerNotes: z
    .string()
    .max(500, "Notes must not exceed 500 characters")
    .optional(),
});

// Update order status schema
export const UpdateOrderStatusSchema = z.object({
  status: z.enum(
    [
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "out_for_delivery",
      "delivered",
      "cancelled",
      "returned",
      "refunded",
    ],
    {
      errorMap: () => ({ message: "Invalid order status" }),
    }
  ),
  internalNotes: z
    .string()
    .max(1000, "Internal notes must not exceed 1000 characters")
    .optional(),
});

// Create shipment schema
export const CreateShipmentSchema = z.object({
  trackingNumber: z
    .string()
    .min(5, "Tracking number must be at least 5 characters")
    .max(50, "Tracking number must not exceed 50 characters"),
  shippingProvider: z
    .string()
    .min(2, "Shipping provider must be at least 2 characters")
    .max(100, "Shipping provider must not exceed 100 characters"),
  estimatedDelivery: z.date().optional(),
});

// Cancel order schema
export const CancelOrderSchema = z.object({
  reason: z
    .string()
    .min(10, "Cancellation reason must be at least 10 characters")
    .max(500, "Cancellation reason must not exceed 500 characters"),
});

// Bulk action schema
export const BulkOrderActionSchema = z.object({
  action: z.enum([
    "confirm",
    "process",
    "ship",
    "deliver",
    "cancel",
    "refund",
    "delete",
    "update",
  ]),
  orderIds: z
    .array(z.string().min(1, "Order ID cannot be empty"))
    .min(1, "At least one order must be selected"),
  data: z.any().optional(),
});

// Bulk refund schema
export const BulkRefundSchema = z.object({
  refundAmount: z
    .number()
    .positive("Refund amount must be positive")
    .optional(),
  reason: z
    .string()
    .min(10, "Refund reason must be at least 10 characters")
    .max(500, "Refund reason must not exceed 500 characters")
    .optional(),
});

/**
 * Orders Service - Updated with Zod validation ✅
 */

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
    // Validate input data
    const validatedData = CreateOrderSchema.parse(formData);

    const request = toBECreateOrderRequest(validatedData);
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
    // Validate input data
    const validatedData = UpdateOrderStatusSchema.parse({
      status,
      internalNotes,
    });

    const request = toBEUpdateOrderStatusRequest(
      validatedData.status,
      validatedData.internalNotes
    );
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
    // Validate input data
    const validatedData = CreateShipmentSchema.parse({
      trackingNumber,
      shippingProvider,
      estimatedDelivery,
    });

    const request = toBECreateShipmentRequest(
      validatedData.trackingNumber,
      validatedData.shippingProvider,
      validatedData.estimatedDelivery
    );
    const orderBE = await apiService.post<OrderBE>(
      `/orders/${id}/shipment`,
      request
    );
    return toFEOrder(orderBE);
  }

  // Cancel order (user before shipping)
  async cancel(id: string, reason: string): Promise<OrderFE> {
    // Validate input data
    const validatedData = CancelOrderSchema.parse({ reason });

    const orderBE = await apiService.post<OrderBE>(ORDER_ROUTES.CANCEL(id), {
      reason: validatedData.reason,
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
  // BUG FIX: Use apiService.getBlob for consistency and proper error handling
  async downloadInvoice(id: string): Promise<Blob> {
    return apiService.getBlob(ORDER_ROUTES.INVOICE(id));
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
      // Validate bulk action inputs
      const validatedAction = BulkOrderActionSchema.parse({
        action,
        orderIds,
        data,
      });

      const response = await apiService.post<BulkActionResponse>(
        ORDER_ROUTES.BULK,
        {
          action: validatedAction.action,
          orderIds: validatedAction.orderIds,
          data: validatedAction.data,
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
    // Validate reason if provided
    if (reason) {
      CancelOrderSchema.parse({ reason });
    }
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
    // Validate refund data
    const validatedData = BulkRefundSchema.parse({ refundAmount, reason });
    return this.bulkAction("refund", orderIds, validatedData);
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
