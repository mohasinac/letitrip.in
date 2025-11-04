/**
 * Payment Controller
 * 
 * Business logic for payment operations:
 * - Razorpay integration (create order, verify payment)
 * - PayPal integration (create order, capture payment)
 * - Payment recording and tracking
 * - Refund management
 * - Payment verification
 * 
 * All payment operations are user-scoped (no admin override for security)
 */

import { PaymentModel, CreatePaymentData, RefundData, Payment } from '../models/payment.model';
import { ValidationError, AuthorizationError, NotFoundError, ConflictError } from '../middleware/error-handler';
import {
  createRazorpayOrder,
  verifyRazorpaySignature,
  fetchRazorpayPayment,
  refundRazorpayPayment,
} from '../payment/razorpay-utils';
import {
  createPayPalOrder,
  capturePayPalPayment,
  convertToUSDWithFee,
  refundPayPalPayment,
} from '../payment/paypal-utils';

export interface UserContext {
  userId: string;
  role: 'admin' | 'seller' | 'user';
  email?: string;
}

/**
 * Create Razorpay order
 */
export async function createRazorpayOrderHandler(
  amount: number,
  currency: string = 'INR',
  context: UserContext
): Promise<{
  orderId: string;
  amount: number;
  currency: string;
  receipt: string;
}> {
  // Validate amount
  if (!amount || amount <= 0) {
    throw new ValidationError('Amount must be greater than zero');
  }
  
  // Validate currency
  if (currency && currency !== 'INR') {
    throw new ValidationError('Only INR currency is supported for Razorpay');
  }
  
  // Generate unique receipt
  const receipt = `order_${Date.now()}_${context.userId.substring(0, 8)}`;
  
  try {
    // Create Razorpay order
    const razorpayOrder = await createRazorpayOrder(amount, currency, receipt);
    
    return {
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      receipt: razorpayOrder.receipt || receipt,
    };
  } catch (error: any) {
    throw new Error(`Failed to create Razorpay order: ${error.message}`);
  }
}

/**
 * Verify Razorpay payment and update order
 */
export async function verifyRazorpayPaymentHandler(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string,
  orderId: string | undefined,
  context: UserContext
): Promise<{
  verified: boolean;
  paymentId: string;
  orderId?: string;
  status: string;
  amount: number;
}> {
  // Validate required fields
  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    throw new ValidationError('Missing payment verification details');
  }
  
  // Verify signature
  const isValid = verifyRazorpaySignature(
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature
  );
  
  if (!isValid) {
    throw new ValidationError('Invalid payment signature');
  }
  
  // Fetch payment details from Razorpay
  const paymentDetails = await fetchRazorpayPayment(razorpayPaymentId);
  
  // Update order if orderId is provided
  if (orderId) {
    // Find or create payment record
    let payment = await PaymentModel.findByOrderId(orderId);
    
    if (!payment) {
      // Create payment record if it doesn't exist
      payment = await PaymentModel.create({
        orderId,
        userId: context.userId,
        amount: paymentDetails.amount / 100, // Convert from paise to rupees
        currency: paymentDetails.currency,
        method: 'razorpay',
        gatewayOrderId: razorpayOrderId,
      });
    }
    
    // Verify payment belongs to user
    if (payment.userId !== context.userId) {
      throw new AuthorizationError('Unauthorized to verify this payment');
    }
    
    // Update payment as completed
    await PaymentModel.update(payment.id, {
      status: 'completed',
      razorpayPaymentId,
      razorpaySignature,
      gatewayPaymentId: razorpayPaymentId,
      transactionId: razorpayPaymentId,
      paidAt: new Date(),
    });
    
    // Update order payment status
    await PaymentModel.updateOrderPaymentStatus(orderId, 'paid', {
      paymentId: razorpayPaymentId,
      transactionId: razorpayPaymentId,
      gatewayOrderId: razorpayOrderId,
      paidAt: new Date(),
    });
  }
  
  return {
    verified: true,
    paymentId: razorpayPaymentId,
    orderId,
    status: paymentDetails.status,
    amount: paymentDetails.amount / 100,
  };
}

/**
 * Create PayPal order with USD conversion
 */
export async function createPayPalOrderHandler(
  amountINR: number,
  context: UserContext
): Promise<{
  orderId: string;
  status: string;
  amountINR: number;
  amountUSD: number;
  fee: number;
  total: number;
  exchangeRate: number;
}> {
  // Validate amount
  if (!amountINR || amountINR <= 0) {
    throw new ValidationError('Amount must be greater than zero');
  }
  
  try {
    // Convert INR to USD with 7% fee
    const conversion = convertToUSDWithFee(amountINR);
    
    // Create PayPal order
    const paypalOrder = await createPayPalOrder(conversion.total, 'USD');
    
    return {
      orderId: paypalOrder.id,
      status: paypalOrder.status,
      amountINR,
      amountUSD: conversion.usdAmount,
      fee: conversion.fee,
      total: conversion.total,
      exchangeRate: conversion.exchangeRate,
    };
  } catch (error: any) {
    throw new Error(`Failed to create PayPal order: ${error.message}`);
  }
}

/**
 * Capture PayPal payment and update order
 */
export async function capturePayPalPaymentHandler(
  paypalOrderId: string,
  orderId: string | undefined,
  context: UserContext
): Promise<{
  captured: boolean;
  paypalOrderId: string;
  orderId?: string;
  status: string;
  captureId: string;
}> {
  // Validate required fields
  if (!paypalOrderId) {
    throw new ValidationError('PayPal order ID is required');
  }
  
  try {
    // Capture the payment
    const captureData = await capturePayPalPayment(paypalOrderId);
    
    // Check if capture was successful
    if (captureData.status !== 'COMPLETED') {
      throw new ValidationError(`Payment capture failed with status: ${captureData.status}`);
    }
    
    const captureId = captureData.purchase_units[0]?.payments?.captures[0]?.id;
    
    if (!captureId) {
      throw new Error('Capture ID not found in PayPal response');
    }
    
    // Update order if orderId is provided
    if (orderId) {
      // Find or create payment record
      let payment = await PaymentModel.findByOrderId(orderId);
      
      if (!payment) {
        // Extract amount from capture data
        const captureAmount = captureData.purchase_units[0]?.payments?.captures[0]?.amount;
        const amountUSD = parseFloat(captureAmount?.value || '0');
        
        // Create payment record
        payment = await PaymentModel.create({
          orderId,
          userId: context.userId,
          amount: amountUSD,
          currency: captureAmount?.currency_code || 'USD',
          method: 'paypal',
          gatewayOrderId: paypalOrderId,
        });
      }
      
      // Verify payment belongs to user
      if (payment.userId !== context.userId) {
        throw new AuthorizationError('Unauthorized to capture this payment');
      }
      
      // Update payment as completed
      await PaymentModel.update(payment.id, {
        status: 'completed',
        paypalCaptureId: captureId,
        gatewayPaymentId: captureId,
        transactionId: captureId,
        paidAt: new Date(),
      });
      
      // Update order payment status
      await PaymentModel.updateOrderPaymentStatus(orderId, 'paid', {
        paymentId: captureId,
        transactionId: captureId,
        gatewayOrderId: paypalOrderId,
        paidAt: new Date(),
      });
    }
    
    return {
      captured: true,
      paypalOrderId,
      orderId,
      status: captureData.status,
      captureId,
    };
  } catch (error: any) {
    throw new Error(`Failed to capture PayPal payment: ${error.message}`);
  }
}

/**
 * Get payment by ID (owner or admin only)
 */
export async function getPaymentById(
  paymentId: string,
  context: UserContext
): Promise<Payment> {
  const payment = await PaymentModel.findById(paymentId);
  
  if (!payment) {
    throw new NotFoundError('Payment not found');
  }
  
  // Check authorization (owner or admin)
  if (payment.userId !== context.userId && context.role !== 'admin') {
    throw new AuthorizationError('Unauthorized to access this payment');
  }
  
  return payment;
}

/**
 * Get user payments (self or admin)
 */
export async function getUserPayments(
  targetUserId: string,
  context: UserContext,
  limit: number = 50
): Promise<Payment[]> {
  // Check authorization
  if (targetUserId !== context.userId && context.role !== 'admin') {
    throw new AuthorizationError('Unauthorized to access user payments');
  }
  
  return await PaymentModel.findByUserId(targetUserId, limit);
}

/**
 * Get payment by order ID (owner or admin)
 */
export async function getPaymentByOrderId(
  orderId: string,
  context: UserContext
): Promise<Payment | null> {
  const payment = await PaymentModel.findByOrderId(orderId);
  
  if (!payment) {
    return null;
  }
  
  // Check authorization
  if (payment.userId !== context.userId && context.role !== 'admin') {
    throw new AuthorizationError('Unauthorized to access this payment');
  }
  
  return payment;
}

/**
 * Refund payment (admin only)
 */
export async function refundPayment(
  paymentId: string,
  refundData: {
    amount?: number;
    reason: string;
  },
  context: UserContext
): Promise<Payment> {
  // Only admins can process refunds
  if (context.role !== 'admin') {
    throw new AuthorizationError('Only admins can process refunds');
  }
  
  // Get payment
  const payment = await PaymentModel.findById(paymentId);
  
  if (!payment) {
    throw new NotFoundError('Payment not found');
  }
  
  // Validate payment status
  if (payment.status !== 'completed') {
    throw new ValidationError('Only completed payments can be refunded');
  }
  
  const refundAmount = refundData.amount || payment.amount;
  
  try {
    let refundId: string;
    
    // Process refund on payment gateway
    if (payment.method === 'razorpay' && payment.razorpayPaymentId) {
      const refund = await refundRazorpayPayment(
        payment.razorpayPaymentId,
        refundData.amount
      );
      refundId = refund.id;
    } else if (payment.method === 'paypal' && payment.paypalCaptureId) {
      const refund = await refundPayPalPayment(
        payment.paypalCaptureId,
        refundData.amount,
        payment.currency
      );
      refundId = refund.id;
    } else if (payment.method === 'cod') {
      // COD refunds are processed manually
      refundId = `manual_refund_${Date.now()}`;
    } else {
      throw new ValidationError('Cannot process refund: missing gateway payment ID');
    }
    
    // Update payment record
    const updatedPayment = await PaymentModel.refund(paymentId, {
      amount: refundAmount,
      reason: refundData.reason,
      refundId,
    });
    
    // Update order payment status if fully refunded
    if (updatedPayment.status === 'refunded') {
      await PaymentModel.updateOrderPaymentStatus(payment.orderId, 'refunded');
    }
    
    return updatedPayment;
  } catch (error: any) {
    throw new Error(`Failed to process refund: ${error.message}`);
  }
}

/**
 * Get user payment statistics
 */
export async function getUserPaymentStats(
  targetUserId: string,
  context: UserContext
): Promise<{
  totalPaid: number;
  totalRefunded: number;
  totalTransactions: number;
  successfulTransactions: number;
  failedTransactions: number;
}> {
  // Check authorization
  if (targetUserId !== context.userId && context.role !== 'admin') {
    throw new AuthorizationError('Unauthorized to access user payment statistics');
  }
  
  return await PaymentModel.getUserPaymentStats(targetUserId);
}
