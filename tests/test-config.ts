/**
 * Test Configuration and Constants
 *
 * Central place for all test configuration values.
 * Update these constants based on your test environment.
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
