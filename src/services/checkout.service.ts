export const checkoutService = {
  async createOrder(data: {
    shippingAddressId: string;
    billingAddressId?: string;
    paymentMethod: 'razorpay' | 'cod';
    couponCode?: string;
    notes?: string;
  }) {
    const response = await fetch('/api/checkout/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create order');
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
    const response = await fetch('/api/checkout/verify-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to verify payment');
    }

    return response.json();
  },
};
