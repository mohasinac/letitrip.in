// ============================================================
// PAYMENTS COLLECTION INDEXES
// ============================================================
// Collection: payments
// Purpose: Payment tracking, transaction history
// ============================================================

module.exports = {
  indexes: [
    // Query: Shop payments ordered by date
    // Example: where("shop_id", "==").orderBy("created_at", "desc")
    {
      collectionGroup: "payments",
      queryScope: "COLLECTION",
      fields: [
        { fieldPath: "shop_id", order: "ASCENDING" },
        { fieldPath: "created_at", order: "DESCENDING" }
      ]
    },

    // Query: User payments ordered by date
    // Example: where("user_id", "==").orderBy("created_at", "desc")
    {
      collectionGroup: "payments",
      queryScope: "COLLECTION",
      fields: [
        { fieldPath: "user_id", order: "ASCENDING" },
        { fieldPath: "created_at", order: "DESCENDING" }
      ]
    },

    // Query: Shop payments by status and date
    // Example: where("shop_id", "==").where("status", "==").orderBy("created_at", "desc")
    {
      collectionGroup: "payments",
      queryScope: "COLLECTION",
      fields: [
        { fieldPath: "shop_id", order: "ASCENDING" },
        { fieldPath: "status", order: "ASCENDING" },
        { fieldPath: "created_at", order: "DESCENDING" }
      ]
    },

    // Query: User payments by status and date
    // Example: where("user_id", "==").where("status", "==").orderBy("created_at", "desc")
    {
      collectionGroup: "payments",
      queryScope: "COLLECTION",
      fields: [
        { fieldPath: "user_id", order: "ASCENDING" },
        { fieldPath: "status", order: "ASCENDING" },
        { fieldPath: "created_at", order: "DESCENDING" }
      ]
    },

    // Query: Shop payments by gateway and date
    // Example: where("shop_id", "==").where("gateway", "==").orderBy("created_at", "desc")
    {
      collectionGroup: "payments",
      queryScope: "COLLECTION",
      fields: [
        { fieldPath: "shop_id", order: "ASCENDING" },
        { fieldPath: "gateway", order: "ASCENDING" },
        { fieldPath: "created_at", order: "DESCENDING" }
      ]
    }
  ],

  fieldOverrides: []
};
