/**
 * Shared TypeScript Type Definitions
 */

// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: "admin" | "user" | "seller";
  avatar?: string;
  addresses: Address[];
  preferredCurrency?: string; // User's preferred currency (INR, USD, EUR, GBP)
  isOver18?: boolean; // Age verification flag
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  id: string;
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
}

// Product Types
export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  price: number;
  compareAtPrice?: number;
  cost?: number;
  sku: string;
  barcode?: string;
  quantity: number;
  lowStockThreshold: number;
  weight: number; // Required for shipping calculations
  weightUnit: "kg" | "g" | "lb" | "oz"; // Weight unit
  dimensions?: {
    length: number;
    width: number;
    height: number;
    unit: "cm" | "in";
  };
  images: ProductImage[];
  videos?: ProductVideo[]; // Support for product videos
  category: string;
  categorySlug?: string; // For display purposes
  tags: string[];
  status: "active" | "draft" | "archived";
  isFeatured: boolean;
  rating?: number;
  reviewCount?: number;
  sellerId: string; // Reference to seller (required)
  seller?: {
    id: string;
    name?: string;
    storeName?: string;
    businessName?: string;
    storeStatus?: "live" | "maintenance" | "offline";
    isVerified?: boolean;
  };
  // Condition & Features
  condition?: "new" | "used-mint" | "used-good" | "used-fair" | "damaged";
  returnable?: boolean;
  returnPeriod?: number; // days
  features?: string[];
  specifications?: { [key: string]: string };
  seo?: {
    title: string;
    description: string;
    keywords: string[];
  };
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface ProductImage {
  url: string;
  alt: string;
  order: number;
}

export interface ProductVideo {
  url: string;
  title: string;
  thumbnail?: string;
  duration?: number; // in seconds
  order: number;
}

// Category Types
export interface CategorySEO {
  metaTitle?: string;
  metaDescription?: string;
  altText?: string;
  keywords?: string[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;

  // SEO and Images
  image?: string;
  icon?: string;
  seo?: CategorySEO;

  // Hierarchy - Many-to-Many Relationship
  parentIds?: string[]; // Multiple parent category IDs
  parentSlugs?: string[]; // Multiple parent category slugs for easy identification
  childIds?: string[]; // Multiple child category IDs (computed)
  paths?: string[][]; // All possible paths from root to this category
  minLevel?: number; // Minimum level in hierarchy (shortest path from root)
  maxLevel?: number; // Maximum level in hierarchy (longest path from root)
  children?: Category[]; // For tree view (computed)

  // Status and Organization
  isActive: boolean;
  featured: boolean;
  sortOrder: number;

  // Metadata
  productCount?: number;
  inStockCount?: number;
  outOfStockCount?: number;
  lowStockCount?: number;
  isLeaf?: boolean; // Indicates if this is a leaf category (no children)
  createdAt: string;
  updatedAt: string;
  createdBy: string; // Admin user ID
  updatedBy: string; // Admin user ID
}

export interface CategoryFormData {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  icon?: string;
  parentIds?: string[]; // Multiple parents
  isActive: boolean;
  featured: boolean;
  sortOrder: number;
  seo?: CategorySEO;
}

export interface CategoryTreeNode extends Category {
  children: CategoryTreeNode[];
  hasChildren: boolean;
}

// Order Types
export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  customerName?: string; // Added for seller order views
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: "razorpay" | "cod";
  paymentId?: string;
  shippingAddress: Address;
  billingAddress: Address;
  trackingNumber?: string;
  shiprocketOrderId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  sku: string;
  price: number;
  quantity: number;
  total: number;
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

// Cart Types
export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  name: string;
  image?: string;
  sku?: string;
  seller?: {
    id: string;
    name: string;
    storeName?: string;
  };
  addedAt: Date;
}

export interface Cart {
  userId: string;
  items: CartItem[];
  updatedAt: string;
}

// Auction Types
export interface Auction {
  id: string;
  productId: string;
  product: Product;
  startingPrice: number;
  currentBid: number;
  reservePrice?: number;
  buyNowPrice?: number;
  startTime: string;
  endTime: string;
  status: "upcoming" | "active" | "ended" | "cancelled";
  winnerId?: string;
  bids: Bid[];
  createdAt: string;
  updatedAt: string;
}

export interface Bid {
  id: string;
  auctionId: string;
  userId: string;
  userName: string;
  amount: number;
  isAutoBid: boolean;
  maxAutoBid?: number;
  timestamp: string;
}

// Review Types
export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  title: string;
  comment: string;
  images?: string[];
  verified: boolean;
  helpful: number;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  updatedAt: string;
}

// Payment Types
export interface RazorpayOrder {
  id: string;
  entity: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
}

// Shipping Types
export interface ShiprocketOrder {
  order_id: string;
  shipment_id: string;
  awb_code: string;
  courier_name: string;
  tracking_url: string;
}

export interface ShippingRate {
  courier_name: string;
  rate: number;
  estimated_delivery_days: string;
}

// Analytics Types
export interface Analytics {
  revenue: number;
  orders: number;
  customers: number;
  averageOrderValue: number;
  topProducts: Array<{
    productId: string;
    name: string;
    sales: number;
    revenue: number;
  }>;
  salesByDay: Array<{
    date: string;
    sales: number;
    orders: number;
  }>;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: any;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Filter and Search Types
export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  tags?: string[];
  search?: string;
  sort?: "price-asc" | "price-desc" | "newest" | "popular";
  page?: number;
  pageSize?: number;
  sellerId?: string;
  status?: "active" | "inactive" | "pending";
}

export interface OrderFilters {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

// Coupon Types
export interface Coupon {
  id: string;
  code: string;
  name: string;
  description?: string;
  type: "percentage" | "fixed" | "free_shipping" | "bogo";
  value: number; // percentage (0-100) or fixed amount
  minimumAmount?: number; // minimum order amount required
  maximumAmount?: number; // maximum discount amount (for percentage coupons)
  maxUses?: number; // total usage limit
  maxUsesPerUser?: number; // per-user usage limit
  usedCount: number;
  startDate: string;
  endDate: string;
  status: "active" | "inactive" | "expired";
  applicableProducts?: string[]; // product IDs
  applicableCategories?: string[]; // category IDs
  excludeProducts?: string[]; // excluded product IDs
  excludeCategories?: string[]; // excluded category IDs
  restrictions?: {
    firstTimeOnly?: boolean;
    newCustomersOnly?: boolean;
    existingCustomersOnly?: boolean;
    minQuantity?: number;
    maxQuantity?: number;
  };
  combinable?: boolean; // can be combined with other coupons
  priority: number; // for stacking order
  createdBy: string; // admin user ID
  createdAt: string;
  updatedAt: string;
}

export interface CouponUsage {
  id: string;
  couponId: string;
  couponCode: string;
  userId: string;
  orderId: string;
  discountAmount: number;
  usedAt: string;
}

export interface CouponValidationResult {
  valid: boolean;
  coupon?: Coupon;
  discountAmount?: number;
  error?: string;
  warnings?: string[];
}

export interface CouponFormData {
  code: string;
  name: string;
  description: string;
  type: "percentage" | "fixed" | "free_shipping" | "bogo";
  value: number;
  minimumAmount: number;
  maximumAmount: number;
  maxUses: number;
  maxUsesPerUser: number;
  startDate: string;
  endDate: string;
  status: "active" | "inactive";
  applicableProducts: string[];
  applicableCategories: string[];
  excludeProducts: string[];
  excludeCategories: string[];
  restrictions: {
    firstTimeOnly: boolean;
    newCustomersOnly: boolean;
    existingCustomersOnly: boolean;
    minQuantity: number;
    maxQuantity: number;
  };
  combinable: boolean;
  priority: number;
}

// Payment Gateway Types
export interface RazorpayConfig {
  keyId: string;
  keySecret: string;
  webhookSecret: string;
}

export interface RazorpayPayment {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  status: "created" | "authorized" | "captured" | "refunded" | "failed";
  method: string;
  description: string;
  notes: any;
  createdAt: number;
}

// Shipping Gateway Types
export interface ShiprocketConfig {
  email: string;
  password: string;
  channelId: string;
  token?: string;
  tokenExpiry?: number;
}

export interface ShiprocketOrderRequest {
  order_id: string;
  order_date: string;
  pickup_location: string;
  billing_customer_name: string;
  billing_last_name: string;
  billing_address: string;
  billing_city: string;
  billing_pincode: string;
  billing_state: string;
  billing_country: string;
  billing_email: string;
  billing_phone: string;
  shipping_is_billing: boolean;
  shipping_customer_name?: string;
  shipping_last_name?: string;
  shipping_address?: string;
  shipping_city?: string;
  shipping_pincode?: string;
  shipping_state?: string;
  shipping_country?: string;
  shipping_email?: string;
  shipping_phone?: string;
  order_items: Array<{
    name: string;
    sku: string;
    units: number;
    selling_price: string;
    discount?: string;
    tax?: string;
    hsn?: string;
  }>;
  payment_method: "Prepaid" | "COD";
  shipping_charges: number;
  giftwrap_charges?: number;
  transaction_charges?: number;
  total_discount?: number;
  sub_total: number;
  length: number;
  breadth: number;
  height: number;
  weight: number;
}

export interface ShiprocketServiceabilityRequest {
  pickup_postcode: string;
  delivery_postcode: string;
  weight: number;
  cod: 0 | 1;
}

export interface ShiprocketRateCalculation {
  courier_company_id: number;
  courier_name: string;
  freight_charge: number;
  cod_charges: number;
  other_charges: number;
  total_charge: number;
  etd: string;
}

// Seller Types
export interface SellerProfile {
  id: string;
  userId: string;
  businessName?: string;
  storeName?: string; // Custom store name for display
  storeStatus: "live" | "maintenance" | "offline"; // Store operational status
  storeDescription?: string;
  businessType?: "individual" | "company" | "partnership";
  gstNumber?: string;
  panNumber?: string;
  businessAddress?: Address;
  bankDetails?: {
    accountNumber: string;
    ifscCode: string;
    accountHolderName: string;
    bankName: string;
  };
  isActive: boolean;
  isVerified: boolean;
  awayMode: boolean; // For temporarily stopping sales
  awayMessage?: string;
  createdAt: string;
  updatedAt: string;
}

// Enhanced Seller Shop Configuration
export interface SellerShop {
  id: string;
  sellerId: string;
  storeName: string;
  storeSlug: string;
  description: string;
  storeImage?: string;
  coverImage?: string;
  pickupAddresses: PickupAddress[];
  defaultPickupAddressId?: string;
  isActive: boolean;
  isVerified: boolean;
  seo: {
    title: string;
    description: string;
    keywords: string[];
    og_image?: string;
  };
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    whatsapp?: string;
  };
  businessInfo: {
    businessName?: string;
    businessType?: "individual" | "company" | "partnership";
    gstNumber?: string;
    panNumber?: string;
    bankDetails?: {
      accountNumber: string;
      ifscCode: string;
      accountHolderName: string;
      bankName: string;
      branchName?: string;
    };
  };
  settings: {
    freeShippingThreshold?: number;
    enableCOD: boolean;
    processingTime: number; // in days
    returnPolicy: string;
    shippingPolicy: string;
  };
  stats: {
    totalProducts: number;
    activeProducts: number;
    totalOrders: number;
    totalRevenue: number;
    rating: number;
    reviewCount: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface PickupAddress {
  id: string;
  label: string; // e.g., "Main Warehouse", "Store Location"
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
  createdAt: string;
}

// Enhanced Product Types for Sellers
export interface SellerProduct {
  id: string;
  sellerId: string;
  slug: string; // with "buy-" prefix
  name: string;
  description: string;
  shortDescription?: string;

  // Pricing
  price: number;
  compareAtPrice?: number;
  cost?: number;

  // Inventory
  sku: string;
  quantity: number;
  lowStockThreshold: number;

  // Category (only leaf categories allowed)
  categoryId: string;
  categorySlug: string;
  tags: string[];

  // Media
  images: ProductMediaImage[];
  videos: ProductMediaVideo[];

  // Pickup & Shipping
  pickupAddressId: string;
  weight: number;
  weightUnit: "kg" | "g" | "lb" | "oz";
  dimensions?: {
    length: number;
    width: number;
    height: number;
    unit: "cm" | "in";
  };
  freeShipping: boolean;
  shippingMethod: "seller" | "shiprocket" | "pickup";

  // Condition & Features
  condition: "new" | "used-mint" | "used-good" | "used-fair" | "damaged";
  returnable: boolean;
  returnPeriod?: number; // days
  features: string[];
  specifications: { [key: string]: string };

  // SEO
  seo: {
    title: string;
    description: string;
    keywords: string[];
    slug: string; // Auto-generated with "buy-" prefix
  };

  // Dates
  startDate: string;
  expirationDate?: string; // null means permanent

  // Status
  status: "active" | "draft" | "archived" | "expired";

  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface ProductMediaImage {
  id: string;
  url: string;
  alt: string;
  order: number;
  storage_path: string; // seller/products/{slug}/img1-img5
  whatsappEdit?: {
    originalUrl: string;
    editedUrl: string;
    frameData?: any; // 800x800 frame data
  };
}

export interface ProductMediaVideo {
  id: string;
  url: string;
  title: string;
  thumbnail?: string;
  duration?: number;
  order: number;
  storage_path: string; // seller/products/{slug}/v1 or v2
}

// Seller Coupon System (WooCommerce-style with Advanced Types)
export interface SellerCoupon {
  id: string;
  sellerId: string;
  code: string;
  name: string;
  description?: string;
  type:
    | "percentage"
    | "fixed"
    | "free_shipping"
    | "bogo"
    | "cart_discount"
    | "buy_x_get_y_cheapest"
    | "buy_x_get_y_percentage"
    | "tiered_discount"
    | "bundle_discount";
  value: number;

  // Usage Restrictions
  minimumAmount?: number;
  maximumAmount?: number;
  maxUses?: number;
  maxUsesPerUser?: number;
  usedCount: number;

  // Advanced Discount Configuration
  advancedConfig?: {
    // For Buy X Get Y types
    buyQuantity?: number;
    getQuantity?: number;
    getDiscountType?: "free" | "percentage" | "fixed";
    getDiscountValue?: number;
    applyToLowest?: boolean;
    repeatOffer?: boolean;

    // For Tiered Discounts
    tiers?: Array<{
      minQuantity: number;
      maxQuantity?: number;
      discountType: "percentage" | "fixed";
      discountValue: number;
    }>;

    // For Bundle Discounts
    bundleProducts?: Array<{
      productId: string;
      quantity: number;
    }>;
    bundleDiscountType?: "percentage" | "fixed";
    bundleDiscountValue?: number;

    // Maximum discount limit
    maxDiscountAmount?: number;
  };

  // Dates
  startDate: string;
  endDate: string;
  isPermanent: boolean;

  // Applicability
  applicableProducts?: string[];
  applicableCategories?: string[];
  excludeProducts?: string[];
  excludeCategories?: string[];

  // Restrictions
  restrictions: {
    firstTimeOnly?: boolean;
    newCustomersOnly?: boolean;
    existingCustomersOnly?: boolean;
    minQuantity?: number;
    maxQuantity?: number;
    allowedPaymentMethods?: ("cod" | "prepaid")[];
    allowedUserEmails?: string[];
    excludedUserEmails?: string[];
  };

  // Stacking
  combinable: boolean;
  priority: number;

  // Status
  status: "active" | "inactive" | "expired" | "scheduled";

  createdAt: string;
  updatedAt: string;
}

// Seller Sale System
export interface SellerSale {
  id: string;
  sellerId: string;
  name: string;
  description?: string;
  discountType: "percentage" | "fixed";
  discountValue: number;

  // Applicability
  applyTo: "all_products" | "specific_products" | "specific_categories";
  productIds?: string[];
  categoryIds?: string[];

  // Shipping
  enableFreeShipping: boolean;

  // Dates
  startDate: string;
  endDate?: string;
  isPermanent: boolean;

  // Status
  status: "active" | "inactive" | "scheduled" | "expired";

  // Stats
  stats: {
    ordersCount: number;
    revenue: number;
    productsAffected: number;
  };

  createdAt: string;
  updatedAt: string;
}

// Seller Orders
export interface SellerOrder {
  id: string;
  orderNumber: string;
  sellerId: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;

  // Items
  items: SellerOrderItem[];

  // Pricing
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;

  // Coupon Used
  couponId?: string;
  couponCode?: string;
  couponDiscount?: number;

  // Sale Applied
  saleId?: string;
  saleDiscount?: number;

  // Addresses
  shippingAddress: Address;
  billingAddress: Address;
  pickupAddress: PickupAddress;

  // Payment
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  paymentMethod: "razorpay" | "cod";
  paymentId?: string;

  // Order Status
  status:
    | "pending"
    | "approved"
    | "rejected"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled"
    | "refunded";
  autoApprovedAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;

  // Shipping
  shippingMethod: "seller" | "shiprocket";
  trackingNumber?: string;
  shiprocketOrderId?: string;
  shippingLabel?: string;

  // Transaction Snapshot (immutable copy)
  transactionSnapshot: {
    products: SellerOrderItem[];
    pricing: {
      subtotal: number;
      discount: number;
      shipping: number;
      tax: number;
      total: number;
    };
    coupon?: {
      code: string;
      discount: number;
      type: string;
    };
    sale?: {
      name: string;
      discount: number;
    };
    timestamp: string;
  };

  // Notes
  sellerNotes?: string;
  customerNotes?: string;
  internalNotes?: string;

  // Timestamps
  createdAt: string;
  updatedAt: string;
  deliveredAt?: string;
}

export interface SellerOrderItem {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  productImage: string;
  sku: string;
  price: number;
  quantity: number;
  total: number;

  // Product snapshot at time of order
  snapshot: {
    name: string;
    description: string;
    image: string;
    price: number;
    sku: string;
    condition: string;
  };
}

// Shipments
export interface SellerShipment {
  id: string;
  sellerId: string;
  orderId: string;
  orderNumber: string;

  // Shipping details
  carrier: string;
  trackingNumber: string;
  shiprocketOrderId?: string;
  shiprocketShipmentId?: string;

  // Addresses
  fromAddress: PickupAddress;
  toAddress: Address;

  // Package details
  weight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
    unit: "cm" | "in";
  };

  // Status
  status:
    | "pending"
    | "pickup_scheduled"
    | "in_transit"
    | "out_for_delivery"
    | "delivered"
    | "failed"
    | "returned";

  // Tracking
  trackingHistory: ShipmentTrackingEvent[];

  // Labels & Documents
  shippingLabel?: string;
  invoiceUrl?: string;
  manifestUrl?: string;

  // Timestamps
  createdAt: string;
  updatedAt: string;
  shippedAt?: string;
  deliveredAt?: string;
}

export interface ShipmentTrackingEvent {
  status: string;
  location?: string;
  description: string;
  timestamp: string;
}

// Seller Alerts/Notifications
export interface SellerAlert {
  id: string;
  sellerId: string;
  type:
    | "new_order"
    | "pending_approval"
    | "pending_shipment"
    | "low_stock"
    | "order_delivered"
    | "return_request"
    | "review"
    | "system";
  title: string;
  message: string;
  severity: "info" | "warning" | "error" | "success";

  // Related entities
  orderId?: string;
  productId?: string;
  shipmentId?: string;

  // Actions
  actionUrl?: string;
  actionLabel?: string;

  // Status
  isRead: boolean;
  readAt?: string;

  createdAt: string;
}

export interface SellerAnalytics {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  averageOrderValue: number;
  topSellingProducts: Array<{
    productId: string;
    name: string;
    sales: number;
    revenue: number;
  }>;
  monthlyStats: Array<{
    month: string;
    revenue: number;
    orders: number;
  }>;
  recentOrders: Order[];
}
