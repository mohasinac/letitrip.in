// ============================================================
// RETURNS COLLECTION INDEXES
// ============================================================
// Collection: returns
// Purpose: Product returns, refund requests
// ============================================================

module.exports = {
  indexes: [
    // Query: User returns by status
    // Example: where("user_id", "==").where("status", "==").orderBy("created_at", "desc")
    {
      collectionGroup: "returns",
      queryScope: "COLLECTION",
      fields: [
        { fieldPath: "user_id", order: "ASCENDING" },
        { fieldPath: "status", order: "ASCENDING" },
        { fieldPath: "created_at", order: "DESCENDING" }
      ]
    },

    // Query: Shop returns by status
    // Example: where("shop_id", "==").where("status", "==").orderBy("created_at", "desc")
    {
      collectionGroup: "returns",
      queryScope: "COLLECTION",
      fields: [
        { fieldPath: "shop_id", order: "ASCENDING" },
        { fieldPath: "status", order: "ASCENDING" },
        { fieldPath: "created_at", order: "DESCENDING" }
      ]
    },

    // Query: Returns by reason and date
    // Example: where("reason", "==").orderBy("created_at", "desc")
    {
      collectionGroup: "returns",
      queryScope: "COLLECTION",
      fields: [
        { fieldPath: "reason", order: "ASCENDING" },
        { fieldPath: "created_at", order: "DESCENDING" }
      ]
    },

    // Query: Returns requiring admin intervention
    // Example: where("requires_admin_intervention", "==").orderBy("created_at", "desc")
    {
      collectionGroup: "returns",
      queryScope: "COLLECTION",
      fields: [
        { fieldPath: "requires_admin_intervention", order: "ASCENDING" },
        { fieldPath: "created_at", order: "DESCENDING" }
      ]
    },

    // Query: User returns ordered by date
    // Example: where("user_id", "==").orderBy("created_at", "desc")
    {
      collectionGroup: "returns",
      queryScope: "COLLECTION",
      fields: [
        { fieldPath: "user_id", order: "ASCENDING" },
        { fieldPath: "created_at", order: "DESCENDING" }
      ]
    },

    // Query: Shop returns ordered by date
    // Example: where("shop_id", "==").orderBy("created_at", "desc")
    {
      collectionGroup: "returns",
      queryScope: "COLLECTION",
      fields: [
        { fieldPath: "shop_id", order: "ASCENDING" },
        { fieldPath: "created_at", order: "DESCENDING" }
      ]
    }
  ],

  fieldOverrides: []
};
