/**
 * Payment Model
 * 
 * Handles payment operations:
 * - Payment recording (Razorpay, PayPal, COD)
 * - Transaction tracking
 * - Refund management
 * - Payment verification
 * - Payment status updates
 * 
 * Payment Flow:
 * 1. Create payment order (Razorpay/PayPal)
 * 2. User completes payment on gateway
 * 3. Verify payment signature/capture
 * 4. Record payment in Firestore
 * 5. Update order status
 */

import { getAdminDb } from '../database/admin';
import { NotFoundError, ValidationError, ConflictError } from '../middleware/error-handler';

// Payment types
export interface Payment {
  id: string;
  orderId: string;
  userId: string;
  amount: number;
  currency: string;
  method: 'razorpay' | 'paypal' | 'cod';
  status: 'pending' | 'completed' | 'failed' | 'refunded' | 'partially_refunded';
  
  // Gateway-specific data
  gatewayOrderId?: string; // Razorpay order ID or PayPal order ID
  gatewayPaymentId?: string; // Razorpay payment ID or PayPal capture ID
  transactionId?: string;
  
  // Razorpay specific
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  
  // PayPal specific
  paypalOrderId?: string;
  paypalCaptureId?: string;
  
  // Refund tracking
  refundAmount?: number;
  refundReason?: string;
  refundedAt?: Date;
  refundId?: string;
  
  // Metadata
  paidAt?: Date;
  failureReason?: string;
  metadata?: Record<string, any>;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePaymentData {
  orderId: string;
  userId: string;
  amount: number;
  currency: string;
  method: 'razorpay' | 'paypal' | 'cod';
  gatewayOrderId?: string;
  metadata?: Record<string, any>;
}

export interface UpdatePaymentData {
  status?: 'completed' | 'failed' | 'refunded' | 'partially_refunded';
  gatewayPaymentId?: string;
  transactionId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  paypalCaptureId?: string;
  paidAt?: Date;
  failureReason?: string;
  metadata?: Record<string, any>;
}

export interface RefundData {
  amount?: number; // Partial refund if specified, full refund if not
  reason: string;
  refundId: string;
}

const PAYMENTS_COLLECTION = 'payments';
const ORDERS_COLLECTION = 'orders';

export class PaymentModel {
  /**
   * Create a new payment record
   */
  static async create(data: CreatePaymentData): Promise<Payment> {
    const db = getAdminDb();
    const paymentsRef = db.collection(PAYMENTS_COLLECTION);
    
    // Validate required fields
    if (!data.orderId || !data.userId || !data.amount || !data.method) {
      throw new ValidationError('Order ID, user ID, amount, and payment method are required');
    }
    
    if (data.amount <= 0) {
      throw new ValidationError('Amount must be greater than zero');
    }
    
    // Verify order exists
    const orderDoc = await db.collection(ORDERS_COLLECTION).doc(data.orderId).get();
    if (!orderDoc.exists) {
      throw new NotFoundError('Order not found');
    }
    
    // Check for duplicate payment
    const existingPayment = await paymentsRef
      .where('orderId', '==', data.orderId)
      .where('status', '==', 'completed')
      .get();
    
    if (!existingPayment.empty) {
      throw new ConflictError('Payment already completed for this order');
    }
    
    const now = new Date();
    const paymentData: Omit<Payment, 'id'> = {
      orderId: data.orderId,
      userId: data.userId,
      amount: data.amount,
      currency: data.currency || 'INR',
      method: data.method,
      status: data.method === 'cod' ? 'pending' : 'pending',
      gatewayOrderId: data.gatewayOrderId,
      metadata: data.metadata || {},
      createdAt: now,
      updatedAt: now,
    };
    
    // Add method-specific fields
    if (data.method === 'razorpay' && data.gatewayOrderId) {
      paymentData.razorpayOrderId = data.gatewayOrderId;
    } else if (data.method === 'paypal' && data.gatewayOrderId) {
      paymentData.paypalOrderId = data.gatewayOrderId;
    }
    
    const docRef = await paymentsRef.add(paymentData);
    
    return {
      id: docRef.id,
      ...paymentData,
    } as Payment;
  }
  
  /**
   * Find payment by ID
   */
  static async findById(paymentId: string): Promise<Payment | null> {
    const db = getAdminDb();
    const doc = await db.collection(PAYMENTS_COLLECTION).doc(paymentId).get();
    
    if (!doc.exists) {
      return null;
    }
    
    const data = doc.data()!;
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate?.() || data.createdAt,
      updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
      paidAt: data.paidAt?.toDate?.() || data.paidAt,
      refundedAt: data.refundedAt?.toDate?.() || data.refundedAt,
    } as Payment;
  }
  
  /**
   * Find payment by order ID
   */
  static async findByOrderId(orderId: string): Promise<Payment | null> {
    const db = getAdminDb();
    const snapshot = await db.collection(PAYMENTS_COLLECTION)
      .where('orderId', '==', orderId)
      .orderBy('createdAt', 'desc')
      .limit(1)
      .get();
    
    if (snapshot.empty) {
      return null;
    }
    
    const doc = snapshot.docs[0];
    const data = doc.data();
    
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate?.() || data.createdAt,
      updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
      paidAt: data.paidAt?.toDate?.() || data.paidAt,
      refundedAt: data.refundedAt?.toDate?.() || data.refundedAt,
    } as Payment;
  }
  
  /**
   * Find payment by gateway order ID (Razorpay/PayPal)
   */
  static async findByGatewayOrderId(gatewayOrderId: string): Promise<Payment | null> {
    const db = getAdminDb();
    
    // Try both fields
    const razorpayQuery = db.collection(PAYMENTS_COLLECTION)
      .where('razorpayOrderId', '==', gatewayOrderId)
      .limit(1);
    
    const paypalQuery = db.collection(PAYMENTS_COLLECTION)
      .where('paypalOrderId', '==', gatewayOrderId)
      .limit(1);
    
    // Try Razorpay first
    let snapshot = await razorpayQuery.get();
    
    // If not found, try PayPal
    if (snapshot.empty) {
      snapshot = await paypalQuery.get();
    }
    
    if (snapshot.empty) {
      return null;
    }
    
    const doc = snapshot.docs[0];
    const data = doc.data();
    
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate?.() || data.createdAt,
      updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
      paidAt: data.paidAt?.toDate?.() || data.paidAt,
      refundedAt: data.refundedAt?.toDate?.() || data.refundedAt,
    } as Payment;
  }
  
  /**
   * Get all payments for a user
   */
  static async findByUserId(userId: string, limit: number = 50): Promise<Payment[]> {
    const db = getAdminDb();
    const snapshot = await db.collection(PAYMENTS_COLLECTION)
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
        paidAt: data.paidAt?.toDate?.() || data.paidAt,
        refundedAt: data.refundedAt?.toDate?.() || data.refundedAt,
      } as Payment;
    });
  }
  
  /**
   * Update payment status and details
   */
  static async update(paymentId: string, updates: UpdatePaymentData): Promise<Payment> {
    const db = getAdminDb();
    const paymentRef = db.collection(PAYMENTS_COLLECTION).doc(paymentId);
    
    const doc = await paymentRef.get();
    if (!doc.exists) {
      throw new NotFoundError('Payment not found');
    }
    
    const currentData = doc.data()!;
    
    // Prevent updating completed payments (except for refunds)
    if (currentData.status === 'completed' && updates.status && updates.status !== 'refunded' && updates.status !== 'partially_refunded') {
      throw new ConflictError('Cannot modify completed payment');
    }
    
    const updateData: any = {
      ...updates,
      updatedAt: new Date(),
    };
    
    // Add method-specific fields
    if (updates.razorpayPaymentId) {
      updateData.gatewayPaymentId = updates.razorpayPaymentId;
      updateData.transactionId = updates.razorpayPaymentId;
    } else if (updates.paypalCaptureId) {
      updateData.gatewayPaymentId = updates.paypalCaptureId;
      updateData.transactionId = updates.paypalCaptureId;
    }
    
    // Set paidAt when status becomes completed
    if (updates.status === 'completed' && !currentData.paidAt) {
      updateData.paidAt = updates.paidAt || new Date();
    }
    
    await paymentRef.update(updateData);
    
    return await this.findById(paymentId) as Payment;
  }
  
  /**
   * Mark payment as completed
   */
  static async markAsCompleted(
    paymentId: string,
    gatewayPaymentId: string,
    transactionId?: string
  ): Promise<Payment> {
    return await this.update(paymentId, {
      status: 'completed',
      gatewayPaymentId,
      transactionId: transactionId || gatewayPaymentId,
      paidAt: new Date(),
    });
  }
  
  /**
   * Mark payment as failed
   */
  static async markAsFailed(paymentId: string, reason: string): Promise<Payment> {
    return await this.update(paymentId, {
      status: 'failed',
      failureReason: reason,
    });
  }
  
  /**
   * Process refund
   */
  static async refund(paymentId: string, refundData: RefundData): Promise<Payment> {
    const db = getAdminDb();
    const paymentRef = db.collection(PAYMENTS_COLLECTION).doc(paymentId);
    
    const doc = await paymentRef.get();
    if (!doc.exists) {
      throw new NotFoundError('Payment not found');
    }
    
    const payment = doc.data()!;
    
    // Validate payment can be refunded
    if (payment.status !== 'completed') {
      throw new ValidationError('Only completed payments can be refunded');
    }
    
    const refundAmount = refundData.amount || payment.amount;
    
    // Validate refund amount
    if (refundAmount <= 0 || refundAmount > payment.amount) {
      throw new ValidationError('Invalid refund amount');
    }
    
    const currentRefundAmount = payment.refundAmount || 0;
    const totalRefunded = currentRefundAmount + refundAmount;
    
    if (totalRefunded > payment.amount) {
      throw new ValidationError('Refund amount exceeds payment amount');
    }
    
    const isPartialRefund = totalRefunded < payment.amount;
    
    const updateData: any = {
      status: isPartialRefund ? 'partially_refunded' : 'refunded',
      refundAmount: totalRefunded,
      refundReason: refundData.reason,
      refundId: refundData.refundId,
      refundedAt: new Date(),
      updatedAt: new Date(),
    };
    
    await paymentRef.update(updateData);
    
    return await this.findById(paymentId) as Payment;
  }
  
  /**
   * Update order payment status
   */
  static async updateOrderPaymentStatus(
    orderId: string,
    status: 'pending' | 'paid' | 'failed' | 'refunded',
    paymentDetails?: {
      paymentId?: string;
      transactionId?: string;
      gatewayOrderId?: string;
      paidAt?: Date;
    }
  ): Promise<void> {
    const db = getAdminDb();
    const orderRef = db.collection(ORDERS_COLLECTION).doc(orderId);
    
    const updateData: any = {
      paymentStatus: status,
      updatedAt: new Date(),
    };
    
    if (paymentDetails) {
      if (paymentDetails.paymentId) {
        updateData.paymentId = paymentDetails.paymentId;
      }
      if (paymentDetails.transactionId) {
        updateData.transactionId = paymentDetails.transactionId;
      }
      if (paymentDetails.gatewayOrderId) {
        updateData.gatewayOrderId = paymentDetails.gatewayOrderId;
      }
      if (paymentDetails.paidAt) {
        updateData.paidAt = paymentDetails.paidAt;
      }
    }
    
    // Update order status when payment is completed
    if (status === 'paid') {
      updateData.status = 'pending_approval'; // Move to next stage
      updateData.paidAt = paymentDetails?.paidAt || new Date();
    }
    
    await orderRef.update(updateData);
  }
  
  /**
   * Get payment statistics for a user
   */
  static async getUserPaymentStats(userId: string): Promise<{
    totalPaid: number;
    totalRefunded: number;
    totalTransactions: number;
    successfulTransactions: number;
    failedTransactions: number;
  }> {
    const payments = await this.findByUserId(userId, 1000);
    
    const stats = payments.reduce((acc, payment) => {
      acc.totalTransactions++;
      
      if (payment.status === 'completed') {
        acc.successfulTransactions++;
        acc.totalPaid += payment.amount;
      } else if (payment.status === 'failed') {
        acc.failedTransactions++;
      }
      
      if (payment.status === 'refunded' || payment.status === 'partially_refunded') {
        acc.totalRefunded += payment.refundAmount || 0;
      }
      
      return acc;
    }, {
      totalPaid: 0,
      totalRefunded: 0,
      totalTransactions: 0,
      successfulTransactions: 0,
      failedTransactions: 0,
    });
    
    return stats;
  }
}
