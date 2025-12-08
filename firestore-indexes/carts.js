// ========================================
// CARTS COLLECTION INDEXES
// Supports shopping cart management and user cart tracking
// Used by: /api/cart, cart pages, checkout flow
// ========================================

module.exports = {
  indexes: [
    // Query: Get user's cart items sorted by date added (newest first)
    // Use Case: Cart page, checkout flow, cart item display
    // Routes: /api/cart, /app/cart/page.tsx
    // Performance: Critical for cart with many items
    {
      collectionGroup: "carts",
      queryScope: "COLLECTION",
      fields: [
        { fieldPath: "user_id", order: "ASCENDING" },
        { fieldPath: "added_at", order: "DESCENDING" }
      ]
    },

    // Query: Get cart items by product sorted by date
    // Use Case: Cart item lookup, product availability checks
    // Routes: Cart management, inventory sync
    {
      collectionGroup: "carts",
      queryScope: "COLLECTION",
      fields: [
        { fieldPath: "product_id", order: "ASCENDING" },
        { fieldPath: "added_at", order: "DESCENDING" }
      ]
    },

    // Query: Get cart items by shop sorted by date
    // Use Case: Shop-based cart grouping for multi-vendor checkout
    // Routes: Checkout flow, shipping calculations per shop
    {
      collectionGroup: "carts",
      queryScope: "COLLECTION",
      fields: [
        { fieldPath: "shop_id", order: "ASCENDING" },
        { fieldPath: "user_id", order: "ASCENDING" },
        { fieldPath: "added_at", order: "DESCENDING" }
      ]
    }
  ],

  fieldOverrides: []
};
