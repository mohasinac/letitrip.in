// ========================================
// ORDERS COLLECTION INDEXES
// Supports order tracking, seller fulfillment, and payment reconciliation
// Used by: /api/orders, buyer/seller dashboards, admin order management
// ========================================

module.exports = {
  indexes: [
    // Query: Get all orders for a specific user sorted by date (newest first)
    // Use Case: Buyer "My Orders" page, order history
    // Routes: /api/users/[id]/orders, buyer dashboard
    // Performance: Critical for users with 100+ orders
    {
      collectionGroup: "orders",
      queryScope: "COLLECTION",
      fields: [
        { fieldPath: "user_id", order: "ASCENDING" },
        { fieldPath: "created_at", order: "DESCENDING" }
      ]
    },

    // Query: Get all orders for a specific shop sorted by date
    // Use Case: Seller "Orders to Fulfill" dashboard, shop order management
    // Routes: /api/shops/[id]/orders, seller dashboard
    // Performance: Critical for high-volume sellers (1000+ orders/month)
    {
      collectionGroup: "orders",
      queryScope: "COLLECTION",
      fields: [
        { fieldPath: "shop_id", order: "ASCENDING" },
        { fieldPath: "created_at", order: "DESCENDING" }
      ]
    },

    // Query: Get shop orders filtered by status (pending/processing/shipped/delivered)
    // Use Case: Seller order fulfillment workflow, status-based filtering
    // Routes: /api/shops/[id]/orders?status=pending, seller action queues
    // Fulfillment: Enables "Orders to Ship", "Orders to Pack" views
    {
      collectionGroup: "orders",
      queryScope: "COLLECTION",
      fields: [
        { fieldPath: "shop_id", order: "ASCENDING" },
        { fieldPath: "status", order: "ASCENDING" },
        { fieldPath: "created_at", order: "DESCENDING" }
      ]
    },

    // Query: Get user orders filtered by status
    // Use Case: Buyer order tracking, "Active Orders" vs "Completed Orders" tabs
    // Routes: /api/users/[id]/orders?status=shipped, order status tracking
    // UX: Enables "Track My Shipment", "Cancel Order" features
    {
      collectionGroup: "orders",
      queryScope: "COLLECTION",
      fields: [
        { fieldPath: "user_id", order: "ASCENDING" },
        { fieldPath: "status", order: "ASCENDING" },
        { fieldPath: "created_at", order: "DESCENDING" }
      ]
    },

    // Query: Get orders filtered by both order status and payment status
    // Use Case: Admin financial reconciliation, payment issue resolution
    // Routes: /api/admin/orders?status=pending&payment=failed, accounting dashboards
    // Razorpay: Tracks payment failures, refunds, pending captures
    {
      collectionGroup: "orders",
      queryScope: "COLLECTION",
      fields: [
        { fieldPath: "status", order: "ASCENDING" },
        { fieldPath: "payment_status", order: "ASCENDING" },
        { fieldPath: "created_at", order: "DESCENDING" }
      ]
    },

    // Query: Get all orders filtered by payment status (paid/pending/failed/refunded)
    // Use Case: Payment reconciliation reports, failed payment retries
    // Routes: /api/admin/payments, financial reporting dashboards
    // Razorpay: Critical for webhook processing and payment sync
    {
      collectionGroup: "orders",
      queryScope: "COLLECTION",
      fields: [
        { fieldPath: "payment_status", order: "ASCENDING" },
        { fieldPath: "created_at", order: "DESCENDING" }
      ]
    },

    // Query: Get shop orders sorted by date (oldest first)
    // Use Case: Shop analytics, revenue calculation by date range, trend analysis
    // Routes: /api/shops/[id]/analytics, seller dashboard revenue charts
    // Analytics: Enables time-series analysis (daily/monthly revenue, growth trends)
    {
      collectionGroup: "orders",
      queryScope: "COLLECTION",
      fields: [
        { fieldPath: "shop_id", order: "ASCENDING" },
        { fieldPath: "created_at", order: "ASCENDING" }
      ]
    }
  ],

  fieldOverrides: []
};
