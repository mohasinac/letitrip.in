// ============================================================
// CONVERSATIONS COLLECTION INDEXES
// ============================================================
// Collection: conversations
// Purpose: Messaging between users, chat conversations
// ============================================================

module.exports = {
  indexes: [
    // Query: User conversations ordered by update time
    // Example: where("participantIds", "array-contains").orderBy("updatedAt", "desc")
    {
      collectionGroup: "conversations",
      queryScope: "COLLECTION",
      fields: [
        { fieldPath: "participantIds", order: "ASCENDING" },
        { fieldPath: "updatedAt", order: "DESCENDING" }
      ]
    },

    // Query: Active user conversations
    // Example: where("participantIds", "array-contains").where("status", "==")
    {
      collectionGroup: "conversations",
      queryScope: "COLLECTION",
      fields: [
        { fieldPath: "participantIds", order: "ASCENDING" },
        { fieldPath: "status", order: "ASCENDING" }
      ]
    },

    // Query: Active user conversations ordered by update time
    // Example: where("participantIds", "array-contains").where("status", "==").orderBy("updatedAt", "desc")
    {
      collectionGroup: "conversations",
      queryScope: "COLLECTION",
      fields: [
        { fieldPath: "participantIds", order: "ASCENDING" },
        { fieldPath: "status", order: "ASCENDING" },
        { fieldPath: "updatedAt", order: "DESCENDING" }
      ]
    }
  ],

  fieldOverrides: []
};
