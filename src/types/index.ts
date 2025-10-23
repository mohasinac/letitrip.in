/**
 * Shared TypeScript Type Definitions
 */

// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: 'admin' | 'user' | 'seller';
  avatar?: string;
  addresses: Address[];
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
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
    unit: 'cm' | 'in';
  };
  images: ProductImage[];
  category: string;
  tags: string[];
  status: 'active' | 'draft' | 'archived';
  isFeatured: boolean;
  rating?: number;
  reviewCount?: number;
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

// Category Types
export interface SubCategory {
  id: string;
  name: string;
  slug: string;
  productCount: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  icon?: string;
  productCount: number;
  parentId?: string;
  subcategories?: SubCategory[];
  featured: boolean;
  sortOrder?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  order: number;
}

export interface CategoryFormData {
  name: string;
  slug: string;
  description: string;
  image: string;
  icon: string;
  parentId: string;
  featured: boolean;
  sortOrder: number;
  isActive: boolean;
}

// Order Types
export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: 'razorpay' | 'cod';
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
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

// Cart Types
export interface CartItem {
  productId: string;
  quantity: number;
  price: number;
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
  status: 'upcoming' | 'active' | 'ended' | 'cancelled';
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
  status: 'pending' | 'approved' | 'rejected';
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
  sort?: 'price-asc' | 'price-desc' | 'newest' | 'popular';
  page?: number;
  pageSize?: number;
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
  type: 'percentage' | 'fixed' | 'free_shipping' | 'bogo';
  value: number; // percentage (0-100) or fixed amount
  minimumAmount?: number; // minimum order amount required
  maximumAmount?: number; // maximum discount amount (for percentage coupons)
  maxUses?: number; // total usage limit
  maxUsesPerUser?: number; // per-user usage limit
  usedCount: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'inactive' | 'expired';
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
  type: 'percentage' | 'fixed' | 'free_shipping' | 'bogo';
  value: number;
  minimumAmount: number;
  maximumAmount: number;
  maxUses: number;
  maxUsesPerUser: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'inactive';
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
  status: 'created' | 'authorized' | 'captured' | 'refunded' | 'failed';
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
  payment_method: 'Prepaid' | 'COD';
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
