// ========================================
// CATEGORIES COLLECTION INDEXES
// Supports category navigation, hierarchical menus, and sorting
// Used by: Category menus, navigation breadcrumbs, category management
// ========================================

module.exports = {
  indexes: [
    // Query: Get active categories sorted by display order
    // Use Case: Main navigation menu, category dropdowns, homepage category grid
    // Routes: /api/categories, navigation components
    // UX: Controls category display order in menus and listings
    {
      collectionGroup: "categories",
      queryScope: "COLLECTION",
      fields: [
        { fieldPath: "is_active", order: "ASCENDING" },
        { fieldPath: "sort_order", order: "ASCENDING" }
      ]
    },

    // Query: Get featured categories sorted by display order
    // Use Case: Homepage "Popular Categories" section, featured category carousel
    // Routes: /app/page.tsx (featured categories), marketing widgets
    // Marketing: Highlights selected categories for promotional campaigns
    {
      collectionGroup: "categories",
      queryScope: "COLLECTION",
      fields: [
        { fieldPath: "is_featured", order: "ASCENDING" },
        { fieldPath: "sort_order", order: "ASCENDING" }
      ]
    },

    // Query: Get featured active categories sorted by featured order
    // Use Case: Homepage featured categories with custom ordering
    // Routes: /api/homepage/categories/featured, homepage category widgets
    // Marketing: Custom order for promotional category displays
    {
      collectionGroup: "categories",
      queryScope: "COLLECTION",
      fields: [
        { fieldPath: "featured", order: "ASCENDING" },
        { fieldPath: "isActive", order: "ASCENDING" },
        { fieldPath: "featured_order", order: "ASCENDING" }
      ]
    },

    // Query: Get active child categories for a parent, sorted by display order
    // Use Case: Multi-level category navigation, subcategory dropdowns
    // Routes: /api/categories/[id]/children, hierarchical menus
    // Graph: Supports multi-parent category graph visualization (Task 30)
    // Note: Uses camelCase field names (legacy compatibility)
    {
      collectionGroup: "categories",
      queryScope: "COLLECTION",
      fields: [
        { fieldPath: "parentId", order: "ASCENDING" },
        { fieldPath: "isActive", order: "ASCENDING" },
        { fieldPath: "sortOrder", order: "ASCENDING" }
      ]
    },

    // Query: Get all child categories (including inactive) for a parent
    // Use Case: Admin category management, bulk operations on subcategories
    // Routes: /api/admin/categories/[id]/children, category tree editor
    // Admin: Enables visibility of disabled categories for moderation
    {
      collectionGroup: "categories",
      queryScope: "COLLECTION",
      fields: [
        { fieldPath: "parentId", order: "ASCENDING" },
        { fieldPath: "sortOrder", order: "ASCENDING" }
      ]
    }
  ],

  fieldOverrides: []
};
