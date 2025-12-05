// ========================================
// FAVORITES/WATCHLIST COLLECTION INDEXES
// Supports user wishlist, saved items, and product/auction tracking
// Used by: Wishlist pages, saved items, user preference tracking
// ========================================

module.exports = {
  indexes: [
    // Query: Get user favorites filtered by type (product/auction/shop)
    // Use Case: User wishlist page, "My Saved Products" vs "Saved Auctions"
    // Routes: /api/users/[id]/favorites?type=product, wishlist management
    // UX: Separate tabs for saved products, auctions, and followed shops
    {
      collectionGroup: "favorites",
      queryScope: "COLLECTION",
      fields: [
        { fieldPath: "user_id", order: "ASCENDING" },
        { fieldPath: "type", order: "ASCENDING" },
        { fieldPath: "created_at", order: "DESCENDING" }
      ]
    },

    // Query: Get user favorites filtered by item_type (alternate field naming)
    // Use Case: Same as above, supports legacy field naming convention
    // Routes: /api/users/[id]/favorites?item_type=auction
    // Note: Supports both 'type' and 'item_type' field names for compatibility
    {
      collectionGroup: "favorites",
      queryScope: "COLLECTION",
      fields: [
        { fieldPath: "user_id", order: "ASCENDING" },
        { fieldPath: "item_type", order: "ASCENDING" },
        { fieldPath: "created_at", order: "DESCENDING" }
      ]
    }
  ],

  fieldOverrides: []
};
