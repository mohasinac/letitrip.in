// ============================================================
// ADDRESSES COLLECTION INDEXES
// ============================================================
// Collection: addresses
// Purpose: User address management, default address selection
// ============================================================

module.exports = {
  indexes: [
    // Query: User addresses ordered by default status
    // Example: where("userId", "==").orderBy("isDefault", "desc")
    {
      collectionGroup: "addresses",
      queryScope: "COLLECTION",
      fields: [
        { fieldPath: "userId", order: "ASCENDING" },
        { fieldPath: "isDefault", order: "DESCENDING" }
      ]
    },

    // Query: User addresses with default filter
    // Example: where("userId", "==").where("isDefault", "==")
    {
      collectionGroup: "addresses",
      queryScope: "COLLECTION",
      fields: [
        { fieldPath: "userId", order: "ASCENDING" },
        { fieldPath: "isDefault", order: "ASCENDING" }
      ]
    },

    // Query: User addresses ordered by creation date
    // Example: where("userId", "==").orderBy("createdAt", "desc")
    {
      collectionGroup: "addresses",
      queryScope: "COLLECTION",
      fields: [
        { fieldPath: "userId", order: "ASCENDING" },
        { fieldPath: "createdAt", order: "DESCENDING" }
      ]
    }
  ],

  fieldOverrides: []
};
