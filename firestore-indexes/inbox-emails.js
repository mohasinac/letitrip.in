// ============================================================
// INBOX EMAILS COLLECTION INDEXES
// ============================================================
// Collection: inboxEmails
// Purpose: Email inbox management, email filtering
// ============================================================

module.exports = {
  indexes: [
    // Query: Emails by read status and date
    // Example: where("read", "==").orderBy("receivedAt", "desc")
    {
      collectionGroup: "inboxEmails",
      queryScope: "COLLECTION",
      fields: [
        { fieldPath: "read", order: "ASCENDING" },
        { fieldPath: "receivedAt", order: "DESCENDING" }
      ]
    },

    // Query: Emails by label and date
    // Example: where("labels", "array-contains").orderBy("receivedAt", "desc")
    {
      collectionGroup: "inboxEmails",
      queryScope: "COLLECTION",
      fields: [
        { fieldPath: "labels", order: "ASCENDING" },
        { fieldPath: "receivedAt", order: "DESCENDING" }
      ]
    },

    // Query: Emails by user and date
    // Example: where("userId", "==").orderBy("receivedAt", "desc")
    {
      collectionGroup: "inboxEmails",
      queryScope: "COLLECTION",
      fields: [
        { fieldPath: "userId", order: "ASCENDING" },
        { fieldPath: "receivedAt", order: "DESCENDING" }
      ]
    }
  ],

  fieldOverrides: []
};
