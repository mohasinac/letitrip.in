/**
 * Shared Type Definitions
 * 
 * Common types used throughout the application
 */

/**
 * User Role
 */
export type UserRole = 'guest' | 'user' | 'seller' | 'admin';

/**
 * User Interface
 */
export interface User {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Shop Interface
 */
export interface Shop {
  id: string;
  ownerId: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  banner?: string;
  
  // Contact
  email?: string;
  phone?: string;
  location?: string;
  
  // Address
  address?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  
  // Categories
  categories?: string[];
  
  // Social
  website?: string;
  facebook?: string;
  instagram?: string;
  twitter?: string;
  
  // Business
  gst?: string;
  pan?: string;
  
  // Bank details
  bankDetails?: {
    accountHolderName: string;
    accountNumber: string;
    ifscCode: string;
    bankName: string;
    branchName?: string;
  };
  
  upiId?: string;
  
  // Policies
  returnPolicy?: string;
  shippingPolicy?: string;
  
  // Stats
  rating: number;
  reviewCount: number;
  productCount: number;
  follower_count?: number;
  
  // Flags
  isVerified: boolean;
  isFeatured: boolean;
  showOnHomepage: boolean;
  isBanned: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Product Condition
 */
export type ProductCondition = 'new' | 'used' | 'refurbished';

/**
 * Product Status
 */
export type ProductStatus = 'draft' | 'published' | 'archived' | 'out-of-stock';

/**
 * Product Specification
 */
export interface ProductSpecification {
  name: string;
  value: string;
}

/**
 * Product Variant
 */
export interface ProductVariant {
  name: string;
  value: string;
  priceAdjustment?: number;
  stockCount?: number;
  sku?: string;
}

/**
 * Product Dimensions
 */
export interface ProductDimensions {
  length: number;
  width: number;
  height: number;
  unit: 'cm' | 'inch';
  weight: number;
  weightUnit: 'kg' | 'g' | 'lb';
}

/**
 * Product Interface
 */
export interface Product {
  id: string;
  shopId: string;
  categoryId: string;
  
  // Basic info
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  
  // Pricing
  price: number;
  originalPrice?: number;
  costPrice?: number;
  
  // Inventory
  stockCount: number;
  lowStockThreshold: number;
  sku?: string;
  
  // Details
  condition: ProductCondition;
  brand?: string;
  manufacturer?: string;
  countryOfOrigin: string;
  
  // Media
  images: string[];
  videos?: string[];
  
  // Specifications
  specifications?: ProductSpecification[];
  variants?: ProductVariant[];
  dimensions?: ProductDimensions;
  
  // Shipping
  shippingClass?: 'standard' | 'express' | 'heavy' | 'fragile';
  
  // Tags
  tags?: string[];
  
  // Policies
  isReturnable: boolean;
  returnWindowDays: number;
  warranty?: string;
  
  // SEO
  metaTitle?: string;
  metaDescription?: string;
  
  // Scheduling
  publishDate?: Date;
  
  // Stats
  rating: number;
  reviewCount: number;
  salesCount: number;
  viewCount: number;
  
  // Status
  status: ProductStatus;
  
  // Flags
  isFeatured: boolean;
  showOnHomepage: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Category Interface
 */
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  
  // Hierarchy
  parentId?: string | null;
  path: string; // e.g., "electronics/phones/smartphones"
  level: number;
  hasChildren: boolean;
  childCount: number;
  
  // Display
  icon?: string;
  image?: string;
  color?: string;
  sortOrder: number;
  
  // Stats
  productCount: number;
  
  // Flags
  isFeatured: boolean;
  showOnHomepage: boolean;
  isActive: boolean;
  
  // SEO
  metaTitle?: string;
  metaDescription?: string;
  
  // Commission
  commissionRate: number;
  
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Coupon Type
 */
export type CouponType = 'percentage' | 'flat' | 'bogo' | 'tiered' | 'free-shipping';

/**
 * Coupon Status
 */
export type CouponStatus = 'active' | 'inactive' | 'expired' | 'used-up';

/**
 * Coupon Applicability
 */
export type CouponApplicability = 'all' | 'category' | 'product';

/**
 * Tiered Discount
 */
export interface TieredDiscount {
  minAmount: number;
  discountPercentage: number;
}

/**
 * BOGO Configuration
 */
export interface BogoConfig {
  buyQuantity: number;
  getQuantity: number;
  discountPercentage: number;
  applicableProducts?: string[];
}

/**
 * Coupon Interface
 */
export interface Coupon {
  id: string;
  shopId: string;
  
  // Basic info
  code: string;
  name: string;
  description?: string;
  
  // Type & value
  type: CouponType;
  discountValue?: number;
  maxDiscountAmount?: number;
  
  // Configurations
  tiers?: TieredDiscount[];
  bogoConfig?: BogoConfig;
  
  // Requirements
  minPurchaseAmount: number;
  minQuantity: number;
  
  // Applicability
  applicability: CouponApplicability;
  applicableCategories?: string[];
  applicableProducts?: string[];
  excludedCategories?: string[];
  excludedProducts?: string[];
  
  // Usage
  usageLimit?: number;
  usageLimitPerUser: number;
  usageCount: number;
  
  // Validity
  startDate: Date;
  endDate: Date;
  status: CouponStatus;
  
  // Restrictions
  firstOrderOnly: boolean;
  newUsersOnly: boolean;
  canCombineWithOtherCoupons: boolean;
  
  // Display
  autoApply: boolean;
  isPublic: boolean;
  isFeatured: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Order Status
 */
export type OrderStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'processing' 
  | 'shipped' 
  | 'delivered' 
  | 'cancelled' 
  | 'refunded';

/**
 * Payment Status
 */
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

/**
 * Order Item Interface
 */
export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  
  // Product details (snapshot at time of order)
  productName: string;
  productImage: string;
  sku?: string;
  
  // Pricing
  price: number;
  quantity: number;
  total: number;
  
  // Variant
  variant?: string;
  
  // Shop
  shopId: string;
  shopName: string;
  
  createdAt: Date;
}

/**
 * Order Interface
 */
export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  
  // Items
  items: OrderItem[];
  
  // Pricing
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
  
  // Coupon
  couponCode?: string;
  couponDiscount?: number;
  
  // Address
  shippingAddress: {
    name: string;
    phone: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  
  billingAddress?: {
    name: string;
    phone: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  
  // Status
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  
  // Payment
  paymentMethod: 'razorpay' | 'paypal' | 'cod';
  paymentId?: string;
  
  // Shipping
  trackingNumber?: string;
  shippingProvider?: string;
  estimatedDelivery?: Date;
  deliveredAt?: Date;
  
  // Notes
  customerNotes?: string;
  internalNotes?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Review Interface
 */
export interface Review {
  id: string;
  userId: string;
  productId?: string;
  shopId?: string;
  auctionId?: string;
  categoryId?: string;
  orderItemId?: string; // For verification
  
  // Content
  rating: number;
  title?: string;
  comment: string;
  media?: string[]; // Images/videos
  
  // Verification
  verifiedPurchase: boolean;
  
  // Engagement
  helpfulCount: number;
  
  // Moderation
  isApproved: boolean;
  moderatedAt?: Date;
  moderatedBy?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Auction Status
 */
export type AuctionStatus = 'draft' | 'scheduled' | 'live' | 'ended' | 'cancelled';

/**
 * Auction Interface
 */
export interface Auction {
  id: string;
  shopId: string;
  
  // Basic info
  name: string;
  slug: string;
  description: string;
  
  // Media
  images: string[];
  videos?: string[];
  
  // Bidding
  startingBid: number;
  reservePrice?: number;
  currentBid: number;
  bidCount: number;
  
  // Timing
  startTime: Date;
  endTime: Date;
  
  // Winner
  winnerId?: string;
  finalBid?: number;
  
  // Status
  status: AuctionStatus;
  
  // Flags
  isFeatured: boolean;
  featuredPriority?: number;
  
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Bid Interface
 */
export interface Bid {
  id: string;
  auctionId: string;
  userId: string;
  bidAmount: number;
  bidTime: Date;
  isWinning: boolean;
  isAutoBid: boolean;
  maxAutoBid?: number;
}

/**
 * Address Interface
 */
export interface Address {
  id: string;
  userId: string;
  
  name: string;
  phone: string;
  
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  
  isDefault: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Cart Item Interface
 */
export interface CartItem {
  id: string;
  userId?: string; // null for guest cart
  productId: string;
  
  // Product details
  productName: string;
  productImage: string;
  price: number;
  
  quantity: number;
  variant?: string;
  
  shopId: string;
  shopName: string;
  
  addedAt: Date;
}

/**
 * Return Status
 */
export type ReturnStatus = 
  | 'requested' 
  | 'approved' 
  | 'rejected' 
  | 'item-received' 
  | 'refund-processed' 
  | 'completed' 
  | 'escalated';

/**
 * Return Reason
 */
export type ReturnReason = 
  | 'defective' 
  | 'wrong-item' 
  | 'not-as-described' 
  | 'damaged' 
  | 'changed-mind' 
  | 'other';

/**
 * Return Interface
 */
export interface Return {
  id: string;
  orderId: string;
  orderItemId: string;
  customerId: string;
  shopId: string;
  
  // Reason
  reason: ReturnReason;
  description: string;
  media?: string[]; // Images/videos
  
  // Status
  status: ReturnStatus;
  
  // Refund
  refundAmount?: number;
  refundMethod?: string;
  refundTransactionId?: string;
  refundedAt?: Date;
  
  // Admin intervention
  requiresAdminIntervention: boolean;
  adminNotes?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Support Ticket Status
 */
export type SupportTicketStatus = 'open' | 'in-progress' | 'resolved' | 'closed' | 'escalated';

/**
 * Support Ticket Category
 */
export type SupportTicketCategory = 
  | 'order-issue' 
  | 'return-refund' 
  | 'product-question' 
  | 'account' 
  | 'payment' 
  | 'other';

/**
 * Support Ticket Priority
 */
export type SupportTicketPriority = 'low' | 'medium' | 'high' | 'urgent';

/**
 * Support Ticket Interface
 */
export interface SupportTicket {
  id: string;
  userId: string;
  shopId?: string; // If related to specific shop
  orderId?: string; // If related to specific order
  
  category: SupportTicketCategory;
  priority: SupportTicketPriority;
  
  subject: string;
  description: string;
  attachments?: string[];
  
  status: SupportTicketStatus;
  
  assignedTo?: string; // Support staff/admin ID
  
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
}

/**
 * Support Ticket Message Interface
 */
export interface SupportTicketMessage {
  id: string;
  ticketId: string;
  senderId: string;
  senderRole: UserRole;
  
  message: string;
  attachments?: string[];
  
  isInternal: boolean; // Internal note visible only to staff
  
  createdAt: Date;
}

/**
 * Pagination Response
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * API Response
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
  meta?: Record<string, any>;
}

/**
 * Filter Option
 */
export interface FilterOption {
  label: string;
  value: string;
  count?: number;
}

/**
 * Sort Option
 */
export interface SortOption {
  label: string;
  value: string;
  order: 'asc' | 'desc';
}
