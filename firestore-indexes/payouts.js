// ============================================================
// PAYOUTS COLLECTION INDEXES
// ============================================================
// Collection: payouts
// Purpose: Seller payouts, commission tracking
// ============================================================

module.exports = {
  indexes: [
    // Query: Seller payouts by status
    // Example: where("seller_id", "==").where("status", "==").orderBy("created_at", "desc")
    {
      collectionGroup: "payouts",
      queryScope: "COLLECTION",
      fields: [
        { fieldPath: "seller_id", order: "ASCENDING" },
        { fieldPath: "status", order: "ASCENDING" },
        { fieldPath: "created_at", order: "DESCENDING" }
      ]
    },

    // Query: Seller payouts ordered by date
    // Example: where("seller_id", "==").orderBy("created_at", "desc")
    {
      collectionGroup: "payouts",
      queryScope: "COLLECTION",
      fields: [
        { fieldPath: "seller_id", order: "ASCENDING" },
        { fieldPath: "created_at", order: "DESCENDING" }
      ]
    },

    // Query: Payouts by status and date
    // Example: where("status", "==").orderBy("created_at", "desc")
    {
      collectionGroup: "payouts",
      queryScope: "COLLECTION",
      fields: [
        { fieldPath: "status", order: "ASCENDING" },
        { fieldPath: "created_at", order: "DESCENDING" }
      ]
    }
  ],

  fieldOverrides: []
};
