// ========================================
// REVIEWS COLLECTION INDEXES
// Supports product/shop reviews, ratings display, and moderation
// Used by: Product detail pages, shop ratings, review management
// ========================================

module.exports = {
  indexes: [
    // Query: Get all reviews for a product sorted by date (newest first)
    // Use Case: Product detail page reviews section, review pagination
    // Routes: /api/products/[id]/reviews, product page review display
    // Performance: Critical for products with 100+ reviews
    {
      collectionGroup: "reviews",
      queryScope: "COLLECTION",
      fields: [
        { fieldPath: "product_id", order: "ASCENDING" },
        { fieldPath: "created_at", order: "DESCENDING" }
      ]
    },

    // Query: Get product reviews filtered by rating (1-5 stars)
    // Use Case: Review filtering ("Show 5-star reviews only"), sentiment analysis
    // Routes: /api/products/[id]/reviews?rating=5, review filter controls
    // UX: Enables "Most Helpful", "Critical Reviews" filtering
    {
      collectionGroup: "reviews",
      queryScope: "COLLECTION",
      fields: [
        { fieldPath: "product_id", order: "ASCENDING" },
        { fieldPath: "rating", order: "ASCENDING" },
        { fieldPath: "created_at", order: "DESCENDING" }
      ]
    },

    // Query: Get all reviews for a shop sorted by date (newest first)
    // Use Case: Shop detail page overall seller ratings, shop reputation
    // Routes: /api/shops/[id]/reviews, shop profile reviews tab
    // Note: Uses camelCase field names (legacy compatibility)
    {
      collectionGroup: "reviews",
      queryScope: "COLLECTION",
      fields: [
        { fieldPath: "shopId", order: "ASCENDING" },
        { fieldPath: "createdAt", order: "DESCENDING" }
      ]
    },

    // Query: Get all reviews written by a specific user
    // Use Case: User profile "My Reviews" page, review history
    // Routes: /api/users/[id]/reviews, buyer dashboard reviews section
    // Moderation: Enables tracking prolific/spam reviewers
    {
      collectionGroup: "reviews",
      queryScope: "COLLECTION",
      fields: [
        { fieldPath: "user_id", order: "ASCENDING" },
        { fieldPath: "created_at", order: "DESCENDING" }
      ]
    },

    // Query: Get approved high-rated reviews sorted by date
    // Use Case: Homepage "Recent Reviews" section, testimonials display
    // Routes: /api/homepage/reviews?minRating=4&limit=10
    // Marketing: Showcases positive customer feedback on homepage
    {
      collectionGroup: "reviews",
      queryScope: "COLLECTION",
      fields: [
        { fieldPath: "isApproved", order: "ASCENDING" },
        { fieldPath: "rating", order: "DESCENDING" },
        { fieldPath: "created_at", order: "DESCENDING" }
      ]
    }
  ],

  fieldOverrides: []
};
