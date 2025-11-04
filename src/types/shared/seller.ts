/**
 * Seller Types
 * Shared between UI and Backend
 */

// ============================================
// Seller Profile & Shop
// ============================================

export interface SellerProfile {
  id: string;
  userId: string;
  businessName: string;
  legalName?: string;
  email: string;
  phone: string;
  gst?: string;
  pan?: string;
  bankDetails?: {
    accountNumber: string;
    ifsc: string;
    accountHolderName: string;
    bankName: string;
  };
  pickupAddress?: PickupAddress;
  isVerified: boolean;
  verificationStatus: 'pending' | 'approved' | 'rejected';
  rating?: number;
  reviewCount?: number;
  totalSales?: number;
  memberSince: string;
  createdAt: string;
  updatedAt: string;
}

export interface PickupAddress {
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

export interface SellerShop {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  banner?: string;
  address?: string;
  phone?: string;
  email?: string;
  rating?: number;
  reviewCount?: number;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// Seller Products
// ============================================

export interface SellerProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  sku?: string;
  images: ProductMediaImage[];
  videos?: ProductMediaVideo[];
  category: string;
  categoryId: string;
  sellerId: string;
  sellerName?: string;
  rating?: number;
  reviewCount?: number;
  tags?: string[];
  status: 'draft' | 'active' | 'archived';
  isFeatured?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductMediaImage {
  url: string;
  alt?: string;
  order: number;
}

export interface ProductMediaVideo {
  url: string;
  thumbnail?: string;
  title?: string;
  order: number;
}

export interface SellerProductStats {
  total: number;
  active: number;
  draft: number;
  archived: number;
  lowStock: number;
  outOfStock: number;
}

// ============================================
// Seller Coupons
// ============================================

export interface SellerCoupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrderValue?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usageCount: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  sellerId: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// Seller Sales & Promotions
// ============================================

export interface SellerSale {
  id: string;
  name: string;
  description?: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  startDate: string;
  endDate: string;
  productIds: string[];
  isActive: boolean;
  sellerId: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// Seller Orders
// ============================================

export interface SellerOrder {
  id: string;
  orderNumber: string;
  userId: string;
  userName: string;
  userEmail: string;
  sellerId: string;
  sellerName: string;
  items: SellerOrderItem[];
  subtotal: number;
  shippingCharges: number;
  platformFee: number;
  tax: number;
  total: number;
  status: string;
  paymentStatus: string;
  shippingAddress: any;
  trackingNumber?: string;
  shipmentId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SellerOrderItem {
  id: string;
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  sku?: string;
}

export interface SellerOrderStats {
  total: number;
  pending: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
}

// ============================================
// Seller Shipments
// ============================================

export interface SellerShipment {
  id: string;
  orderId: string;
  trackingNumber: string;
  carrier: string;
  status: 'pending' | 'in_transit' | 'delivered' | 'failed';
  estimatedDelivery?: string;
  actualDelivery?: string;
  trackingEvents?: ShipmentTrackingEvent[];
  createdAt: string;
  updatedAt: string;
}

export interface ShipmentTrackingEvent {
  status: string;
  location?: string;
  timestamp: string;
  description?: string;
}

// ============================================
// Seller Alerts & Notifications
// ============================================

export interface SellerAlert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

// ============================================
// Seller Analytics
// ============================================

export interface SellerAnalytics {
  revenue: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    growth: number;
  };
  orders: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    growth: number;
  };
  products: {
    total: number;
    active: number;
    lowStock: number;
  };
  topProducts: Array<{
    id: string;
    name: string;
    sales: number;
    revenue: number;
  }>;
}
