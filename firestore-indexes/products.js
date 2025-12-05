// ========================================
// PRODUCTS COLLECTION INDEXES
// Supports product listings, filtering, and sorting across the platform
// Used by: /api/products, /api/shops/[id]/products, homepage, category pages
// ========================================

module.exports = {
  indexes: [
    // Query: Get active products sorted by creation date (newest first)
    // Use Case: Default product listings, homepage products carousel
    // Routes: /api/products, /app/page.tsx (homepage)
    {
      collectionGroup: "products",
      queryScope: "COLLECTION",
      fields: [
        { fieldPath: "status", order: "ASCENDING" },
        { fieldPath: "created_at", order: "DESCENDING" }
      ]
    },

    // Query: Get active featured products sorted by date
    // Use Case: Featured products section on homepage, promotional displays
    // Routes: /app/page.tsx (featured carousel), /api/products?featured=true
    {
      collectionGroup: "products",
      queryScope: "COLLECTION",
      fields: [
        { fieldPath: "status", order: "ASCENDING" },
        { fieldPath: "is_featured", order: "ASCENDING" },
        { fieldPath: "created_at", order: "DESCENDING" }
      ]
    },

    // Query: Get active products for a specific shop sorted by date
    // Use Case: Shop detail page product listings, seller dashboard
    // Routes: /api/shops/[id]/products, /app/shops/[id]/page.tsx
    // Performance: Critical for shop pages with 100+ products
    {
      collectionGroup: "products",
      queryScope: "COLLECTION",
      fields: [
        { fieldPath: "status", order: "ASCENDING" },
        { fieldPath: "shop_id", order: "ASCENDING" },
        { fieldPath: "created_at", order: "DESCENDING" }
      ]
    },

    // Query: Get active products in a specific category sorted by date
    // Use Case: Category page listings, category-based filtering
    // Routes: /api/categories/[id]/products, /app/categories/[slug]/page.tsx
    // Note: category_id supports both equality and array-contains (see fieldOverrides)
    {
      collectionGroup: "products",
      queryScope: "COLLECTION",
      fields: [
        { fieldPath: "status", order: "ASCENDING" },
        { fieldPath: "category_id", order: "ASCENDING" },
        { fieldPath: "created_at", order: "DESCENDING" }
      ]
    },

    // Query: Get shop products sorted by price (low to high)
    // Use Case: Shop page with price sorting, "Cheapest First" filter
    // Routes: /api/shops/[id]/products?sort=price:asc
    // Sieve: Supports price range filtering with orderBy price ASC
    {
      collectionGroup: "products",
      queryScope: "COLLECTION",
      fields: [
        { fieldPath: "shop_id", order: "ASCENDING" },
        { fieldPath: "status", order: "ASCENDING" },
        { fieldPath: "price", order: "ASCENDING" }
      ]
    },

    // Query: Get shop products sorted by price (high to low)
    // Use Case: Shop page with price sorting, "Most Expensive First" filter
    // Routes: /api/shops/[id]/products?sort=price:desc
    // Sieve: Supports price range filtering with orderBy price DESC
    {
      collectionGroup: "products",
      queryScope: "COLLECTION",
      fields: [
        { fieldPath: "shop_id", order: "ASCENDING" },
        { fieldPath: "status", order: "ASCENDING" },
        { fieldPath: "price", order: "DESCENDING" }
      ]
    },

    // Query: Get all active products sorted by price (low to high)
    // Use Case: Global product listings with price sorting
    // Routes: /api/products?sort=price:asc
    // Sieve: Default price-based sorting across all products
    {
      collectionGroup: "products",
      queryScope: "COLLECTION",
      fields: [
        { fieldPath: "status", order: "ASCENDING" },
        { fieldPath: "price", order: "ASCENDING" }
      ]
    },

    // Query: Get all active products sorted by price (high to low)
    // Use Case: Global product listings with price sorting
    // Routes: /api/products?sort=price:desc
    // Sieve: Default price-based sorting across all products
    {
      collectionGroup: "products",
      queryScope: "COLLECTION",
      fields: [
        { fieldPath: "status", order: "ASCENDING" },
        { fieldPath: "price", order: "DESCENDING" }
      ]
    },

    // Query: Get products sorted by stock availability
    // Use Case: Admin inventory management, low-stock alerts, out-of-stock warnings
    // Routes: /api/admin/products?sort=stock, seller dashboard inventory page
    // Performance: Critical for seller dashboards tracking inventory levels
    {
      collectionGroup: "products",
      queryScope: "COLLECTION",
      fields: [
        { fieldPath: "status", order: "ASCENDING" },
        { fieldPath: "stock_count", order: "ASCENDING" },
        { fieldPath: "created_at", order: "DESCENDING" }
      ]
    },

    // Query: Get category products sorted by price (low to high)
    // Use Case: Category page with price sorting, price range filters
    // Routes: /api/categories/[id]/products?sort=price:asc
    // Sieve: Category-specific price sorting for filtered results
    {
      collectionGroup: "products",
      queryScope: "COLLECTION",
      fields: [
        { fieldPath: "category_id", order: "ASCENDING" },
        { fieldPath: "status", order: "ASCENDING" },
        { fieldPath: "price", order: "ASCENDING" }
      ]
    },

    // Query: Get category products sorted by creation date (newest first)
    // Use Case: Category page default view, "New Arrivals" in category
    // Routes: /api/categories/[id]/products, /app/categories/[slug]/page.tsx
    // Sieve: Default sorting for category product listings
    {
      collectionGroup: "products",
      queryScope: "COLLECTION",
      fields: [
        { fieldPath: "category_id", order: "ASCENDING" },
        { fieldPath: "status", order: "ASCENDING" },
        { fieldPath: "created_at", order: "DESCENDING" }
      ]
    }
  ],

  fieldOverrides: [
    // Products category_id field: Supports both single category queries AND multi-category arrays
    // Use Case 1: Equality query - where("category_id", "==", "electronics")
    // Use Case 2: Array query - where("category_id", "array-contains", "electronics")
    // Required for: Multi-parent category graph (Task 30), cross-category product listings
    // Note: Without this override, Firestore only allows ONE query mode per field
    {
      collectionGroup: "products",
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
