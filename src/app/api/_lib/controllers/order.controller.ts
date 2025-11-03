/**
 * Order Controller
 * 
 * Business logic layer for order operations
 * 
 * Features:
 * - Role-Based Access Control (RBAC)
 * - Order lifecycle management
 * - Payment status validation
 * - Inventory management integration (future)
 * - Audit logging
 */

import { orderModel, OrderWithVersion } from '../models/order.model';
import { Order, OrderStatus, PaymentMethod } from '@/types/order';
import { 
  ValidationError, 
  AuthorizationError, 
  NotFoundError,
  ConflictError 
} from '../middleware/error-handler';

export interface UserContext {
  uid: string;
  role: 'admin' | 'seller' | 'user';
  sellerId?: string;
  email?: string;
}

export class OrderController {
  /**
   * Create a new order
   * Authorization: Authenticated users only
   */
  async createOrder(
    data: Partial<Order> & { items: Order['items']; shippingAddress: Order['shippingAddress'] },
    user: UserContext
  ): Promise<OrderWithVersion> {
    // Validate items
    if (!data.items || data.items.length === 0) {
      throw new ValidationError('Order must have at least one item');
    }

    // Validate addresses
    if (!data.shippingAddress) {
      throw new ValidationError('Shipping address is required');
    }

    // Business validation
    this.validateOrderData(data);

    // Set user info
    const orderData = {
      ...data,
      userId: user.uid,
      userEmail: user.email || data.userEmail || '',
      userName: data.userName || '',
    };

    // Create order
    const order = await orderModel.create(orderData);

    console.log(`[OrderController] Order created: ${order.id} by user: ${user.uid}`);
    return order;
  }

  /**
   * Get user's orders
   * Authorization: Users see their own, sellers see their orders, admins see all
   */
  async getUserOrders(
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
    },
    user?: UserContext
  ): Promise<OrderWithVersion[]> {
    // Authorization check
    if (user && user.role === 'user' && user.uid !== userId) {
      throw new AuthorizationError('You can only view your own orders');
    }

    if (!user && userId !== 'public') {
      throw new AuthorizationError('Authentication required');
    }

    const orders = await orderModel.findByUser(userId, filters, pagination);
    return orders;
  }

  /**
   * Get seller's orders
   * Authorization: Sellers see their own, admins see all
   */
  async getSellerOrders(
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
    },
    user?: UserContext
  ): Promise<OrderWithVersion[]> {
    if (!user) {
      throw new AuthorizationError('Authentication required');
    }

    // Authorization check
    if (user.role === 'seller' && user.sellerId !== sellerId) {
      throw new AuthorizationError('You can only view your own seller orders');
    }

    if (user.role === 'user') {
      throw new AuthorizationError('Insufficient permissions');
    }

    const orders = await orderModel.findBySeller(sellerId, filters, pagination);
    return orders;
  }

  /**
   * Get all orders (Admin only)
   */
  async getAllOrders(
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
    },
    user?: UserContext
  ): Promise<OrderWithVersion[]> {
    if (!user || user.role !== 'admin') {
      throw new AuthorizationError('Admin access required');
    }

    const orders = await orderModel.findAll(filters, pagination);
    return orders;
  }

  /**
   * Get all orders (Admin only)
   * - Filter by status, seller, payment method
   * - Search by order number, customer name/email
   * - Pagination
   */
  async getAllOrdersAdmin(
    filters: {
      status?: OrderStatus | 'all';
      sellerId?: string;
      paymentMethod?: PaymentMethod | 'all';
      search?: string;
      page?: number;
      limit?: number;
    },
    user: UserContext
  ): Promise<{ orders: OrderWithVersion[]; pagination: any }> {
    // RBAC: Admin only
    if (user.role !== 'admin') {
      throw new AuthorizationError('Admin access required');
    }

    const page = filters.page || 1;
    const limit = filters.limit || 50;

    // Fetch orders with filters
    const allOrders = await orderModel.findAll({
      status: filters.status !== 'all' ? (filters.status as OrderStatus) : undefined,
      sellerId: filters.sellerId !== 'all' ? filters.sellerId : undefined,
      paymentMethod: filters.paymentMethod !== 'all' ? (filters.paymentMethod as PaymentMethod) : undefined,
    });

    let filteredOrders = allOrders;

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredOrders = filteredOrders.filter(
        (o) =>
          o.orderNumber?.toLowerCase().includes(searchLower) ||
          o.shippingAddress?.fullName?.toLowerCase().includes(searchLower) ||
          o.userEmail?.toLowerCase().includes(searchLower)
      );
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const paginatedOrders = filteredOrders.slice(startIndex, startIndex + limit);

    return {
      orders: paginatedOrders,
      pagination: {
        page,
        limit,
        total: filteredOrders.length,
        totalPages: Math.ceil(filteredOrders.length / limit),
      },
    };
  }

  /**
   * Get order statistics (Admin only)
   * - Total orders, status breakdown
   * - Revenue, payment method breakdown
   * - Unique seller count
   */
  async getOrderStatsAdmin(user: UserContext): Promise<any> {
    // RBAC: Admin only
    if (user.role !== 'admin') {
      throw new AuthorizationError('Admin access required');
    }

    const allOrders = await orderModel.findAll({});

    // Get unique sellers
    const uniqueSellers = new Set(allOrders.map((o) => o.sellerId));

    // Calculate stats
    const stats = {
      total: allOrders.length,
      pending: allOrders.filter((o) => o.status === 'pending_payment' || o.status === 'pending_approval').length,
      processing: allOrders.filter((o) => o.status === 'processing').length,
      shipped: allOrders.filter((o) => o.status === 'shipped').length,
      delivered: allOrders.filter((o) => o.status === 'delivered').length,
      cancelled: allOrders.filter((o) => o.status === 'cancelled').length,
      totalRevenue: allOrders
        .filter((o) => o.status === 'delivered')
        .reduce((sum, o) => sum + (o.total ?? 0), 0),
      totalSellers: uniqueSellers.size,
      codOrders: allOrders.filter((o) => o.paymentMethod === 'cod').length,
      prepaidOrders: allOrders.filter(
        (o) => o.paymentMethod === 'razorpay' || o.paymentMethod === 'paypal'
      ).length,
      avgOrderValue:
        allOrders.length > 0
          ? allOrders.reduce((sum, o) => sum + (o.total ?? 0), 0) / allOrders.length
          : 0,
    };

    return stats;
  }

  /**
   * Bulk update order status (Admin only)
   * - Update multiple orders to the same status
   */
  async bulkUpdateOrderStatus(
    ids: string[],
    status: Order['status'],
    user: UserContext
  ): Promise<{ updatedCount: number }> {
    // RBAC: Admin only
    if (user.role !== 'admin') {
      throw new AuthorizationError('Admin access required');
    }

    if (!ids || ids.length === 0) {
      throw new ValidationError('No order IDs provided');
    }

    if (!status) {
      throw new ValidationError('Status is required');
    }

    // Update each order
    for (const id of ids) {
      try {
        await orderModel.updateStatus(id, status);
      } catch (error) {
        console.error(`Failed to update order ${id}:`, error);
        // Continue with other orders even if one fails
      }
    }

    return { updatedCount: ids.length };
  }

  /**
   * Get order by ID
   * Authorization: Owner, seller (if their product), or admin
   */
  async getOrderById(id: string, user?: UserContext): Promise<OrderWithVersion> {
    const order = await orderModel.findById(id);

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    // Authorization check
    this.checkOrderAccess(order, user, 'view');

    return order;
  }

  /**
   * Update order
   * Authorization: Admins only (or sellers for certain fields)
   */
  async updateOrder(
    id: string,
    data: Partial<Order>,
    user: UserContext,
    expectedVersion?: number
  ): Promise<OrderWithVersion> {
    // Get existing order
    const existing = await orderModel.findById(id);
    if (!existing) {
      throw new NotFoundError('Order not found');
    }

    // Authorization check
    this.checkOrderAccess(existing, user, 'edit');

    // Business rule: Sellers can only update certain fields
    if (user.role === 'seller') {
      const allowedFields = ['trackingNumber', 'courierName', 'shipmentId', 'sellerNotes'];
      const attemptedFields = Object.keys(data);
      const invalidFields = attemptedFields.filter(f => !allowedFields.includes(f));
      
      if (invalidFields.length > 0) {
        throw new AuthorizationError(
          `Sellers can only update: ${allowedFields.join(', ')}`
        );
      }
    }

    // Update order
    const order = await orderModel.update(id, data, expectedVersion);

    console.log(`[OrderController] Order updated: ${id} by user: ${user.uid}`);
    return order;
  }

  /**
   * Update order status
   * Authorization: Sellers and admins
   */
  async updateOrderStatus(
    id: string,
    status: Order['status'],
    additionalData?: {
      trackingNumber?: string;
      courierName?: string;
      shipmentId?: string;
      estimatedDelivery?: string;
      sellerNotes?: string;
    },
    user?: UserContext
  ): Promise<OrderWithVersion> {
    if (!user) {
      throw new AuthorizationError('Authentication required');
    }

    // Get existing order
    const existing = await orderModel.findById(id);
    if (!existing) {
      throw new NotFoundError('Order not found');
    }

    // Authorization check
    this.checkOrderAccess(existing, user, 'edit');

    // Validate status transition
    this.validateStatusTransition(existing.status, status, user.role);

    // Update status
    const order = await orderModel.updateStatus(id, status, additionalData);

    console.log(
      `[OrderController] Order status updated: ${id} from ${existing.status} to ${status} by user: ${user.uid}`
    );
    return order;
  }

  /**
   * Cancel order
   * Authorization: Order owner (within time limit) or admin
   */
  async cancelOrder(
    id: string,
    reason: string,
    user: UserContext
  ): Promise<OrderWithVersion> {
    // Get existing order
    const existing = await orderModel.findById(id);
    if (!existing) {
      throw new NotFoundError('Order not found');
    }

    // Authorization check
    if (user.role === 'user') {
      // Users can only cancel their own orders
      if (existing.userId !== user.uid) {
        throw new AuthorizationError('You can only cancel your own orders');
      }

      // Business rule: Users can only cancel before shipping
      const cancellableStatuses: Order['status'][] = [
        'pending_payment',
        'pending_approval',
        'processing',
      ];
      if (!cancellableStatuses.includes(existing.status)) {
        throw new ConflictError(
          'Order cannot be cancelled after it has been shipped'
        );
      }
    } else if (user.role === 'seller') {
      // Sellers can cancel orders containing their products
      this.checkOrderAccess(existing, user, 'edit');
    }
    // Admins can cancel any order

    // Validate reason
    if (!reason || reason.trim().length < 10) {
      throw new ValidationError('Cancellation reason must be at least 10 characters');
    }

    // Cancel order
    const order = await orderModel.cancel(id, reason);

    console.log(`[OrderController] Order cancelled: ${id} by user: ${user.uid}, reason: ${reason}`);
    return order;
  }

  /**
   * Track order by order number and email (public)
   */
  async trackOrder(orderNumber: string, email: string): Promise<OrderWithVersion> {
    // Validate inputs
    if (!orderNumber || !email) {
      throw new ValidationError('Order number and email are required');
    }

    const order = await orderModel.trackByNumber(orderNumber, email);

    if (!order) {
      throw new NotFoundError('Order not found with provided details');
    }

    return order;
  }

  /**
   * Count orders
   * Authorization: Apply same filters as list
   */
  async countOrders(
    filters?: {
      status?: Order['status'];
      paymentStatus?: Order['paymentStatus'];
      userId?: string;
      sellerId?: string;
      startDate?: string;
      endDate?: string;
    },
    user?: UserContext
  ): Promise<number> {
    // Apply RBAC filters
    const effectiveFilters = { ...filters };

    if (!user) {
      throw new AuthorizationError('Authentication required');
    }

    if (user.role === 'user') {
      effectiveFilters.userId = user.uid;
    } else if (user.role === 'seller') {
      effectiveFilters.sellerId = user.sellerId;
    }
    // Admins see all

    return await orderModel.count(effectiveFilters);
  }

  /**
   * Bulk update orders (Admin only)
   */
  async bulkUpdateOrders(
    updates: Array<{ id: string; data: Partial<Order> }>,
    user: UserContext
  ): Promise<void> {
    if (user.role !== 'admin') {
      throw new AuthorizationError('Admin access required for bulk updates');
    }

    await orderModel.bulkUpdate(updates);

    console.log(`[OrderController] Bulk update: ${updates.length} orders by user: ${user.uid}`);
  }

  /**
   * Private: Check if user has access to an order
   */
  private checkOrderAccess(
    order: OrderWithVersion,
    user: UserContext | undefined,
    action: 'view' | 'edit'
  ): void {
    if (!user) {
      throw new AuthorizationError('Authentication required');
    }

    // Admins have full access
    if (user.role === 'admin') {
      return;
    }

    // Users can view/edit their own orders
    if (user.role === 'user') {
      if (order.userId !== user.uid) {
        throw new AuthorizationError('You can only access your own orders');
      }
      
      // Users can only view, not edit (except cancel which has its own method)
      if (action === 'edit') {
        throw new AuthorizationError('Users cannot directly edit orders');
      }
      return;
    }

    // Sellers can view/edit orders containing their products
    if (user.role === 'seller') {
      if (!order.sellerId || order.sellerId !== user.sellerId) {
        // Check if any order item belongs to this seller
        const hasSellerItem = order.items.some(item => item.sellerId === user.sellerId);
        if (!hasSellerItem) {
          throw new AuthorizationError('You can only access orders containing your products');
        }
      }
      return;
    }

    throw new AuthorizationError('Insufficient permissions');
  }

  /**
   * Private: Validate status transition
   */
  private validateStatusTransition(
    currentStatus: Order['status'],
    newStatus: Order['status'],
    role: 'admin' | 'seller' | 'user'
  ): void {
    // Define valid transitions
    const validTransitions: Record<Order['status'], Order['status'][]> = {
      pending_payment: ['pending_approval', 'cancelled'],
      pending_approval: ['processing', 'cancelled'],
      processing: ['shipped', 'cancelled'],
      shipped: ['in_transit', 'delivered', 'cancelled'],
      in_transit: ['out_for_delivery', 'delivered', 'cancelled'],
      out_for_delivery: ['delivered'],
      delivered: ['refunded'], // Only if return requested
      cancelled: ['refunded'],
      refunded: [], // Terminal state
    };

    const allowed = validTransitions[currentStatus] || [];

    if (!allowed.includes(newStatus)) {
      throw new ConflictError(
        `Invalid status transition from ${currentStatus} to ${newStatus}`
      );
    }

    // Role-specific restrictions
    if (role === 'seller') {
      const sellerAllowedStatuses: Order['status'][] = [
        'processing',
        'shipped',
        'in_transit',
        'out_for_delivery',
        'delivered',
      ];
      
      if (!sellerAllowedStatuses.includes(newStatus)) {
        throw new AuthorizationError(
          `Sellers cannot set status to ${newStatus}`
        );
      }
    }
  }

  /**
   * Private: Validate order data
   */
  private validateOrderData(data: Partial<Order>): void {
    // Validate items
    if (data.items) {
      for (const item of data.items) {
        if (!item.productId || !item.name || !item.price || !item.quantity) {
          throw new ValidationError('All order items must have productId, name, price, and quantity');
        }
        if (item.price < 0) {
          throw new ValidationError('Item price cannot be negative');
        }
        if (item.quantity <= 0) {
          throw new ValidationError('Item quantity must be positive');
        }
      }
    }

    // Validate pricing
    if (data.total !== undefined && data.total <= 0) {
      throw new ValidationError('Order total must be positive');
    }

    if (data.subtotal !== undefined && data.subtotal < 0) {
      throw new ValidationError('Subtotal cannot be negative');
    }

    // Validate shipping address
    if (data.shippingAddress) {
      const addr = data.shippingAddress;
      if (!addr.fullName || !addr.phone || !addr.addressLine1 || !addr.city || !addr.state || !addr.pincode) {
        throw new ValidationError('Incomplete shipping address');
      }

      // Validate phone number (basic)
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(addr.phone.replace(/[\s\-\+]/g, ''))) {
        throw new ValidationError('Invalid phone number format');
      }

      // Validate pincode (India)
      const pincodeRegex = /^[1-9][0-9]{5}$/;
      if (!pincodeRegex.test(addr.pincode)) {
        throw new ValidationError('Invalid pincode format');
      }
    }

    // Validate payment method
    if (data.paymentMethod) {
      const validMethods: Order['paymentMethod'][] = ['razorpay', 'paypal', 'cod'];
      if (!validMethods.includes(data.paymentMethod)) {
        throw new ValidationError('Invalid payment method');
      }
    }

    // Validate currency and exchange rate
    if (data.currency && data.currency !== 'INR') {
      if (!data.exchangeRate || data.exchangeRate <= 0) {
        throw new ValidationError('Exchange rate is required for non-INR currencies');
      }
    }
  }
}

// Export singleton instance
export const orderController = new OrderController();
