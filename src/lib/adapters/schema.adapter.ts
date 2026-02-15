/**
 * Schema Adapter Utilities
 *
 * Helper functions for safely working with schema fields in the UI layer.
 * These utilities provide type-safe transformations between Firestore documents
 * and UI-friendly objects.
 *
 * @location src/lib/adapters/schema.adapter.ts
 */

import {
  USER_FIELDS,
  PRODUCT_FIELDS,
  ORDER_FIELDS,
  type UserDocument,
  type ProductDocument,
  type OrderDocument,
} from "@/db/schema";

/**
 * Transform raw Firestore user document to UI-friendly format
 * Handles nested fields and provides sensible defaults
 *
 * @example
 * ```typescript
 * const user = await userRepository.findById(uid);
 * const uiUser = adaptUserToUI(user);
 * ```
 */
export function adaptUserToUI(user: UserDocument) {
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName || "Unknown User",
    photoURL: user.photoURL || null,
    role: user.role || "user",
    disabled: user.disabled || false,
    emailVerified: user.emailVerified || false,
    phoneVerified: user.phoneVerified || false,

    // Nested profile data
    profile: {
      isPublic: user.publicProfile?.isPublic || false,
      bio: user.publicProfile?.bio || "",
      location: user.publicProfile?.location || "",
      showEmail: user.publicProfile?.showEmail || false,
      showPhone: user.publicProfile?.showPhone || false,
    },

    // Statistics
    stats: {
      totalOrders: user.stats?.totalOrders || 0,
      reviewsCount: user.stats?.reviewsCount || 0,
      rating: user.stats?.rating || 0,
      itemsSold: user.stats?.itemsSold || 0,
    },

    // Metadata
    metadata: {
      lastSignInTime: user.metadata?.lastSignInTime,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
  };
}

/**
 * Transform raw Firestore product document to UI-friendly format
 *
 * @example
 * ```typescript
 * const product = await productRepository.findById(productId);
 * const uiProduct = adaptProductToUI(product);
 * ```
 */
export function adaptProductToUI(product: ProductDocument) {
  return {
    id: product.id,
    title: product.title,
    description: product.description || "",
    price: product.price,
    category: product.category,
    status: product.status,

    // Seller info
    seller: {
      id: product.sellerId,
      name: product.sellerName,
      email: product.sellerEmail,
    },

    // Inventory
    inventory: {
      stock: product.stockQuantity || 0,
      available: product.availableQuantity || 0,
    },

    // Auction data (if applicable)
    auction: product.isAuction
      ? {
          endDate: product.auctionEndDate,
          startingBid: product.startingBid,
          currentBid: product.currentBid || product.startingBid,
          bidCount: product.bidCount || 0,
        }
      : null,

    // Media
    images: product.images || [],
    mainImage: product.mainImage || "",

    // Metadata
    metadata: {
      featured: product.featured || false,
      promoted: product.isPromoted || false,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    },
  };
}

/**
 * Transform raw Firestore order document to UI-friendly format
 *
 * @example
 * ```typescript
 * const order = await orderRepository.findById(orderId);
 * const uiOrder = adaptOrderToUI(order);
 * ```
 */
export function adaptOrderToUI(order: OrderDocument) {
  return {
    id: order.id,
    status: order.status,

    // User info
    user: {
      id: order.userId,
      name: order.userName,
      email: order.userEmail,
    },

    // Product info
    product: {
      id: order.productId,
      title: order.productTitle,
      quantity: order.quantity,
      unitPrice: order.unitPrice,
      totalPrice: order.totalPrice,
    },

    // Payment
    payment: {
      status: order.paymentStatus,
      method: order.paymentMethod,
      id: order.paymentId,
    },

    // Shipping
    shipping: {
      address: order.shippingAddress,
      trackingNumber: order.trackingNumber || null,
      date: order.shippingDate || null,
      deliveryDate: order.deliveryDate || null,
    },

    // Cancellation
    cancellation: order.cancellationDate
      ? {
          date: order.cancellationDate,
          reason: order.cancellationReason || "No reason provided",
          refundAmount: order.refundAmount || 0,
          refundStatus: order.refundStatus || "pending",
        }
      : null,

    // Dates
    dates: {
      ordered: order.orderDate,
      created: order.createdAt,
      updated: order.updatedAt,
    },
  };
}

export type AdaptedUser = ReturnType<typeof adaptUserToUI>;
export type AdaptedProduct = ReturnType<typeof adaptProductToUI>;
export type AdaptedOrder = ReturnType<typeof adaptOrderToUI>;
