// ========================================
// BIDS COLLECTION INDEXES
// Supports auction bidding history, bid tracking, and analytics
// Used by: Auction detail pages, bidding history, user bid tracking
// ========================================

module.exports = {
  indexes: [
    // Query: Get all bids for an auction sorted by date (newest first)
    // Use Case: Auction detail page bid history, real-time bid updates
    // Routes: /api/auctions/[id]/bids, auction page bidding activity
    // Real-time: Critical for live auction bid tracking and notifications
    {
      collectionGroup: "bids",
      queryScope: "COLLECTION",
      fields: [
        { fieldPath: "auction_id", order: "ASCENDING" },
        { fieldPath: "created_at", order: "DESCENDING" }
      ]
    },

    // Query: Get all bids for an auction sorted by date (oldest first)
    // Use Case: Bid history timeline, chronological bid progression analysis
    // Routes: Analytics dashboards, auction timeline visualization
    // Analytics: Tracks bidding patterns and user engagement over time
    {
      collectionGroup: "bids",
      queryScope: "COLLECTION",
      fields: [
        { fieldPath: "auction_id", order: "ASCENDING" },
        { fieldPath: "created_at", order: "ASCENDING" }
      ]
    },

    // Query: Get all bids placed by a specific user
    // Use Case: User "My Bids" page, bidding history dashboard
    // Routes: /api/users/[id]/bids, buyer dashboard bid tracking
    // UX: Enables users to track all their auction participation
    {
      collectionGroup: "bids",
      queryScope: "COLLECTION",
      fields: [
        { fieldPath: "user_id", order: "ASCENDING" },
        { fieldPath: "created_at", order: "DESCENDING" }
      ]
    },

    // Query: Get auction bids sorted by amount (highest first)
    // Use Case: Display top bids, identify current highest bidder
    // Routes: /api/auctions/[id]/top-bids, auction detail page leaderboard
    // Real-time: Shows competitive bidding landscape to users
    {
      collectionGroup: "bids",
      queryScope: "COLLECTION",
      fields: [
        { fieldPath: "auction_id", order: "ASCENDING" },
        { fieldPath: "amount", order: "DESCENDING" }
      ]
    }
  ],

  fieldOverrides: []
};
