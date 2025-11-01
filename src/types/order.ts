export type OrderStatus =
  | "pending_payment"
  | "pending_approval"
  | "processing"
  | "shipped"
  | "in_transit"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"
  | "refunded";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export type PaymentMethod = "razorpay" | "paypal" | "cod";

export interface OrderItem {
  id: string;
  productId: string;
  name: string;
  image: string;
  price: number; // in INR
  quantity: number;
  sellerId: string;
  sellerName: string;
  sku?: string;
  slug?: string;
}

export interface OrderAddress {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  userName: string;
  userEmail: string;

  // Seller info (for single-seller orders)
  sellerId?: string;
  sellerName?: string;

  // Items
  items: OrderItem[];

  // Pricing (all in INR)
  subtotal: number;
  couponDiscount: number;
  saleDiscount: number;
  shippingCharges: number;
  platformFee: number;
  tax: number;
  total: number;

  // Currency
  currency: string; // Currency used for payment
  exchangeRate: number; // Exchange rate at time of order
  originalAmount: number; // Amount in original currency

  // Payment
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentId?: string; // Razorpay/PayPal payment ID
  transactionId?: string;
  razorpayOrderId?: string;
  paypalOrderId?: string;

  // Addresses
  shippingAddress: OrderAddress;
  billingAddress: OrderAddress;

  // Status
  status: OrderStatus;

  // Tracking
  trackingNumber?: string;
  shipmentId?: string;
  courierName?: string;
  estimatedDelivery?: string;

  // Notes
  customerNotes?: string;
  sellerNotes?: string;
  cancellationReason?: string;

  // Timestamps
  createdAt: string;
  updatedAt: string;
  paidAt?: string;
  approvedAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
  refundedAt?: string;
}

export interface CreateOrderInput {
  items: OrderItem[];
  shippingAddress: OrderAddress;
  billingAddress: OrderAddress;
  paymentMethod: PaymentMethod;
  currency: string;
  exchangeRate: number;
  customerNotes?: string;
  couponCode?: string;
}

export interface OrderSummary {
  subtotal: number;
  shipping: number;
  discount: number;
  tax: number;
  total: number;
}
