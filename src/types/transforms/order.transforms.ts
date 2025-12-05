/**
 * @fileoverview TypeScript Module
 * @module src/types/transforms/order.transforms
 * @description This file contains functionality related to order.transforms
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

/**
 * ORDER TYPE TRANSFORMATIONS
 *
 * Functions to convert between Backend (BE) and Frontend (FE) order types.
 */

import { Timestamp } from "firebase/firestore";
import { safeToISOString } from "@/lib/date-utils";
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
/**
 * Parses date
 *
 * @param {Timestamp | string | null} date - The date
 *
 * @returns {any} The parsedate result
 */

/**
 * Parses date
 *
 * @param {Timestamp | string | null} date - The date
 *
 * @returns {any} The parsedate result
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
/**
 * Formats price
 *
 * @param {number} price - The price
 *
 * @returns {string} The formatprice result
 */

/**
 * Formats price
 *
 * @param {number} price - The price
 *
 * @returns {string} The formatprice result
 */

function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-IN", {
    /** Style */
    style: "currency",
    /** Currency */
    currency: "INR",
    /** Maximum Fraction Digits */
    maximumFractionDigits: 0,
  }).format(price);
}

/**
 * Format date
 */
/**
 * Formats date
 *
 * @param {Date} date - The date
 *
 * @returns {string} The formatdate result
 */

/**
 * Formats date
 *
 * @param {Date} date - The date
 *
 * @returns {string} The formatdate result
 */

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    /** Month */
    month: "short",
    /** Day */
    day: "numeric",
    /** Year */
    year: "numeric",
  });
}

/**
 * Format time
 */
/**
 * Formats time
 *
 * @param {Date} date - The date
 *
 * @returns {string} The formattime result
 */

/**
 * Formats time
 *
 * @param {Date} date - The date
 *
 * @returns {string} The formattime result
 */

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    /** Hour */
    hour: "numeric",
    /** Minute */
    minute: "2-digit",
    /** Hour12 */
    hour12: true,
  });
}

/**
 * Format address as single string
 */
/**
 * Formats address
 *
 * @param {ShippingAddressBE} address - The address
 *
 * @returns {string} The formataddress result
 */

/**
 * Formats address
 *
 * @param {ShippingAddressBE} address - The address
 *
 * @returns {string} The formataddress result
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
/**
 * Formats short address
 *
 * @param {ShippingAddressBE} address - The address
 *
 * @returns {string} The formatshortaddress result
 */

/**
 * Formats short address
 *
 * @param {ShippingAddressBE} address - The address
 *
 * @returns {string} The formatshortaddress result
 */

function formatShortAddress(address: ShippingAddressBE): string {
  return `${address.city}, ${address.state}`;
}

/**
 * Calculate progress percentage
 */
/**
 * Calculates progress
 *
 * @param {OrderStatus} status - The status
 *
 * @returns {number} The calculateprogress result
 */

/**
 * Calculates progress
 *
 * @param {OrderStatus} status - The status
 *
 * @returns {number} The calculateprogress result
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
/**
 * Performs generate progress steps operation
 *
 * @param {OrderBE} orderBE - The order b e
 *
 * @returns {any} The progresssteps result
 */

/**
 * Performs generate progress steps operation
 *
 * @param {OrderBE} orderBE - The order b e
 *
 * @returns {any} The progresssteps result
 */

function generateProgressSteps(orderBE: OrderBE): OrderProgressStep[] {
  const createdAt = parseDate(orderBE.createdAt) || new Date();
  const deliveredAt = parseDate(orderBE.deliveredAt);
  const cancelledAt = parseDate(orderBE.cancelledAt);

  if (orderBE.status === OrderStatus.CANCELLED) {
    return [
      {
        /** Label */
        label: "Order Placed",
        /** Status */
        status: "completed",
        /** Date */
        date: createdAt,
        /** Description */
        description: "Order was placed",
      },
      {
        /** Label */
        label: "Cancelled",
        /** Status */
        status: "completed",
        /** Date */
        date: cancelledAt,
        /** Description */
        description: orderBE.cancelReason || "Order was cancelled",
      },
    ];
  }

  const steps: OrderProgressStep[] = [
    {
      /** Label */
      label: "Order Placed",
      /** Status */
      status: "completed",
      /** Date */
      date: createdAt,
      /** Description */
      description: "Your order has been placed",
    },
    {
      /** Label */
      label: "Confirmed",
      /** Status */
      status:
        orderBE.status >= OrderStatus.CONFIRMED
          ? "completed"
          : orderBE.status === OrderStatus.CONFIRMED
            ? "current"
            : "pending",
      /** Date */
      date: orderBE.status >= OrderStatus.CONFIRMED ? createdAt : null,
      /** Description */
      description: "Order confirmed by seller",
    },
    {
      /** Label */
      label: "Processing",
      /** Status */
      status:
        orderBE.status > OrderStatus.PROCESSING
          ? "completed"
          : orderBE.status === OrderStatus.PROCESSING
            ? "current"
            : "pending",
      /** Date */
      date: orderBE.status >= OrderStatus.PROCESSING ? createdAt : null,
      /** Description */
      description: "Preparing your order",
    },
    {
      /** Label */
      label: "Shipped",
      /** Status */
      status:
        orderBE.status > OrderStatus.SHIPPED
          ? "completed"
          : orderBE.status === OrderStatus.SHIPPED
            ? "current"
            : "pending",
      /** Date */
      date: orderBE.status >= OrderStatus.SHIPPED ? createdAt : null,
      /** Description */
      description: orderBE.trackingNumber
        ? `Tracking: ${orderBE.trackingNumber}`
        : "Order shipped",
    },
    {
      /** Label */
      label: "Delivered",
      /** Status */
      status:
        orderBE.status === OrderStatus.DELIVERED ? "completed" : "pending",
      /** Date */
      date: deliveredAt,
      /** Description */
      description: "Order delivered",
    },
  ];

  return steps;
}

/**
 * Get current step index
 */
/**
 * Retrieves current step
 *
 * @param {OrderStatus} status - The status
 *
 * @returns {number} The currentstep result
 */

/**
 * Retrieves current step
 *
 * @param {OrderStatus} status - The status
 *
 * @returns {number} The currentstep result
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
/**
 * Performs generate order badges operation
 *
 * @param {OrderBE} orderBE - The order b e
 *
 * @returns {string} The orderbadges result
 */

/**
 * Performs generate order badges operation
 *
 * @param {OrderBE} orderBE - The order b e
 *
 * @returns {string} The orderbadges result
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
/**
 * Formats estimated delivery
 *
 * @param {Date | null} date - The date
 * @param {OrderStatus} status - The status
 *
 * @returns {string} The formatestimateddelivery result
 */

/**
 * Formats estimated delivery
 *
 * @returns {any} The formatestimateddelivery result
 */

function formatEstimatedDelivery(
  /** Date */
  date: Date | null,
  /** Status */
  status: OrderStatus,
): string {
  if (!date) return "Not available";
  if (status === OrderStatus.DELIVERED) return "Delivered";
  return `Expected by ${formatDate(date)}`;
}

/**
 * Get delivery status text
 */
/**
 * Retrieves delivery status
 *
 * @param {OrderBE} orderBE - The order b e
 *
 * @returns {string} The deliverystatus result
 */

/**
 * Retrieves delivery status
 *
 * @param {OrderBE} orderBE - The order b e
 *
 * @returns {string} The deliverystatus result
 */

function getDeliveryStatus(orderBE: OrderBE): string {
  if (orderBE.status === OrderStatus.DELIVERED && orderBE.deliveredAt) {
    return `Delivered on ${formatDate(parseDate(orderBE.deliveredAt) || new Date())}`;
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
/**
 * Performs to f e order item operation
 *
 * @param {OrderItemBE_BE} itemBE - The item b e
 *
 * @returns {any} The tofeorderitem result
 */

/**
 * Performs to f e order item operation
 *
 * @param {OrderItemBE_BE} itemBE - The item b e
 *
 * @returns {any} The tofeorderitem result
 */

function toFEOrderItem(itemBE: OrderItemBE_BE): OrderItemFE {
  return {
    ...itemBE,
    /** Formatted Price */
    formattedPrice: formatPrice(itemBE.price),
    /** Formatted Subtotal */
    formattedSubtotal: formatPrice(itemBE.subtotal),
    /** Formatted Total */
    formattedTotal: formatPrice(itemBE.total),

    // Backwards compatibility (admin pages)
    /** Variant */
    variant: itemBE.variantName,
    shopId: null, // Not available in OrderItemBE
    shopName: null, // Not available in OrderItemBE
  };
}

/**
 * Transform Backend Shipping Address to Frontend
 */
/**
 * Performs to f e shipping address operation
 *
 * @param {ShippingAddressBE} addressBE - The address b e
 *
 * @returns {any} The tofeshippingaddress result
 */

/**
 * Performs to f e shipping address operation
 *
 * @param {ShippingAddressBE} addressBE - The address b e
 *
 * @returns {any} The tofeshippingaddress result
 */

function toFEShippingAddress(addressBE: ShippingAddressBE): ShippingAddressFE {
  return {
    ...addressBE,
    /** Formatted Address */
    formattedAddress: formatAddress(addressBE),
    /** Short Address */
    shortAddress: formatShortAddress(addressBE),

    // Backwards compatibility (admin pages)
    /** Name */
    name: addressBE.fullName,
    /** Phone */
    phone: addressBE.phoneNumber,
    /** Line1 */
    line1: addressBE.addressLine1,
    /** Line2 */
    line2: addressBE.addressLine2,
    /** Pincode */
    pincode: addressBE.postalCode,
  };
}

/**
 * Transform Backend Order to Frontend Order
 */
/**
 * Performs to f e order operation
 *
 * @param {OrderBE} orderBE - The order b e
 *
 * @returns {any} The tofeorder result
 *
 * @example
 * toFEOrder(orderBE);
 */

/**
 * Performs to f e order operation
 *
 * @param {OrderBE} orderBE - The order b e
 *
 * @returns {any} The tofeorder result
 *
 * @example
 * toFEOrder(orderBE);
 */

export function toFEOrder(orderBE: OrderBE): OrderFE {
  const createdAt = parseDate(orderBE.createdAt) || new Date();
  const updatedAt = parseDate(orderBE.updatedAt) || new Date();
  const paidAt = parseDate(orderBE.paidAt);
  const estimatedDelivery = parseDate(orderBE.estimatedDelivery);
  const deliveredAt = parseDate(orderBE.deliveredAt);
  const cancelledAt = parseDate(orderBE.cancelledAt);
  const refundedAt = parseDate(orderBE.refundedAt);

  return {
    /** Id */
    id: orderBE.id,
    /** Order Number */
    orderNumber: orderBE.orderNumber,

    /** User Id */
    userId: orderBE.userId,
    /** User Email */
    userEmail: orderBE.userEmail,
    /** User Name */
    userName: orderBE.userName,

    /** Shop Id */
    shopId: orderBE.shopId,
    /** Shop Name */
    shopName: orderBE.shopName,
    /** Seller Id */
    sellerId: orderBE.sellerId,

    /** Items */
    items: orderBE.items.map(toFEOrderItem),
    /** Item Count */
    itemCount: orderBE.itemCount,

    /** Subtotal */
    subtotal: orderBE.subtotal,
    /** Discount */
    discount: orderBE.discount,
    /** Tax */
    tax: orderBE.tax,
    /** Shipping Cost */
    shippingCost: orderBE.shippingCost,
    /** Total */
    total: orderBE.total,

    /** Formatted Subtotal */
    formattedSubtotal: formatPrice(orderBE.subtotal),
    /** Formatted Discount */
    formattedDiscount: formatPrice(orderBE.discount),
    /** Formatted Tax */
    formattedTax: formatPrice(orderBE.tax),
    /** Formatted Shipping */
    formattedShipping: formatPrice(orderBE.shippingCost),
    /** Formatted Total */
    formattedTotal: formatPrice(orderBE.total),

    /** Coupon Id */
    couponId: orderBE.couponId,
    /** Coupon Code */
    couponCode: orderBE.couponCode,
    /** Coupon Discount */
    couponDiscount: orderBE.couponDiscount,
    /** Formatted Coupon Discount */
    formattedCouponDiscount: formatPrice(orderBE.couponDiscount),
    /** Has Coupon */
    hasCoupon: !!orderBE.couponCode,

    /** Payment Method */
    paymentMethod: orderBE.paymentMethod,
    /** Payment Status */
    paymentStatus: orderBE.paymentStatus,
    /** Payment Id */
    paymentId: orderBE.paymentId,
    /** Payment Gateway */
    paymentGateway: orderBE.paymentGateway,
    paidAt,

    /** Is Paid */
    isPaid: orderBE.paymentStatus === PaymentStatus.COMPLETED,
    /** Is Pending */
    isPending: orderBE.paymentStatus === PaymentStatus.PENDING,
    /** Is Failed */
    isFailed: orderBE.paymentStatus === PaymentStatus.FAILED,
    /** Is Refunded */
    isRefunded: orderBE.paymentStatus === PaymentStatus.REFUNDED,

    /** Shipping Method */
    shippingMethod: orderBE.shippingMethod,
    /** Shipping Address */
    shippingAddress: toFEShippingAddress(orderBE.shippingAddress),
    /** Tracking Number */
    trackingNumber: orderBE.trackingNumber,
    estimatedDelivery,
    deliveredAt,

    /** Has Tracking */
    hasTracking: !!orderBE.trackingNumber,
    /** Is Delivered */
    isDelivered: orderBE.status === OrderStatus.DELIVERED,

    /** Status */
    status: orderBE.status,
    cancelledAt,
    /** Cancel Reason */
    cancelReason: orderBE.cancelReason,
    /** Refund Amount */
    refundAmount: orderBE.refundAmount,
    refundedAt,

    /** Is Pending Order */
    isPendingOrder: orderBE.status === OrderStatus.PENDING,
    /** Is Confirmed */
    isConfirmed: orderBE.status === OrderStatus.CONFIRMED,
    /** Is Processing */
    isProcessing: orderBE.status === OrderStatus.PROCESSING,
    /** Is Shipped */
    isShipped: orderBE.status === OrderStatus.SHIPPED,
    /** Is Cancelled */
    isCancelled: orderBE.status === OrderStatus.CANCELLED,
    /** Can Cancel */
    canCancel:
      orderBE.status === OrderStatus.PENDING ||
      orderBE.status === OrderStatus.CONFIRMED,
    /** Can Track */
    canTrack:
      !!orderBE.trackingNumber && orderBE.status === OrderStatus.SHIPPED,

    /** Customer Notes */
    customerNotes: orderBE.customerNotes,
    /** Admin Notes */
    adminNotes: orderBE.adminNotes,

    createdAt,
    updatedAt,

    /** Order Date */
    orderDate: formatDate(createdAt),
    /** Order Time */
    orderTime: formatTime(createdAt),
    /** Estimated Delivery Display */
    estimatedDeliveryDisplay: formatEstimatedDelivery(
      estimatedDelivery,
      orderBE.status,
    ),
    /** Delivery Status */
    deliveryStatus: getDeliveryStatus(orderBE),

    /** Progress Percentage */
    progressPercentage: calculateProgress(orderBE.status),
    /** Progress Steps */
    progressSteps: generateProgressSteps(orderBE),
    /** Current Step */
    currentStep: getCurrentStep(orderBE.status),

    /** Badges */
    badges: generateOrderBadges(orderBE),

    /** Metadata */
    metadata: orderBE.metadata,

    // Backwards compatibility (admin pages)
    /** Customer Id */
    customerId: orderBE.userId,
    /** Billing Address */
    billingAddress: orderBE.billingAddress
      ? toFEShippingAddress(orderBE.billingAddress)
      : null,
    /** Shipping Provider */
    shippingProvider: orderBE.shippingProvider || null,
    /** Internal Notes */
    internalNotes: orderBE.adminNotes,
    /** Shipping */
    shipping: orderBE.shippingCost,
  };
}

/**
 * Transform Backend Order List Item to Frontend Order Card
 */
/**
 * Performs to f e order card operation
 *
 * @param {OrderListItemBE} orderBE - The order b e
 *
 * @returns {any} The tofeordercard result
 *
 * @example
 * toFEOrderCard(orderBE);
 */

/**
 * Performs to f e order card operation
 *
 * @param {OrderListItemBE} orderBE - The order b e
 *
 * @returns {any} The tofeordercard result
 *
 * @example
 * toFEOrderCard(orderBE);
 */

export function toFEOrderCard(orderBE: OrderListItemBE): OrderCardFE {
  const createdAt = parseDate(orderBE.createdAt) || new Date();

  return {
    /** Id */
    id: orderBE.id,
    /** Order Number */
    orderNumber: orderBE.orderNumber,
    /** Shop Name */
    shopName: orderBE.shopName,
    /** Item Count */
    itemCount: orderBE.itemCount,
    /** Total */
    total: orderBE.total,
    /** Formatted Total */
    formattedTotal: formatPrice(orderBE.total),
    /** Status */
    status: orderBE.status,
    /** Payment Status */
    paymentStatus: orderBE.paymentStatus,
    /** Order Date */
    orderDate: formatDate(createdAt),
    /** Badges */
    badges: orderBE.status === OrderStatus.CANCELLED ? ["Cancelled"] : [],
    /** Is Paid */
    isPaid: orderBE.paymentStatus === PaymentStatus.COMPLETED,
    /** Can Cancel */
    canCancel:
      orderBE.status === OrderStatus.PENDING ||
      orderBE.status === OrderStatus.CONFIRMED,

    // Backwards compatibility (admin pages)
    /** Shipping Address */
    shippingAddress: orderBE.shippingAddress
      ? {
          /** Name */
          name: orderBE.shippingAddress.fullName,
          /** Phone */
          phone: orderBE.shippingAddress.phoneNumber,
        }
      : undefined,
    /** Created At */
    createdAt: formatDate(createdAt),
    items: [], // Not available in list response
    /** Payment Method */
    paymentMethod: orderBE.paymentMethod || undefined,
  };
}

/**
 * Transform Frontend Create Order Form to Backend Request
 */
/**
 * Performs to b e create order request operation
 *
 * @param {CreateOrderFormFE} formData - The form data
 *
 * @returns {any} The tobecreateorderrequest result
 *
 * @example
 * toBECreateOrderRequest(formData);
 */

/**
 * Performs to b e create order request operation
 *
 * @param {CreateOrderFormFE} /** Form Data */
  formData - The /**  form  data */
  form data
 *
 * @returns {any} The tobecreateorderrequest result
 *
 * @example
 * toBECreateOrderRequest(/** Form Data */
  formData);
 */

/**
 * Performs to b e create order request operation
 *
 * @param {CreateOrderFormFE} formData - The formdata
 *
 * @returns {CreateOrderRequestBE} The tobecreateorderrequest result
 *
 * @example
 * toBECreateOrderRequest(formData);
 */
export function toBECreateOrderRequest(
  /** Form Data */
  formData: CreateOrderFormFE,
): CreateOrderRequestBE {
  return {
    userId: "", // Will be set by service layer
    /** Items */
    items: formData.items,
    /** Shipping Address Id */
    shippingAddressId: formData.shippingAddressId,
    /** Payment Method */
    paymentMethod: formData.paymentMethod,
    /** Shipping Method */
    shippingMethod: formData.shippingMethod,
    /** Coupon Code */
    couponCode: formData.couponCode,
    /** Customer Notes */
    customerNotes: formData.customerNotes,
  };
}

/**
 * Batch transform Backend Orders to Frontend Orders
 */
/**
 * Performs to f e orders operation
 *
 * @param {OrderBE[]} ordersBE - The orders b e
 *
 * @returns {any} The tofeorders result
 *
 * @example
 * toFEOrders(ordersBE);
 */

/**
 * Performs to f e orders operation
 *
 * @param {OrderBE[]} ordersBE - The orders b e
 *
 * @returns {any} The tofeorders result
 *
 * @example
 * toFEOrders(ordersBE);
 */

export function toFEOrders(ordersBE: OrderBE[]): OrderFE[] {
  return ordersBE.map(toFEOrder);
}

/**
 * Batch transform Backend Order List Items to Frontend Order Cards
 */
/**
 * Performs to f e order cards operation
 *
 * @param {OrderListItemBE[]} ordersBE - The orders b e
 *
 * @returns {any} The tofeordercards result
 *
 * @example
 * toFEOrderCards(ordersBE);
 */

/**
 * Performs to f e order cards operation
 *
 * @param {OrderListItemBE[]} ordersBE - The orders b e
 *
 * @returns {any} The tofeordercards result
 *
 * @example
 * toFEOrderCards(ordersBE);
 */

export function toFEOrderCards(ordersBE: OrderListItemBE[]): OrderCardFE[] {
  return ordersBE.map(toFEOrderCard);
}

/**
 * Transform order status update to backend request
 */
/**
 * Performs to b e update order status request operation
 *
 * @param {string} status - The status
 * @param {string} [notes] - The notes
 *
 * @returns {string} The tobeupdateorderstatusrequest result
 *
 * @example
 * toBEUpdateOrderStatusRequest("example", "example");
 */

/**
 * Performs to b e update order status request operation
 *
 * @param {string} status - The status
 * @param {string} [notes] - The notes
 *
 * @returns {string} The tobeupdateorderstatusrequest result
 *
 * @example
 * toBEUpdateOrderStatusRequest("example", "example");
 */

export function toBEUpdateOrderStatusRequest(status: string, notes?: string) {
  return {
    status,
    /** Notes */
    notes: notes || undefined,
  };
}

/**
 * Transform shipment creation to backend request
 */
/**
 * Performs to b e create shipment request operation
 *
 * @param {string} trackingNumber - The tracking number
 * @param {string} carrier - The carrier
 * @param {Date} [estimatedDelivery] - The estimated delivery
 *
 * @returns {string} The tobecreateshipmentrequest result
 *
 * @example
 * toBECreateShipmentRequest("example", "example", estimatedDelivery);
 */

/**
 * Performs to b e create shipment request operation
 *
 * @returns {string} The tobecreateshipmentrequest result
 *
 * @example
 * toBECreateShipmentRequest();
 */

export function toBECreateShipmentRequest(
  /** Tracking Number */
  trackingNumber: string,
  /** Carrier */
  carrier: string,
  /** Estimated Delivery */
  estimatedDelivery?: Date,
) {
  return {
    trackingNumber,
    carrier,
    /** Eta */
    eta: estimatedDelivery
      ? safeToISOString(estimatedDelivery) || undefined
      : undefined,
  };
}
