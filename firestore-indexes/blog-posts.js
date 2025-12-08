// ========================================
// BLOG_POSTS COLLECTION INDEXES
// Supports blog listing, featured posts, and content filtering
// Used by: /api/blog, blog pages, homepage blog section
// ========================================

module.exports = {
  indexes: [
    // Query: Get featured published blog posts sorted by publish date
    // Use Case: Homepage "Featured Articles" section, blog carousel
    // Routes: /api/blog?featured=true&status=published, homepage blog widget
    {
      collectionGroup: "blog_posts",
      queryScope: "COLLECTION",
      fields: [
        { fieldPath: "is_featured", order: "ASCENDING" },
        { fieldPath: "status", order: "ASCENDING" },
        { fieldPath: "publishedAt", order: "DESCENDING" }
      ]
    },

    // Query: Get published blog posts sorted by publish date
    // Use Case: Blog listing page, "Latest Articles"
    // Routes: /api/blog?status=published, /app/blog/page.tsx
    {
      collectionGroup: "blog_posts",
      queryScope: "COLLECTION",
      fields: [
        { fieldPath: "status", order: "ASCENDING" },
        { fieldPath: "publishedAt", order: "DESCENDING" }
      ]
    },

    // Query: Get blog posts by category sorted by publish date
    // Use Case: Blog category pages, filtered blog listings
    // Routes: /api/blog?category=[id], category-specific blog content
    {
      collectionGroup: "blog_posts",
      queryScope: "COLLECTION",
      fields: [
        { fieldPath: "category", order: "ASCENDING" },
        { fieldPath: "status", order: "ASCENDING" },
        { fieldPath: "publishedAt", order: "DESCENDING" }
      ]
    },

    // Query: Get blog posts by author sorted by publish date
    // Use Case: Author profile pages, "More from this author"
    // Routes: /api/blog?author=[id], author blog archives
    {
      collectionGroup: "blog_posts",
      queryScope: "COLLECTION",
      fields: [
        { fieldPath: "author_id", order: "ASCENDING" },
        { fieldPath: "status", order: "ASCENDING" },
        { fieldPath: "publishedAt", order: "DESCENDING" }
      ]
    }
  ],

  fieldOverrides: []
};
