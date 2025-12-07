// ============================================================
// NOTIFICATIONS COLLECTION INDEXES
// ============================================================
// Collection: notifications
// Purpose: User notifications, system alerts, push notifications
// ============================================================

module.exports = {
  indexes: [
    // Query: User notifications by read status
    // Example: where("userId", "==").where("read", "==").orderBy("createdAt", "desc")
    {
      collectionGroup: "notifications",
      queryScope: "COLLECTION",
      fields: [
        { fieldPath: "userId", order: "ASCENDING" },
        { fieldPath: "read", order: "ASCENDING" },
        { fieldPath: "createdAt", order: "DESCENDING" }
      ]
    },

    // Query: User notifications ordered by date
    // Example: where("userId", "==").orderBy("createdAt", "desc")
    {
      collectionGroup: "notifications",
      queryScope: "COLLECTION",
      fields: [
        { fieldPath: "userId", order: "ASCENDING" },
        { fieldPath: "createdAt", order: "DESCENDING" }
      ]
    },

    // Query: User notifications by type
    // Example: where("userId", "==").where("type", "==").orderBy("createdAt", "desc")
    {
      collectionGroup: "notifications",
      queryScope: "COLLECTION",
      fields: [
        { fieldPath: "userId", order: "ASCENDING" },
        { fieldPath: "type", order: "ASCENDING" },
        { fieldPath: "createdAt", order: "DESCENDING" }
      ]
    },

    // Query: Unread notifications count
    // Example: where("userId", "==").where("read", "==", false)
    {
      collectionGroup: "notifications",
      queryScope: "COLLECTION",
      fields: [
        { fieldPath: "userId", order: "ASCENDING" },
        { fieldPath: "read", order: "ASCENDING" }
      ]
    }
  ],

  fieldOverrides: []
};
