/**
 * Test Configuration and Constants
 *
 * Central place for all test configuration values.
 * Update these constants based on your test environment.
 *
 * AUTHENTICATION NOTES:
 * - Public APIs (products, shops, categories) work without authentication
 * - Protected APIs (cart, orders, profiles) require valid session cookies
 * - Workflow tests automatically skip auth-required steps if not authenticated
 * - Set WORKFLOW_OPTIONS.REQUIRE_AUTH = true to enforce authentication
 */

export const TEST_CONFIG = {
  // User IDs (update these with actual IDs from your database)
  USERS: {
    CUSTOMER_ID: "test-customer-001",
    SELLER_ID: "test-seller-001",
    ADMIN_ID: "test-admin-001",
    BIDDER_ID: "test-bidder-001",
  },

  // Shop IDs
  SHOPS: {
    TEST_SHOP_ID: "test-shop-001",
    FEATURED_SHOP_ID: "test-shop-002",
  },

  // Product IDs (can be null to use dynamic selection)
  PRODUCTS: {
    TEST_PRODUCT_ID: null as string | null,
    VARIANT_PRODUCT_ID: null as string | null,
  },

  // Auction IDs
  AUCTIONS: {
    LIVE_AUCTION_ID: null as string | null,
    ENDING_SOON_ID: null as string | null,
  },

  // Category IDs
  CATEGORIES: {
    ELECTRONICS_ID: "cat-electronics",
    FASHION_ID: "cat-fashion",
    HOME_ID: "cat-home",
    PARENT_CATEGORY_ID: "cat-parent-test",
    CHILD_CATEGORY_ID: "cat-child-test",
  },

  // Brand IDs
  BRANDS: {
    TEST_BRAND_ID: "brand-test-001",
    FEATURED_BRAND_ID: "brand-featured-001",
  },

  // Coupon Codes
  COUPONS: {
    TEST_COUPON_CODE: "TEST10",
    SELLER_COUPON_CODE: "SELLER20",
  },

  // Order IDs (can be null for dynamic selection)
  ORDERS: {
    TEST_ORDER_ID: null as string | null,
  },

  // Ticket IDs
  TICKETS: {
    TEST_TICKET_ID: null as string | null,
  },

  // Review IDs
  REVIEWS: {
    TEST_REVIEW_ID: null as string | null,
  },

  // Test Data
  TEST_DATA: {
    CUSTOMER_EMAIL: "testcustomer@example.com",
    CUSTOMER_PHONE: "+919876543210",
    SHIPPING_ADDRESS: {
      name: "Test Customer",
      phone: "+919876543210",
      line1: "123 Test Street",
      line2: "Apt 4B",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400001",
      country: "India",
    },
    MINIMUM_BID_INCREMENT: 100,
    DEFAULT_QUANTITY: 1,
  },

  // API Configuration
  API: {
    BASE_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
    TIMEOUT: 30000, // 30 seconds
  },

  // Workflow Options
  WORKFLOW_OPTIONS: {
    PAUSE_BETWEEN_STEPS: 500, // ms
    LOG_VERBOSE: true,
    CONTINUE_ON_ERROR: false,
    SKIP_OPTIONAL_STEPS: false,
    // Authentication behavior
    REQUIRE_AUTH: false, // Set to true to fail on auth-required steps
    SKIP_AUTH_STEPS: true, // Set to false to attempt auth-required steps
    // Public API testing
    TEST_PUBLIC_APIS: true, // Test public endpoints without auth
    TEST_PROTECTED_APIS: false, // Test protected endpoints (requires auth)
  },

  // API Access Levels (for documentation)
  API_ACCESS: {
    PUBLIC: [
      "/api/products (GET with status=published)",
      "/api/shops (GET with verified=true)",
      "/api/categories (GET)",
      "/api/blog (GET with status=published)",
      "/api/auctions (GET with status=active)",
    ],
    AUTHENTICATED: [
      "/api/cart (all methods)",
      "/api/orders (all methods)",
      "/api/user/profile (all methods)",
      "/api/user/addresses (all methods)",
      "/api/support/tickets (all methods)",
    ],
    SELLER: [
      "/api/seller/products (all methods)",
      "/api/seller/orders (all methods)",
      "/api/seller/shop (all methods)",
    ],
    ADMIN: ["/api/admin/* (all routes)", "/api/test-data/* (all routes)"],
  },

  // Field Names (for form validation and consistency)
  FIELD_NAMES: {
    // Product fields
    PRODUCT_NAME: "name",
    PRODUCT_SLUG: "slug",
    PRODUCT_PRICE: "price",
    PRODUCT_STOCK: "stock",
    PRODUCT_DESCRIPTION: "description",
    PRODUCT_CATEGORY: "categoryId",
    PRODUCT_BRAND: "brandId",
    PRODUCT_SKU: "sku",
    PRODUCT_WEIGHT: "weight",
    PRODUCT_STATUS: "status",
    PRODUCT_CONDITION: "condition",

    // Category fields
    CATEGORY_NAME: "name",
    CATEGORY_SLUG: "slug",
    CATEGORY_DESCRIPTION: "description",
    CATEGORY_PARENT: "parentId",
    CATEGORY_ORDER: "displayOrder",
    CATEGORY_STATUS: "status",
    CATEGORY_IMAGE: "imageUrl",

    // Shop fields
    SHOP_NAME: "name",
    SHOP_SLUG: "slug",
    SHOP_DESCRIPTION: "description",
    SHOP_OWNER: "ownerId",
    SHOP_STATUS: "status",
    SHOP_PHONE: "phone",
    SHOP_EMAIL: "email",

    // Order fields
    ORDER_STATUS: "status",
    ORDER_ITEMS: "items",
    ORDER_TOTAL: "totalAmount",
    ORDER_SHIPPING: "shippingAddress",
    ORDER_PAYMENT: "paymentMethod",

    // Auction fields
    AUCTION_TITLE: "title",
    AUCTION_START_PRICE: "startPrice",
    AUCTION_RESERVE_PRICE: "reservePrice",
    AUCTION_START_TIME: "startTime",
    AUCTION_END_TIME: "endTime",
    AUCTION_STATUS: "status",

    // User fields
    USER_EMAIL: "email",
    USER_NAME: "name",
    USER_PHONE: "phone",
    USER_ROLE: "role",
  },

  // Status Values (for consistency across workflows)
  STATUS_VALUES: {
    PRODUCT: {
      DRAFT: "draft",
      ACTIVE: "active",
      INACTIVE: "inactive",
      OUT_OF_STOCK: "out_of_stock",
    },
    CATEGORY: {
      ACTIVE: "active",
      INACTIVE: "inactive",
    },
    ORDER: {
      PENDING: "pending",
      CONFIRMED: "confirmed",
      PROCESSING: "processing",
      SHIPPED: "shipped",
      DELIVERED: "delivered",
      CANCELLED: "cancelled",
    },
    AUCTION: {
      DRAFT: "draft",
      SCHEDULED: "scheduled",
      ACTIVE: "active",
      ENDED: "ended",
      CANCELLED: "cancelled",
    },
    TICKET: {
      OPEN: "open",
      IN_PROGRESS: "in_progress",
      RESOLVED: "resolved",
      CLOSED: "closed",
    },
  },
};

/**
 * Update configuration at runtime
 */
export function updateTestConfig(updates: Partial<typeof TEST_CONFIG>) {
  Object.assign(TEST_CONFIG, updates);
}

/**
 * Validate configuration before running tests
 */
export function validateTestConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check required user IDs
  if (!TEST_CONFIG.USERS.CUSTOMER_ID) {
    errors.push("CUSTOMER_ID is required");
  }

  // Warnings for optional IDs
  if (!TEST_CONFIG.SHOPS.TEST_SHOP_ID) {
    console.warn("⚠️  TEST_SHOP_ID not set, will use dynamic selection");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get a safe user ID (with fallback)
 */
export function getSafeUserId(role: keyof typeof TEST_CONFIG.USERS): string {
  const id = TEST_CONFIG.USERS[role];
  if (!id) {
    throw new Error(`${role} ID not configured in TEST_CONFIG`);
  }
  return id;
}

/**
 * Get a safe shop ID (with fallback to first available)
 */
export function getSafeShopId(
  shopKey?: keyof typeof TEST_CONFIG.SHOPS
): string | null {
  if (shopKey) {
    return TEST_CONFIG.SHOPS[shopKey];
  }
  return TEST_CONFIG.SHOPS.TEST_SHOP_ID;
}
