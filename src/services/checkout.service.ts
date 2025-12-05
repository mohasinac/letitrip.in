/**
 * @fileoverview Service Module
 * @module src/services/checkout.service
 * @description This file contains service functions for checkout operations
 * 
 * @created 2025-12-05
 * @author Development Team
 */

export const checkoutService = {
  async createOrder(data: {
    /** Shipping Address Id */
    shippingAddressId: string;
    /** Billing Address Id */
    billingAddressId?: string;
    /** Payment Method */
    paymentMethod: "razorpay" | "cod";
    /** Coupon Code */
    couponCode?: string;
    /** Notes */
    notes?: string;
  }) {
    const response = await fetch("/api/checkout/create-order", {
      /** Method */
      method: "POST",
      /** Headers */
      headers: { "Content-Type": "application/json" },
      /** Body */
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to create order");
    }

    return response.json();
  },

  async verifyPayment(data: {
    order_id?: string;
    order_ids?: string[];
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) {
    const response = await fetch("/api/checkout/verify-payment", {
      /** Method */
      method: "POST",
      /** Headers */
      headers: { "Content-Type": "application/json" },
      /** Body */
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to verify payment");
    }

    return response.json();
  },
};
