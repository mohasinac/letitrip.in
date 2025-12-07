// ============================================================
// USER ACTIVITIES COLLECTION INDEXES
// ============================================================
// Collection: user_activities
// Purpose: IP tracking, activity monitoring, rate limiting
// ============================================================

module.exports = {
  indexes: [
    // Query: IP address + action + timestamp range (rate limiting)
    // Example: where("ipAddress", "==").where("action", "==").where("timestamp", ">=")
    {
      collectionGroup: "user_activities",
      queryScope: "COLLECTION",
      fields: [
        { fieldPath: "ipAddress", order: "ASCENDING" },
        { fieldPath: "action", order: "ASCENDING" },
        { fieldPath: "timestamp", order: "ASCENDING" }
      ]
    },

    // Query: IP address + timestamp ordered (recent activity)
    // Example: where("ipAddress", "==").orderBy("timestamp", "desc")
    {
      collectionGroup: "user_activities",
      queryScope: "COLLECTION",
      fields: [
        { fieldPath: "ipAddress", order: "ASCENDING" },
        { fieldPath: "timestamp", order: "DESCENDING" }
      ]
    },

    // Query: User ID + timestamp ordered (user activity log)
    // Example: where("userId", "==").orderBy("timestamp", "desc")
    {
      collectionGroup: "user_activities",
      queryScope: "COLLECTION",
      fields: [
        { fieldPath: "userId", order: "ASCENDING" },
        { fieldPath: "timestamp", order: "DESCENDING" }
      ]
    },

    // Query: IP address + timestamp range (recent requests)
    // Example: where("ipAddress", "==").where("timestamp", ">=")
    {
      collectionGroup: "user_activities",
      queryScope: "COLLECTION",
      fields: [
        { fieldPath: "ipAddress", order: "ASCENDING" },
        { fieldPath: "timestamp", order: "ASCENDING" }
      ]
    }
  ],

  fieldOverrides: []
};
