// ─── Pre-order status ─────────────────────────────────────────────────────────

export type PreOrderStatus =
  | "pending" // Customer placed — payment not yet collected
  | "confirmed" // Payment collected / reserved
  | "ready" // Ready to ship / available for pickup
  | "fulfilled" // Shipped/delivered
  | "cancelled";

// ─── Pre-order item ───────────────────────────────────────────────────────────

export interface PreOrderItem {
  id: string;
  customerId: string;
  customerEmail: string;
  customerName?: string;
  productId: string;
  productTitle: string;
  productSlug: string;
  variantLabel?: string;
  quantity: number;
  unitPrice: number;
  currency: string;
  totalAmount: number;
  status: PreOrderStatus;
  /** Expected fulfillment date communicated to buyer */
  estimatedFulfillmentDate?: string;
  /** True if a deposit was collected */
  depositPaid?: boolean;
  depositAmount?: number;
  notes?: string;
  adminNote?: string;
  sellerId?: string;
  storeId?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── List response ────────────────────────────────────────────────────────────

export interface PreOrderListResponse {
  items: PreOrderItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasMore: boolean;
}

// ─── Input ────────────────────────────────────────────────────────────────────

export interface CreatePreOrderInput {
  productId: string;
  variantLabel?: string;
  quantity: number;
  currency: string;
  notes?: string;
}

export interface PreOrderListParams {
  status?: PreOrderStatus;
  customerId?: string;
  sellerId?: string;
  page?: number;
  pageSize?: number;
  sort?: string;
  filters?: string;
}
