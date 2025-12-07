// ============================================================
// RIPLIMIT REFUNDS COLLECTION INDEXES
// ============================================================
// Collection: riplimit_refunds
// Purpose: Refund tracking, user refund history
// ============================================================

module.exports = {
  indexes: [
    // Query: User refunds by date range and status
    // Example: where("userId", "==").where("createdAt", ">=").where("status", "in")
    {
      collectionGroup: "riplimit_refunds",
      queryScope: "COLLECTION",
      fields: [
        { fieldPath: "userId", order: "ASCENDING" },
        { fieldPath: "createdAt", order: "ASCENDING" },
        { fieldPath: "status", order: "ASCENDING" }
      ]
    },

    // Query: User refunds ordered by date
    // Example: where("userId", "==").orderBy("createdAt", "desc")
    {
      collectionGroup: "riplimit_refunds",
      queryScope: "COLLECTION",
      fields: [
        { fieldPath: "userId", order: "ASCENDING" },
        { fieldPath: "createdAt", order: "DESCENDING" }
      ]
    }
  ],

  fieldOverrides: []
};
