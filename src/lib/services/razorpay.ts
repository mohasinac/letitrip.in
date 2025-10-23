/**
 * Razorpay Payment Service
 */

import Razorpay from 'razorpay';
import crypto from 'crypto';
import { RAZORPAY_CONFIG, validateRazorpayConfig } from '@/lib/config/payment';
import type { RazorpayOrder, RazorpayPayment } from '@/types';

// Validate configuration on module load
validateRazorpayConfig();

class RazorpayService {
  private razorpay: Razorpay;

  constructor() {
    this.razorpay = new Razorpay({
      key_id: RAZORPAY_CONFIG.KEY_ID,
      key_secret: RAZORPAY_CONFIG.KEY_SECRET,
    });
  }

  /**
   * Create a Razorpay order
   */
  async createOrder(params: {
    amount: number; // in paisa
    currency?: string;
    receipt: string;
    notes?: any;
  }): Promise<RazorpayOrder> {
    try {
      const options = {
        amount: params.amount,
        currency: params.currency || RAZORPAY_CONFIG.DEFAULT_CURRENCY,
        receipt: params.receipt,
        notes: params.notes || {},
      };

      const order = await this.razorpay.orders.create(options);
      return order as RazorpayOrder;
    } catch (error) {
      console.error('Razorpay create order error:', error);
      throw new Error('Failed to create payment order');
    }
  }

  /**
   * Verify payment signature
   */
  verifyPayment(params: {
    orderId: string;
    paymentId: string;
    signature: string;
  }): boolean {
    try {
      const { orderId, paymentId, signature } = params;
      
      const body = orderId + '|' + paymentId;
      const expectedSignature = crypto
        .createHmac('sha256', RAZORPAY_CONFIG.KEY_SECRET)
        .update(body.toString())
        .digest('hex');

      return expectedSignature === signature;
    } catch (error) {
      console.error('Razorpay verify payment error:', error);
      return false;
    }
  }

  /**
   * Verify webhook signature
   */
  verifyWebhook(body: string, signature: string): boolean {
    try {
      const expectedSignature = crypto
        .createHmac('sha256', RAZORPAY_CONFIG.WEBHOOK_SECRET)
        .update(body)
        .digest('hex');

      return expectedSignature === signature;
    } catch (error) {
      console.error('Razorpay verify webhook error:', error);
      return false;
    }
  }

  /**
   * Capture payment
   */
  async capturePayment(paymentId: string, amount: number): Promise<any> {
    try {
      const payment = await this.razorpay.payments.capture(paymentId, amount, RAZORPAY_CONFIG.DEFAULT_CURRENCY);
      return payment;
    } catch (error) {
      console.error('Razorpay capture payment error:', error);
      throw new Error('Failed to capture payment');
    }
  }

  /**
   * Create refund
   */
  async createRefund(params: {
    paymentId: string;
    amount?: number;
    notes?: any;
  }): Promise<any> {
    try {
      const options: any = {
        notes: params.notes || {},
      };

      if (params.amount) {
        options.amount = params.amount;
      }

      const refund = await this.razorpay.payments.refund(params.paymentId, options);
      return refund;
    } catch (error) {
      console.error('Razorpay create refund error:', error);
      throw new Error('Failed to create refund');
    }
  }

  /**
   * Fetch payment details
   */
  async getPayment(paymentId: string): Promise<any> {
    try {
      const payment = await this.razorpay.payments.fetch(paymentId);
      return payment;
    } catch (error) {
      console.error('Razorpay get payment error:', error);
      throw new Error('Failed to fetch payment details');
    }
  }

  /**
   * Fetch order details
   */
  async getOrder(orderId: string): Promise<RazorpayOrder> {
    try {
      const order = await this.razorpay.orders.fetch(orderId);
      return order as RazorpayOrder;
    } catch (error) {
      console.error('Razorpay get order error:', error);
      throw new Error('Failed to fetch order details');
    }
  }

  /**
   * Generate payment options for frontend
   */
  generatePaymentOptions(params: {
    orderId: string;
    amount: number;
    currency?: string;
    name: string;
    description: string;
    customerName?: string;
    customerEmail?: string;
    customerContact?: string;
  }) {
    return {
      key: RAZORPAY_CONFIG.KEY_ID,
      amount: params.amount,
      currency: params.currency || RAZORPAY_CONFIG.DEFAULT_CURRENCY,
      name: params.name,
      description: params.description,
      order_id: params.orderId,
      prefill: {
        name: params.customerName,
        email: params.customerEmail,
        contact: params.customerContact,
      },
      ...RAZORPAY_CONFIG.OPTIONS,
    };
  }
}

export const razorpayService = new RazorpayService();
