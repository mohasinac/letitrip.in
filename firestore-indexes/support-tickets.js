// ============================================================
// SUPPORT TICKETS COLLECTION INDEXES
// ============================================================
// Collection: support_tickets
// Purpose: Customer support, issue tracking
// ============================================================

module.exports = {
  indexes: [
    // Query: User tickets by status with ordering
    // Example: where("userId", "==").where("status", "==").orderBy("createdAt", "desc")
    {
      collectionGroup: "support_tickets",
      queryScope: "COLLECTION",
      fields: [
        { fieldPath: "userId", order: "ASCENDING" },
        { fieldPath: "status", order: "ASCENDING" },
        { fieldPath: "createdAt", order: "DESCENDING" }
      ]
    },

    // Query: User tickets by category with ordering
    // Example: where("userId", "==").where("category", "==").orderBy("createdAt", "desc")
    {
      collectionGroup: "support_tickets",
      queryScope: "COLLECTION",
      fields: [
        { fieldPath: "userId", order: "ASCENDING" },
        { fieldPath: "category", order: "ASCENDING" },
        { fieldPath: "createdAt", order: "DESCENDING" }
      ]
    },

    // Query: User tickets by priority with ordering
    // Example: where("userId", "==").where("priority", "==").orderBy("createdAt", "desc")
    {
      collectionGroup: "support_tickets",
      queryScope: "COLLECTION",
      fields: [
        { fieldPath: "userId", order: "ASCENDING" },
        { fieldPath: "priority", order: "ASCENDING" },
        { fieldPath: "createdAt", order: "DESCENDING" }
      ]
    },

    // Query: Shop tickets by status with ordering
    // Example: where("shopId", "==").where("status", "==").orderBy("createdAt", "desc")
    {
      collectionGroup: "support_tickets",
      queryScope: "COLLECTION",
      fields: [
        { fieldPath: "shopId", order: "ASCENDING" },
        { fieldPath: "status", order: "ASCENDING" },
        { fieldPath: "createdAt", order: "DESCENDING" }
      ]
    },

    // Query: Shop tickets by category with ordering
    // Example: where("shopId", "==").where("category", "==").orderBy("createdAt", "desc")
    {
      collectionGroup: "support_tickets",
      queryScope: "COLLECTION",
      fields: [
        { fieldPath: "shopId", order: "ASCENDING" },
        { fieldPath: "category", order: "ASCENDING" },
        { fieldPath: "createdAt", order: "DESCENDING" }
      ]
    },

    // Query: Shop tickets by priority with ordering
    // Example: where("shopId", "==").where("priority", "==").orderBy("createdAt", "desc")
    {
      collectionGroup: "support_tickets",
      queryScope: "COLLECTION",
      fields: [
        { fieldPath: "shopId", order: "ASCENDING" },
        { fieldPath: "priority", order: "ASCENDING" },
        { fieldPath: "createdAt", order: "DESCENDING" }
      ]
    }
  ],

  fieldOverrides: []
};
