/**
 * ORDER TYPE TRANSFORMATIONS
 *
 * Functions to convert between Backend (BE) and Frontend (FE) order types.
 */

import { Timestamp } from "firebase/firestore";
import {
  OrderBE,
  OrderListItemBE,
  OrderItemBE as OrderItemBE_BE,
  ShippingAddressBE,
  CreateOrderRequestBE,
} from "../backend/order.types";
import {
  OrderFE,
  OrderCardFE,
  OrderItemFE,
  ShippingAddressFE,
  OrderProgressStep,
  CreateOrderFormFE,
} from "../frontend/order.types";
import {
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
  ShippingMethod,
} from "../shared/common.types";

/**
 * Parse Firestore Timestamp or ISO string to Date
 */
function parseDate(date: Timestamp | string | null): Date | null {
  if (!date) return null;
  if (date instanceof Timestamp) {
    return date.toDate();
  }
  return new Date(date);
}

/**
 * Format price as Indian Rupees
 */
function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
}

/**
 * Format date
 */
function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Format time
 */
function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * Format address as single string
 */
function formatAddress(address: ShippingAddressBE): string {
  const parts = [
    address.addressLine1,
    address.addressLine2,
    address.city,
    address.state,
    address.postalCode,
    address.country,
  ].filter(Boolean);

  return parts.join(", ");
}

/**
 * Format short address
 */
function formatShortAddress(address: ShippingAddressBE): string {
  return `${address.city}, ${address.state}`;
}

/**
 * Calculate progress percentage
 */
function calculateProgress(status: OrderStatus): number {
  const progressMap: Record<OrderStatus, number> = {
    [OrderStatus.PENDING]: 10,
    [OrderStatus.CONFIRMED]: 25,
    [OrderStatus.PROCESSING]: 50,
    [OrderStatus.SHIPPED]: 75,
    [OrderStatus.DELIVERED]: 100,
    [OrderStatus.CANCELLED]: 0,
    [OrderStatus.REFUNDED]: 0,
  };

  return progressMap[status] || 0;
}

/**
 * Generate progress steps
 */
function generateProgressSteps(orderBE: OrderBE): OrderProgressStep[] {
  const createdAt = parseDate(orderBE.createdAt)!;
  const deliveredAt = parseDate(orderBE.deliveredAt);
  const cancelledAt = parseDate(orderBE.cancelledAt);

  if (orderBE.status === OrderStatus.CANCELLED) {
    return [
      {
        label: "Order Placed",
        status: "completed",
        date: createdAt,
        description: "Order was placed",
      },
      {
        label: "Cancelled",
        status: "completed",
        date: cancelledAt,
        description: orderBE.cancelReason || "Order was cancelled",
      },
    ];
  }

  const steps: OrderProgressStep[] = [
    {
      label: "Order Placed",
      status: "completed",
      date: createdAt,
      description: "Your order has been placed",
    },
    {
      label: "Confirmed",
      status:
        orderBE.status >= OrderStatus.CONFIRMED
          ? "completed"
          : orderBE.status === OrderStatus.CONFIRMED
          ? "current"
          : "pending",
      date: orderBE.status >= OrderStatus.CONFIRMED ? createdAt : null,
      description: "Order confirmed by seller",
    },
    {
      label: "Processing",
      status:
        orderBE.status > OrderStatus.PROCESSING
          ? "completed"
          : orderBE.status === OrderStatus.PROCESSING
          ? "current"
          : "pending",
      date: orderBE.status >= OrderStatus.PROCESSING ? createdAt : null,
      description: "Preparing your order",
    },
    {
      label: "Shipped",
      status:
        orderBE.status > OrderStatus.SHIPPED
          ? "completed"
          : orderBE.status === OrderStatus.SHIPPED
          ? "current"
          : "pending",
      date: orderBE.status >= OrderStatus.SHIPPED ? createdAt : null,
      description: orderBE.trackingNumber
        ? `Tracking: ${orderBE.trackingNumber}`
        : "Order shipped",
    },
    {
      label: "Delivered",
      status:
        orderBE.status === OrderStatus.DELIVERED ? "completed" : "pending",
      date: deliveredAt,
      description: "Order delivered",
    },
  ];

  return steps;
}

/**
 * Get current step index
 */
function getCurrentStep(status: OrderStatus): number {
  const stepMap: Record<OrderStatus, number> = {
    [OrderStatus.PENDING]: 0,
    [OrderStatus.CONFIRMED]: 1,
    [OrderStatus.PROCESSING]: 2,
    [OrderStatus.SHIPPED]: 3,
    [OrderStatus.DELIVERED]: 4,
    [OrderStatus.CANCELLED]: 1,
    [OrderStatus.REFUNDED]: 1,
  };

  return stepMap[status] || 0;
}

/**
 * Generate order badges
 */
function generateOrderBadges(orderBE: OrderBE): string[] {
  const badges: string[] = [];

  if (orderBE.paymentMethod === PaymentMethod.COD) {
    badges.push("COD");
  }

  if (orderBE.shippingMethod === ShippingMethod.EXPRESS) {
    badges.push("Express");
  } else if (orderBE.shippingMethod === ShippingMethod.OVERNIGHT) {
    badges.push("Overnight");
  }

  if (orderBE.status === OrderStatus.CANCELLED) {
    badges.push("Cancelled");
  }

  if (orderBE.status === OrderStatus.REFUNDED) {
    badges.push("Refunded");
  }

  if (orderBE.couponCode) {
    badges.push("Coupon Applied");
  }

  return badges;
}

/**
 * Format estimated delivery
 */
function formatEstimatedDelivery(
  date: Date | null,
  status: OrderStatus
): string {
  if (!date) return "Not available";
  if (status === OrderStatus.DELIVERED) return "Delivered";
  return `Expected by ${formatDate(date)}`;
}

/**
 * Get delivery status text
 */
function getDeliveryStatus(orderBE: OrderBE): string {
  if (orderBE.status === OrderStatus.DELIVERED && orderBE.deliveredAt) {
    return `Delivered on ${formatDate(parseDate(orderBE.deliveredAt)!)}`;
  }
  if (orderBE.status === OrderStatus.SHIPPED) {
    return "In transit";
  }
  if (orderBE.status === OrderStatus.PROCESSING) {
    return "Preparing for shipment";
  }
  if (orderBE.status === OrderStatus.CANCELLED) {
    return "Order cancelled";
  }
  return "Processing";
}

/**
 * Transform Backend Order Item to Frontend
 */
function toFEOrderItem(itemBE: OrderItemBE_BE): OrderItemFE {
  return {
    ...itemBE,
    formattedPrice: formatPrice(itemBE.price),
    formattedSubtotal: formatPrice(itemBE.subtotal),
    formattedTotal: formatPrice(itemBE.total),
  };
}

/**
 * Transform Backend Shipping Address to Frontend
 */
function toFEShippingAddress(addressBE: ShippingAddressBE): ShippingAddressFE {
  return {
    ...addressBE,
    formattedAddress: formatAddress(addressBE),
    shortAddress: formatShortAddress(addressBE),
  };
}

/**
 * Transform Backend Order to Frontend Order
 */
export function toFEOrder(orderBE: OrderBE): OrderFE {
  const createdAt = parseDate(orderBE.createdAt)!;
  const updatedAt = parseDate(orderBE.updatedAt)!;
  const paidAt = parseDate(orderBE.paidAt);
  const estimatedDelivery = parseDate(orderBE.estimatedDelivery);
  const deliveredAt = parseDate(orderBE.deliveredAt);
  const cancelledAt = parseDate(orderBE.cancelledAt);
  const refundedAt = parseDate(orderBE.refundedAt);

  return {
    id: orderBE.id,
    orderNumber: orderBE.orderNumber,

    userId: orderBE.userId,
    userEmail: orderBE.userEmail,
    userName: orderBE.userName,

    shopId: orderBE.shopId,
    shopName: orderBE.shopName,
    sellerId: orderBE.sellerId,

    items: orderBE.items.map(toFEOrderItem),
    itemCount: orderBE.itemCount,

    subtotal: orderBE.subtotal,
    discount: orderBE.discount,
    tax: orderBE.tax,
    shippingCost: orderBE.shippingCost,
    total: orderBE.total,

    formattedSubtotal: formatPrice(orderBE.subtotal),
    formattedDiscount: formatPrice(orderBE.discount),
    formattedTax: formatPrice(orderBE.tax),
    formattedShipping: formatPrice(orderBE.shippingCost),
    formattedTotal: formatPrice(orderBE.total),

    couponId: orderBE.couponId,
    couponCode: orderBE.couponCode,
    couponDiscount: orderBE.couponDiscount,
    formattedCouponDiscount: formatPrice(orderBE.couponDiscount),
    hasCoupon: !!orderBE.couponCode,

    paymentMethod: orderBE.paymentMethod,
    paymentStatus: orderBE.paymentStatus,
    paymentId: orderBE.paymentId,
    paymentGateway: orderBE.paymentGateway,
    paidAt,

    isPaid: orderBE.paymentStatus === PaymentStatus.COMPLETED,
    isPending: orderBE.paymentStatus === PaymentStatus.PENDING,
    isFailed: orderBE.paymentStatus === PaymentStatus.FAILED,
    isRefunded: orderBE.paymentStatus === PaymentStatus.REFUNDED,

    shippingMethod: orderBE.shippingMethod,
    shippingAddress: toFEShippingAddress(orderBE.shippingAddress),
    trackingNumber: orderBE.trackingNumber,
    estimatedDelivery,
    deliveredAt,

    hasTracking: !!orderBE.trackingNumber,
    isDelivered: orderBE.status === OrderStatus.DELIVERED,

    status: orderBE.status,
    cancelledAt,
    cancelReason: orderBE.cancelReason,
    refundAmount: orderBE.refundAmount,
    refundedAt,

    isPendingOrder: orderBE.status === OrderStatus.PENDING,
    isConfirmed: orderBE.status === OrderStatus.CONFIRMED,
    isProcessing: orderBE.status === OrderStatus.PROCESSING,
    isShipped: orderBE.status === OrderStatus.SHIPPED,
    isCancelled: orderBE.status === OrderStatus.CANCELLED,
    canCancel:
      orderBE.status === OrderStatus.PENDING ||
      orderBE.status === OrderStatus.CONFIRMED,
    canTrack:
      !!orderBE.trackingNumber && orderBE.status === OrderStatus.SHIPPED,

    customerNotes: orderBE.customerNotes,
    adminNotes: orderBE.adminNotes,

    createdAt,
    updatedAt,

    orderDate: formatDate(createdAt),
    orderTime: formatTime(createdAt),
    estimatedDeliveryDisplay: formatEstimatedDelivery(
      estimatedDelivery,
      orderBE.status
    ),
    deliveryStatus: getDeliveryStatus(orderBE),

    progressPercentage: calculateProgress(orderBE.status),
    progressSteps: generateProgressSteps(orderBE),
    currentStep: getCurrentStep(orderBE.status),

    badges: generateOrderBadges(orderBE),

    metadata: orderBE.metadata,
  };
}

/**
 * Transform Backend Order List Item to Frontend Order Card
 */
export function toFEOrderCard(orderBE: OrderListItemBE): OrderCardFE {
  const createdAt = parseDate(orderBE.createdAt)!;

  return {
    id: orderBE.id,
    orderNumber: orderBE.orderNumber,
    shopName: orderBE.shopName,
    itemCount: orderBE.itemCount,
    total: orderBE.total,
    formattedTotal: formatPrice(orderBE.total),
    status: orderBE.status,
    paymentStatus: orderBE.paymentStatus,
    orderDate: formatDate(createdAt),
    badges: orderBE.status === OrderStatus.CANCELLED ? ["Cancelled"] : [],
    isPaid: orderBE.paymentStatus === PaymentStatus.COMPLETED,
    canCancel:
      orderBE.status === OrderStatus.PENDING ||
      orderBE.status === OrderStatus.CONFIRMED,
  };
}

/**
 * Transform Frontend Create Order Form to Backend Request
 */
export function toBECreateOrderRequest(
  formData: CreateOrderFormFE
): CreateOrderRequestBE {
  return {
    userId: "", // Will be set by service layer
    items: formData.items,
    shippingAddressId: formData.shippingAddressId,
    paymentMethod: formData.paymentMethod,
    shippingMethod: formData.shippingMethod,
    couponCode: formData.couponCode,
    customerNotes: formData.customerNotes,
  };
}

/**
 * Batch transform Backend Orders to Frontend Orders
 */
export function toFEOrders(ordersBE: OrderBE[]): OrderFE[] {
  return ordersBE.map(toFEOrder);
}

/**
 * Batch transform Backend Order List Items to Frontend Order Cards
 */
export function toFEOrderCards(ordersBE: OrderListItemBE[]): OrderCardFE[] {
  return ordersBE.map(toFEOrderCard);
}

/**
 * Transform order status update to backend request
 */
export function toBEUpdateOrderStatusRequest(status: string, notes?: string) {
  return {
    status,
    notes: notes || undefined,
  };
}

/**
 * Transform shipment creation to backend request
 */
export function toBECreateShipmentRequest(
  trackingNumber: string,
  carrier: string,
  estimatedDelivery?: Date
) {
  return {
    trackingNumber,
    carrier,
    eta: estimatedDelivery ? estimatedDelivery.toISOString() : undefined,
  };
}
