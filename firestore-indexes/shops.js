// ========================================
// SHOPS COLLECTION INDEXES
// Supports shop discovery, verification filtering, and seller management
// Used by: /api/shops, shop discovery pages, admin verification workflows
// ========================================

module.exports = {
  indexes: [
    // Query: Get featured and verified shops sorted by creation date
    // Use Case: Homepage "Trusted Sellers" section, premium shop listings
    // Routes: /api/shops?featured=true&verified=true, homepage shop carousel
    // Marketing: Highlights premium verified sellers for customer confidence
    {
      collectionGroup: "shops",
      queryScope: "COLLECTION",
      fields: [
        { fieldPath: "is_featured", order: "ASCENDING" },
        { fieldPath: "is_verified", order: "ASCENDING" },
        { fieldPath: "created_at", order: "DESCENDING" }
      ]
    },

    // Query: Get non-banned shops filtered by verification status
    // Use Case: Admin moderation panel, shop approval workflows
    // Routes: /api/admin/shops, admin dashboard shop management
    // Moderation: Enables filtering active vs. banned shops in admin tools
    {
      collectionGroup: "shops",
      queryScope: "COLLECTION",
      fields: [
        { fieldPath: "is_banned", order: "ASCENDING" },
        { fieldPath: "is_verified", order: "ASCENDING" },
        { fieldPath: "created_at", order: "DESCENDING" }
      ]
    },

    // Query: Get all shops owned by a specific user
    // Use Case: Seller dashboard "My Shops" page, multi-shop seller management
    // Routes: /api/users/[id]/shops, seller dashboard
    // Multi-Seller: Supports users managing multiple shops (power sellers)
    {
      collectionGroup: "shops",
      queryScope: "COLLECTION",
      fields: [
        { fieldPath: "owner_id", order: "ASCENDING" },
        { fieldPath: "created_at", order: "DESCENDING" }
      ]
    },

    // Query: Get verified shops sorted by creation date
    // Use Case: "Verified Sellers" discovery page, trust-based filtering
    // Routes: /api/shops?verified=true, trust badge displays
    // Trust: Builds customer confidence by showcasing verified merchants
    {
      collectionGroup: "shops",
      queryScope: "COLLECTION",
      fields: [
        { fieldPath: "is_verified", order: "ASCENDING" },
        { fieldPath: "created_at", order: "DESCENDING" }
      ]
    },

    // Query: Get featured shops sorted by rating (highest first)
    // Use Case: "Top Rated Shops" section, quality-based shop ranking
    // Routes: /api/shops?featured=true&sort=rating:desc
    // UX: Combines promotional features with customer trust signals
    {
      collectionGroup: "shops",
      queryScope: "COLLECTION",
      fields: [
        { fieldPath: "is_featured", order: "ASCENDING" },
        { fieldPath: "rating", order: "DESCENDING" }
      ]
    },

    // Query: Get featured shops sorted by custom featured order
    // Use Case: Homepage featured shops section with manual ordering
    // Routes: /api/homepage/shops/featured, homepage shop carousels
    // Marketing: Custom order for promotional shop displays
    {
      collectionGroup: "shops",
      queryScope: "COLLECTION",
      fields: [
        { fieldPath: "featured", order: "ASCENDING" },
        { fieldPath: "featured_order", order: "ASCENDING" }
      ]
    }
  ],

  fieldOverrides: []
};
