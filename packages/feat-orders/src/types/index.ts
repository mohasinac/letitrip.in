import type { PaymentGateway, PaymentStatus } from "@mohasinac/feat-payments";
import type { UserAddress } from "@mohasinac/feat-account";

export { PaymentGateway, PaymentStatus, UserAddress };

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded"
  | "return_requested"
  | "returned";

export interface OrderItem {
  productId: string;
  title: string;
  image?: string;
  price: number;
  quantity: number;
  currency?: string;
  sellerId?: string;
  attributes?: Record<string, string>;
}

export interface OrderTimeline {
  status: OrderStatus;
  message?: string;
  timestamp: string;
  actor?: string;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  address: UserAddress;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentGateway?: PaymentGateway;
  subtotal: number;
  shippingCost?: number;
  discount?: number;
  tax?: number;
  total: number;
  currency: string;
  couponCode?: string;
  trackingNumber?: string;
  shippingCarrier?: string;
  notes?: string;
  timeline?: OrderTimeline[];
  createdAt?: string;
  updatedAt?: string;
}

export interface OrderListResponse {
  items: Order[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export interface OrderListParams {
  userId?: string;
  orderStatus?: OrderStatus;
  paymentStatus?: PaymentStatus;
  sort?: string;
  page?: number;
  perPage?: number;
}
