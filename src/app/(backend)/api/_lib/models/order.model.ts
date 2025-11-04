/**
 * Order Model
 * 
 * Database layer for order operations with transaction safety and concurrency control
 * 
 * Features:
 * - Transaction-safe create/update operations
 * - Optimistic locking using version field
 * - Atomic status updates
 * - Order number generation
 * - Multi-filter queries
 */

import { getAdminDb } from '../database/admin';
import { Order } from '@/types/order';
import { ConflictError, NotFoundError, InternalServerError } from '../middleware/error-handler';

// Extend Order with version for concurrency control
export interface OrderWithVersion extends Order {
  version: number;
}

export class OrderModel {
  private collection: FirebaseFirestore.CollectionReference;

  constructor() {
    const db = getAdminDb();
    this.collection = db.collection('orders');
  }

  /**
   * Generate unique order number
   * Format: ORD-YYYYMMDD-XXXXX (e.g., ORD-20241103-00001)
   */
  private async generateOrderNumber(): Promise<string> {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0].replace(/-/g, ''); // YYYYMMDD
    
    // Get today's order count
    const startOfDay = new Date(now.setHours(0, 0, 0, 0)).toISOString();
    const endOfDay = new Date(now.setHours(23, 59, 59, 999)).toISOString();
    
    const snapshot = await this.collection
      .where('createdAt', '>=', startOfDay)
      .where('createdAt', '<=', endOfDay)
      .count()
      .get();
    
    const count = snapshot.data().count + 1;
    const orderNumber = `ORD-${dateStr}-${String(count).padStart(5, '0')}`;
    
    return orderNumber;
  }

  /**
   * Create a new order with transaction safety
   * Generates unique order number and sets initial status
   */
  async create(data: Partial<Order> & { userId: string; items: Order['items'] }): Promise<OrderWithVersion> {
    const db = getAdminDb();
    
    try {
      const order = await db.runTransaction(async (transaction) => {
        // Generate unique order number
        const orderNumber = await this.generateOrderNumber();

        // Create order data
        const now = new Date().toISOString();
        const orderData: Omit<OrderWithVersion, 'id'> = {
          // Required fields
          orderNumber,
          userId: data.userId,
          userName: data.userName || '',
          userEmail: data.userEmail || '',
          items: data.items,
          
          // Seller info (optional - for single-seller orders)
          sellerId: data.sellerId,
          sellerName: data.sellerName,
          
          // Pricing (all in INR)
          subtotal: data.subtotal || 0,
          couponDiscount: data.couponDiscount || 0,
          saleDiscount: data.saleDiscount || 0,
          shippingCharges: data.shippingCharges || 0,
          platformFee: data.platformFee || 0,
          tax: data.tax || 0,
          total: data.total || 0,
          
          // Currency
          currency: data.currency || 'INR',
          exchangeRate: data.exchangeRate || 1,
          originalAmount: data.originalAmount || data.total || 0,
          
          // Payment
          paymentMethod: data.paymentMethod || 'cod',
          paymentStatus: data.paymentStatus || 'pending',
          paymentId: data.paymentId,
          transactionId: data.transactionId,
          razorpayOrderId: data.razorpayOrderId,
          paypalOrderId: data.paypalOrderId,
          
          // Addresses
          shippingAddress: data.shippingAddress!,
          billingAddress: data.billingAddress || data.shippingAddress!,
          
          // Status
          status: data.status || 'pending_payment',
          
          // Tracking
          trackingNumber: data.trackingNumber,
          shipmentId: data.shipmentId,
          courierName: data.courierName,
          estimatedDelivery: data.estimatedDelivery,
          
          // Notes
          customerNotes: data.customerNotes,
          sellerNotes: data.sellerNotes,
          cancellationReason: data.cancellationReason,
          
          // Timestamps
          createdAt: now,
          updatedAt: now,
          paidAt: data.paidAt,
          approvedAt: data.approvedAt,
          shippedAt: data.shippedAt,
          deliveredAt: data.deliveredAt,
          cancelledAt: data.cancelledAt,
          refundedAt: data.refundedAt,
          
          // Concurrency control
          version: 1,
        };

        // Create document with auto-generated ID
        const docRef = this.collection.doc();
        transaction.create(docRef, orderData);

        return { id: docRef.id, ...orderData };
      });

      return order;
    } catch (error) {
      console.error('[OrderModel] Create error:', error);
      throw new InternalServerError('Failed to create order');
    }
  }

  /**
   * Find order by ID
   */
  async findById(id: string): Promise<OrderWithVersion | null> {
    try {
      const doc = await this.collection.doc(id).get();
      
      if (!doc.exists) {
        return null;
      }

      return {
        id: doc.id,
        ...doc.data(),
      } as OrderWithVersion;
    } catch (error) {
      console.error('[OrderModel] FindById error:', error);
      throw new InternalServerError('Failed to fetch order');
    }
  }

  /**
   * Find order by order number
   */
  async findByOrderNumber(orderNumber: string): Promise<OrderWithVersion | null> {
    try {
      const snapshot = await this.collection
        .where('orderNumber', '==', orderNumber)
        .limit(1)
        .get();

      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data(),
      } as OrderWithVersion;
    } catch (error) {
      console.error('[OrderModel] FindByOrderNumber error:', error);
      throw new InternalServerError('Failed to fetch order');
    }
  }

  /**
   * Find all orders by user ID
   */
  async findByUser(
    userId: string,
    filters?: {
      status?: Order['status'];
      paymentStatus?: Order['paymentStatus'];
      startDate?: string;
      endDate?: string;
    },
    pagination?: {
      limit?: number;
      offset?: number;
    }
  ): Promise<OrderWithVersion[]> {
    try {
      let query: FirebaseFirestore.Query = this.collection.where('userId', '==', userId);

      // Apply filters
      if (filters?.status) {
        query = query.where('status', '==', filters.status);
      }
      if (filters?.paymentStatus) {
        query = query.where('paymentStatus', '==', filters.paymentStatus);
      }
      if (filters?.startDate) {
        query = query.where('createdAt', '>=', filters.startDate);
      }
      if (filters?.endDate) {
        query = query.where('createdAt', '<=', filters.endDate);
      }

      // Sort by most recent
      query = query.orderBy('createdAt', 'desc');

      // Pagination
      const limit = pagination?.limit ?? 50;
      const offset = pagination?.offset ?? 0;
      query = query.limit(limit).offset(offset);

      const snapshot = await query.get();
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as OrderWithVersion));
    } catch (error) {
      console.error('[OrderModel] FindByUser error:', error);
      throw new InternalServerError('Failed to fetch user orders');
    }
  }

  /**
   * Find all orders by seller ID
   */
  async findBySeller(
    sellerId: string,
    filters?: {
      status?: Order['status'];
      paymentStatus?: Order['paymentStatus'];
      startDate?: string;
      endDate?: string;
    },
    pagination?: {
      limit?: number;
      offset?: number;
    }
  ): Promise<OrderWithVersion[]> {
    try {
      let query: FirebaseFirestore.Query = this.collection.where('sellerId', '==', sellerId);

      // Apply filters
      if (filters?.status) {
        query = query.where('status', '==', filters.status);
      }
      if (filters?.paymentStatus) {
        query = query.where('paymentStatus', '==', filters.paymentStatus);
      }
      if (filters?.startDate) {
        query = query.where('createdAt', '>=', filters.startDate);
      }
      if (filters?.endDate) {
        query = query.where('createdAt', '<=', filters.endDate);
      }

      // Sort by most recent
      query = query.orderBy('createdAt', 'desc');

      // Pagination
      const limit = pagination?.limit ?? 50;
      const offset = pagination?.offset ?? 0;
      query = query.limit(limit).offset(offset);

      const snapshot = await query.get();
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as OrderWithVersion));
    } catch (error) {
      console.error('[OrderModel] FindBySeller error:', error);
      throw new InternalServerError('Failed to fetch seller orders');
    }
  }

  /**
   * Find all orders with filters (Admin)
   */
  async findAll(
    filters?: {
      status?: Order['status'];
      paymentStatus?: Order['paymentStatus'];
      paymentMethod?: Order['paymentMethod'];
      userId?: string;
      sellerId?: string;
      startDate?: string;
      endDate?: string;
      minTotal?: number;
      maxTotal?: number;
    },
    pagination?: {
      limit?: number;
      offset?: number;
    }
  ): Promise<OrderWithVersion[]> {
    try {
      let query: FirebaseFirestore.Query = this.collection;

      // Apply filters
      if (filters?.status) {
        query = query.where('status', '==', filters.status);
      }
      if (filters?.paymentStatus) {
        query = query.where('paymentStatus', '==', filters.paymentStatus);
      }
      if (filters?.paymentMethod) {
        query = query.where('paymentMethod', '==', filters.paymentMethod);
      }
      if (filters?.userId) {
        query = query.where('userId', '==', filters.userId);
      }
      if (filters?.sellerId) {
        query = query.where('sellerId', '==', filters.sellerId);
      }
      if (filters?.startDate) {
        query = query.where('createdAt', '>=', filters.startDate);
      }
      if (filters?.endDate) {
        query = query.where('createdAt', '<=', filters.endDate);
      }

      // Sort by most recent
      query = query.orderBy('createdAt', 'desc');

      // Pagination
      const limit = pagination?.limit ?? 50;
      const offset = pagination?.offset ?? 0;
      query = query.limit(limit).offset(offset);

      const snapshot = await query.get();
      let orders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as OrderWithVersion));

      // In-memory filters for price range
      if (filters?.minTotal !== undefined) {
        orders = orders.filter(o => o.total >= filters.minTotal!);
      }
      if (filters?.maxTotal !== undefined) {
        orders = orders.filter(o => o.total <= filters.maxTotal!);
      }

      return orders;
    } catch (error) {
      console.error('[OrderModel] FindAll error:', error);
      throw new InternalServerError('Failed to fetch orders');
    }
  }

  /**
   * Update order with optimistic locking
   */
  async update(
    id: string,
    data: Partial<Order>,
    expectedVersion?: number
  ): Promise<OrderWithVersion> {
    const db = getAdminDb();

    try {
      const docRef = this.collection.doc(id);

      const order = await db.runTransaction(async (transaction) => {
        const doc = await transaction.get(docRef);

        if (!doc.exists) {
          throw new NotFoundError('Order not found');
        }

        const currentData = doc.data() as OrderWithVersion;

        // Optimistic locking: check version if provided
        if (expectedVersion !== undefined && currentData.version !== expectedVersion) {
          throw new ConflictError(
            `Order was modified by another process. Expected version ${expectedVersion}, got ${currentData.version}`
          );
        }

        const now = new Date().toISOString();
        const updateData = {
          ...data,
          updatedAt: now,
          version: currentData.version + 1,
        };

        transaction.update(docRef, updateData);

        return {
          ...currentData,
          ...updateData,
          id: doc.id,
        } as OrderWithVersion;
      });

      return order;
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ConflictError) {
        throw error;
      }
      console.error('[OrderModel] Update error:', error);
      throw new InternalServerError('Failed to update order');
    }
  }

  /**
   * Update order status atomically
   * Handles status-specific timestamp updates
   */
  async updateStatus(
    id: string,
    status: Order['status'],
    additionalData?: {
      trackingNumber?: string;
      courierName?: string;
      shipmentId?: string;
      estimatedDelivery?: string;
      sellerNotes?: string;
    }
  ): Promise<OrderWithVersion> {
    const db = getAdminDb();

    try {
      const docRef = this.collection.doc(id);

      const order = await db.runTransaction(async (transaction) => {
        const doc = await transaction.get(docRef);

        if (!doc.exists) {
          throw new NotFoundError('Order not found');
        }

        const currentData = doc.data() as OrderWithVersion;
        const now = new Date().toISOString();

        // Prepare update data with status-specific timestamps
        const updateData: any = {
          status,
          updatedAt: now,
          version: currentData.version + 1,
          ...additionalData,
        };

        // Set status-specific timestamps
        if (status === 'pending_approval' && !currentData.paidAt) {
          updateData.paidAt = now;
        }
        if (status === 'processing' && !currentData.approvedAt) {
          updateData.approvedAt = now;
        }
        if (status === 'shipped' && !currentData.shippedAt) {
          updateData.shippedAt = now;
        }
        if (status === 'delivered' && !currentData.deliveredAt) {
          updateData.deliveredAt = now;
        }
        if (status === 'cancelled' && !currentData.cancelledAt) {
          updateData.cancelledAt = now;
        }
        if (status === 'refunded' && !currentData.refundedAt) {
          updateData.refundedAt = now;
        }

        transaction.update(docRef, updateData);

        return {
          ...currentData,
          ...updateData,
          id: doc.id,
        } as OrderWithVersion;
      });

      return order;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      console.error('[OrderModel] UpdateStatus error:', error);
      throw new InternalServerError('Failed to update order status');
    }
  }

  /**
   * Cancel order
   */
  async cancel(id: string, reason: string): Promise<OrderWithVersion> {
    const db = getAdminDb();

    try {
      const docRef = this.collection.doc(id);

      const order = await db.runTransaction(async (transaction) => {
        const doc = await transaction.get(docRef);

        if (!doc.exists) {
          throw new NotFoundError('Order not found');
        }

        const currentData = doc.data() as OrderWithVersion;

        // Business rule: Only certain statuses can be cancelled
        const cancellableStatuses: Order['status'][] = [
          'pending_payment',
          'pending_approval',
          'processing',
        ];

        if (!cancellableStatuses.includes(currentData.status)) {
          throw new ConflictError(
            `Cannot cancel order with status: ${currentData.status}`
          );
        }

        const now = new Date().toISOString();
        const updateData = {
          status: 'cancelled' as Order['status'],
          cancellationReason: reason,
          cancelledAt: now,
          updatedAt: now,
          version: currentData.version + 1,
        };

        transaction.update(docRef, updateData);

        return {
          ...currentData,
          ...updateData,
          id: doc.id,
        } as OrderWithVersion;
      });

      return order;
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ConflictError) {
        throw error;
      }
      console.error('[OrderModel] Cancel error:', error);
      throw new InternalServerError('Failed to cancel order');
    }
  }

  /**
   * Track order by order number and email (public)
   */
  async trackByNumber(orderNumber: string, email: string): Promise<OrderWithVersion | null> {
    try {
      const snapshot = await this.collection
        .where('orderNumber', '==', orderNumber)
        .where('userEmail', '==', email)
        .limit(1)
        .get();

      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data(),
      } as OrderWithVersion;
    } catch (error) {
      console.error('[OrderModel] TrackByNumber error:', error);
      throw new InternalServerError('Failed to track order');
    }
  }

  /**
   * Count orders with filters
   */
  async count(filters?: {
    status?: Order['status'];
    paymentStatus?: Order['paymentStatus'];
    userId?: string;
    sellerId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<number> {
    try {
      let query: FirebaseFirestore.Query = this.collection;

      if (filters?.status) {
        query = query.where('status', '==', filters.status);
      }
      if (filters?.paymentStatus) {
        query = query.where('paymentStatus', '==', filters.paymentStatus);
      }
      if (filters?.userId) {
        query = query.where('userId', '==', filters.userId);
      }
      if (filters?.sellerId) {
        query = query.where('sellerId', '==', filters.sellerId);
      }
      if (filters?.startDate) {
        query = query.where('createdAt', '>=', filters.startDate);
      }
      if (filters?.endDate) {
        query = query.where('createdAt', '<=', filters.endDate);
      }

      const snapshot = await query.count().get();
      return snapshot.data().count;
    } catch (error) {
      console.error('[OrderModel] Count error:', error);
      throw new InternalServerError('Failed to count orders');
    }
  }

  /**
   * Bulk update orders (batch operation)
   */
  async bulkUpdate(
    updates: Array<{ id: string; data: Partial<Order> }>
  ): Promise<void> {
    const db = getAdminDb();
    const batch = db.batch();

    try {
      const now = new Date().toISOString();

      for (const { id, data } of updates) {
        const docRef = this.collection.doc(id);
        batch.update(docRef, {
          ...data,
          updatedAt: now,
        });
      }

      await batch.commit();
    } catch (error) {
      console.error('[OrderModel] BulkUpdate error:', error);
      throw new InternalServerError('Failed to bulk update orders');
    }
  }
}

// Export singleton instance
export const orderModel = new OrderModel();
