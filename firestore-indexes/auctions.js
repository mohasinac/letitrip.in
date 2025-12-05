// ========================================
// AUCTIONS COLLECTION INDEXES
// Supports auction listings, bidding tracking, and time-based queries
// Used by: /api/auctions, /api/shops/[id]/auctions, homepage auctions carousel
// ========================================

module.exports = {
  indexes: [
    // Query: Get active auctions sorted by end time (ending soonest first)
    // Use Case: "Ending Soon" auction listings, urgency-based display
    // Routes: /api/auctions?sort=end_time:asc, homepage urgent auctions
    // Performance: Critical for real-time auction countdown displays
    {
      collectionGroup: "auctions",
      queryScope: "COLLECTION",
      fields: [
        { fieldPath: "status", order: "ASCENDING" },
        { fieldPath: "end_time", order: "ASCENDING" }
      ]
    },

    // Query: Get active auctions sorted by creation date (newest first)
    // Use Case: Default auction listings, "New Auctions" section
    // Routes: /api/auctions, /app/page.tsx (auctions carousel)
    // Sieve: Default sorting for auction discovery pages
    {
      collectionGroup: "auctions",
      queryScope: "COLLECTION",
      fields: [
        { fieldPath: "status", order: "ASCENDING" },
        { fieldPath: "created_at", order: "DESCENDING" }
      ]
    },

    // Query: Get auctions where user is highest bidder
    // Use Case: User's "My Bids" page, "Winning Auctions" dashboard
    // Routes: /api/users/[id]/winning-auctions, buyer dashboard
    // Performance: Enables real-time tracking of user's winning positions
    {
      collectionGroup: "auctions",
      queryScope: "COLLECTION",
      fields: [
        { fieldPath: "status", order: "ASCENDING" },
        { fieldPath: "highest_bidder_id", order: "ASCENDING" },
        { fieldPath: "updated_at", order: "DESCENDING" }
      ]
    },

    // Query: Get shop auctions sorted by end time
    // Use Case: Shop detail page auctions tab, seller auction management
    // Routes: /api/shops/[id]/auctions, seller dashboard active auctions
    // Performance: Critical for shops with 50+ concurrent auctions
    {
      collectionGroup: "auctions",
      queryScope: "COLLECTION",
      fields: [
        { fieldPath: "shop_id", order: "ASCENDING" },
        { fieldPath: "status", order: "ASCENDING" },
        { fieldPath: "end_time", order: "ASCENDING" }
      ]
    },

    // Query: Get category auctions sorted by end time
    // Use Case: Category-specific auction filtering, "Category Auctions Ending Soon"
    // Routes: /api/categories/[id]/auctions, category page auctions section
    // Note: category_id supports both equality and array-contains (see fieldOverrides)
    {
      collectionGroup: "auctions",
      queryScope: "COLLECTION",
      fields: [
        { fieldPath: "status", order: "ASCENDING" },
        { fieldPath: "category_id", order: "ASCENDING" },
        { fieldPath: "end_time", order: "ASCENDING" }
      ]
    },

    // Query: Get featured auctions sorted by end time
    // Use Case: Homepage featured auctions carousel, promotional auction displays
    // Routes: /app/page.tsx (featured auctions), /api/auctions?featured=true
    // Marketing: Enables highlighting premium/sponsored auctions
    {
      collectionGroup: "auctions",
      queryScope: "COLLECTION",
      fields: [
        { fieldPath: "status", order: "ASCENDING" },
        { fieldPath: "is_featured", order: "ASCENDING" },
        { fieldPath: "end_time", order: "ASCENDING" }
      ]
    },

    // Query: Get featured auctions sorted by priority (admin-controlled ranking)
    // Use Case: Manual curation of featured auction order, promotional campaigns
    // Routes: Homepage hero section, featured auction widgets
    // Admin: Allows manual control of auction display order (higher priority = top)
    {
      collectionGroup: "auctions",
      queryScope: "COLLECTION",
      fields: [
        { fieldPath: "is_featured", order: "ASCENDING" },
        { fieldPath: "featured_priority", order: "DESCENDING" }
      ]
    },

    // Query: Get active auctions sorted by current bid (lowest first)
    // Use Case: "Low Starting Price" auctions, bargain hunting filters
    // Routes: /api/auctions?sort=bid:asc, "Affordable Auctions" section
    // UX: Helps buyers discover auctions with low entry barriers
    {
      collectionGroup: "auctions",
      queryScope: "COLLECTION",
      fields: [
        { fieldPath: "status", order: "ASCENDING" },
        { fieldPath: "current_bid", order: "ASCENDING" }
      ]
    },

    // Query: Get active auctions sorted by current bid (highest first)
    // Use Case: "Hot Auctions" display, high-value auction discovery
    // Routes: /api/auctions?sort=bid:desc, "Premium Auctions" section
    // Analytics: Tracks high-engagement/high-value auctions for insights
    {
      collectionGroup: "auctions",
      queryScope: "COLLECTION",
      fields: [
        { fieldPath: "status", order: "ASCENDING" },
        { fieldPath: "current_bid", order: "DESCENDING" }
      ]
    }
  ],

  fieldOverrides: [
    // Auctions category_id field: Same as products, supports multi-category auctions
    // Use Case 1: Equality query - where("category_id", "==", "antiques")
    // Use Case 2: Array query - where("category_id", "array-contains", "collectibles")
    // Required for: Auctions appearing in multiple category pages simultaneously
    // Example: A "Vintage Watch" auction can appear in both "Watches" and "Collectibles"
    {
      collectionGroup: "auctions",
      fieldPath: "category_id",
      indexes: [
        {
          order: "ASCENDING",
          queryScope: "COLLECTION"
        },
        {
          arrayConfig: "CONTAINS",
          queryScope: "COLLECTION"
        }
      ]
    }
  ]
};
