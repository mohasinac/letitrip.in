/**
 * Bulk Action API Integration Tests
 * Tests all bulk endpoints with real Firebase data
 *
 * Usage: npm run test:bulk-actions
 */

import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import fetch from "node-fetch";

// Initialize Firebase Admin if not already initialized
if (!getApps().length) {
  const serviceAccount = require("../firebase-service-account.json");
  initializeApp({
    credential: cert(serviceAccount),
  });
}

const db = getFirestore();
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// Test results tracking
const results = {
  passed: 0,
  failed: 0,
  skipped: 0,
  tests: [],
};

// ANSI colors
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, colors.green);
}

function logError(message) {
  log(`❌ ${message}`, colors.red);
}

function logWarning(message) {
  log(`⚠️  ${message}`, colors.yellow);
}

function logInfo(message) {
  log(`ℹ️  ${message}`, colors.cyan);
}

function logSection(message) {
  log(`\n${"=".repeat(70)}`, colors.blue);
  log(message, colors.blue);
  log("=".repeat(70), colors.blue);
}

// Test data store
const testData = {
  categories: [],
  users: [],
  products: [],
  auctions: [],
  shops: [],
};

/**
 * Create test categories
 */
async function createTestCategories(count = 3) {
  logInfo(`Creating ${count} test categories...`);
  const ids = [];

  for (let i = 0; i < count; i++) {
    const id = `test-category-${Date.now()}-${i}`;
    await db
      .collection("categories")
      .doc(id)
      .set({
        name: `TEST Category ${i + 1}`,
        slug: `test-category-${Date.now()}-${i}`,
        description: "Test category for bulk action testing",
        is_active: true,
        is_featured: false,
        show_on_homepage: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    ids.push(id);
  }

  testData.categories = ids;
  logSuccess(`Created ${count} test categories`);
  return ids;
}

/**
 * Create test users
 */
async function createTestUsers(count = 3) {
  logInfo(`Creating ${count} test users...`);
  const ids = [];

  for (let i = 0; i < count; i++) {
    const id = `test-user-${Date.now()}-${i}`;
    await db
      .collection("users")
      .doc(id)
      .set({
        name: `TEST User ${i + 1}`,
        email: `test-user-${Date.now()}-${i}@test.com`,
        role: "user",
        is_banned: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    ids.push(id);
  }

  testData.users = ids;
  logSuccess(`Created ${count} test users`);
  return ids;
}

/**
 * Create test shop for products/auctions
 */
async function createTestShop() {
  logInfo("Creating test shop...");
  const id = `test-shop-${Date.now()}`;

  await db
    .collection("shops")
    .doc(id)
    .set({
      name: "TEST Shop",
      slug: `test-shop-${Date.now()}`,
      description: "Test shop for bulk action testing",
      seller_id: "test-seller",
      is_verified: true,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

  testData.shops.push(id);
  logSuccess("Created test shop");
  return id;
}

/**
 * Create test products
 */
async function createTestProducts(shopId, count = 3) {
  logInfo(`Creating ${count} test products...`);
  const ids = [];

  for (let i = 0; i < count; i++) {
    const id = `test-product-${Date.now()}-${i}`;
    await db
      .collection("products")
      .doc(id)
      .set({
        name: `TEST Product ${i + 1}`,
        slug: `test-product-${Date.now()}-${i}`,
        sku: `TEST-SKU-${Date.now()}-${i}`,
        description: "Test product for bulk action testing",
        price: 1000 + i * 100,
        stock_count: 10,
        category_id: "test-category",
        shop_id: shopId,
        seller_id: "test-seller",
        status: "draft",
        is_featured: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    ids.push(id);
  }

  testData.products = ids;
  logSuccess(`Created ${count} test products`);
  return ids;
}

/**
 * Create test auctions
 */
async function createTestAuctions(shopId, count = 3) {
  logInfo(`Creating ${count} test auctions...`);
  const ids = [];
  const now = new Date();
  const startTime = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Tomorrow
  const endTime = new Date(startTime.getTime() + 7 * 24 * 60 * 60 * 1000); // +7 days

  for (let i = 0; i < count; i++) {
    const id = `test-auction-${Date.now()}-${i}`;
    await db
      .collection("auctions")
      .doc(id)
      .set({
        name: `TEST Auction ${i + 1}`,
        slug: `test-auction-${Date.now()}-${i}`,
        description: "Test auction for bulk action testing",
        starting_bid: 500 + i * 50,
        current_bid: 0,
        bid_count: 0,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        category_id: "test-category",
        shop_id: shopId,
        seller_id: "test-seller",
        status: "draft",
        is_featured: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    ids.push(id);
  }

  testData.auctions = ids;
  logSuccess(`Created ${count} test auctions`);
  return ids;
}

/**
 * Test a bulk action
 */
async function testBulkAction(config) {
  const {
    name,
    endpoint,
    action,
    ids,
    data,
    expectedSuccess = true,
    validateResult,
  } = config;

  try {
    logInfo(`Testing: ${name}`);

    const body = {
      action,
      ids,
      ...(data && { data }),
    };

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const responseData = await response.json();
    const isSuccess = response.status === 200;

    if (isSuccess === expectedSuccess) {
      logSuccess(`${name} - Status ${response.status}`);

      if (responseData.results) {
        logInfo(
          `  Success: ${responseData.results.success}, Failed: ${responseData.results.failed}`
        );
      }

      // Custom validation
      if (validateResult) {
        const valid = await validateResult(responseData, ids);
        if (valid) {
          logSuccess(`  Validation passed`);
        } else {
          logError(`  Validation failed`);
          results.failed++;
          return { success: false };
        }
      }

      results.passed++;
      results.tests.push({ name, status: "PASSED", response: responseData });
      return { success: true, data: responseData };
    } else {
      logError(`${name} - Unexpected result`);
      logError(`  Response: ${JSON.stringify(responseData, null, 2)}`);
      results.failed++;
      results.tests.push({ name, status: "FAILED", response: responseData });
      return { success: false, data: responseData };
    }
  } catch (error) {
    logError(`${name} - Error: ${error.message}`);
    results.failed++;
    results.tests.push({ name, status: "FAILED", error: error.message });
    return { success: false, error: error.message };
  }
}

/**
 * Verify database changes
 */
async function verifyDatabaseChanges(collection, ids, expectedChanges) {
  try {
    const snapshot = await db
      .collection(collection)
      .where("__name__", "in", ids)
      .get();

    for (const doc of snapshot.docs) {
      const data = doc.data();
      for (const [key, expectedValue] of Object.entries(expectedChanges)) {
        if (data[key] !== expectedValue) {
          logError(
            `  Database verification failed for ${doc.id}: ${key} = ${data[key]}, expected ${expectedValue}`
          );
          return false;
        }
      }
    }

    return true;
  } catch (error) {
    logError(`  Database verification error: ${error.message}`);
    return false;
  }
}

/**
 * Test Category Bulk Actions
 */
async function testCategoryBulkActions() {
  logSection("Testing Category Bulk Actions (5 actions)");

  const categoryIds = await createTestCategories(3);

  // Test 1: Activate
  await testBulkAction({
    name: "Categories: Activate",
    endpoint: "/api/admin/categories/bulk",
    action: "activate",
    ids: categoryIds,
    validateResult: async () =>
      verifyDatabaseChanges("categories", categoryIds, { is_active: true }),
  });

  // Test 2: Deactivate
  await testBulkAction({
    name: "Categories: Deactivate",
    endpoint: "/api/admin/categories/bulk",
    action: "deactivate",
    ids: categoryIds,
    validateResult: async () =>
      verifyDatabaseChanges("categories", categoryIds, { is_active: false }),
  });

  // Test 3: Feature
  await testBulkAction({
    name: "Categories: Feature",
    endpoint: "/api/admin/categories/bulk",
    action: "feature",
    ids: categoryIds,
    validateResult: async () =>
      verifyDatabaseChanges("categories", categoryIds, { is_featured: true }),
  });

  // Test 4: Unfeature
  await testBulkAction({
    name: "Categories: Unfeature",
    endpoint: "/api/admin/categories/bulk",
    action: "unfeature",
    ids: categoryIds,
    validateResult: async () =>
      verifyDatabaseChanges("categories", categoryIds, { is_featured: false }),
  });

  // Test 5: Delete (should work as no products/children)
  await testBulkAction({
    name: "Categories: Delete",
    endpoint: "/api/admin/categories/bulk",
    action: "delete",
    ids: categoryIds,
  });
}

/**
 * Test User Bulk Actions
 */
async function testUserBulkActions() {
  logSection("Testing User Bulk Actions (4 actions)");

  const userIds = await createTestUsers(3);

  // Test 1: Make Seller
  await testBulkAction({
    name: "Users: Make Seller",
    endpoint: "/api/admin/users/bulk",
    action: "make-seller",
    ids: userIds,
    validateResult: async () =>
      verifyDatabaseChanges("users", userIds, { role: "seller" }),
  });

  // Test 2: Make User
  await testBulkAction({
    name: "Users: Make User",
    endpoint: "/api/admin/users/bulk",
    action: "make-user",
    ids: userIds,
    validateResult: async () =>
      verifyDatabaseChanges("users", userIds, { role: "user" }),
  });

  // Test 3: Ban
  await testBulkAction({
    name: "Users: Ban",
    endpoint: "/api/admin/users/bulk",
    action: "ban",
    ids: userIds,
    validateResult: async () =>
      verifyDatabaseChanges("users", userIds, { is_banned: true }),
  });

  // Test 4: Unban
  await testBulkAction({
    name: "Users: Unban",
    endpoint: "/api/admin/users/bulk",
    action: "unban",
    ids: userIds,
    validateResult: async () =>
      verifyDatabaseChanges("users", userIds, { is_banned: false }),
  });
}

/**
 * Test Product Bulk Actions
 */
async function testProductBulkActions() {
  logSection("Testing Product Bulk Actions (5 actions)");

  const shopId = await createTestShop();
  const productIds = await createTestProducts(shopId, 3);

  // Test 1: Publish
  await testBulkAction({
    name: "Products: Publish",
    endpoint: "/api/seller/products/bulk",
    action: "publish",
    ids: productIds,
    validateResult: async () =>
      verifyDatabaseChanges("products", productIds, { status: "published" }),
  });

  // Test 2: Draft
  await testBulkAction({
    name: "Products: Draft",
    endpoint: "/api/seller/products/bulk",
    action: "draft",
    ids: productIds,
    validateResult: async () =>
      verifyDatabaseChanges("products", productIds, { status: "draft" }),
  });

  // Test 3: Archive
  await testBulkAction({
    name: "Products: Archive",
    endpoint: "/api/seller/products/bulk",
    action: "archive",
    ids: productIds,
    validateResult: async () =>
      verifyDatabaseChanges("products", productIds, { status: "archived" }),
  });

  // Test 4: Update Stock
  await testBulkAction({
    name: "Products: Update Stock",
    endpoint: "/api/seller/products/bulk",
    action: "update-stock",
    ids: productIds,
    data: { stockCount: 50 },
    validateResult: async () =>
      verifyDatabaseChanges("products", productIds, { stock_count: 50 }),
  });

  // Test 5: Delete
  await testBulkAction({
    name: "Products: Delete",
    endpoint: "/api/seller/products/bulk",
    action: "delete",
    ids: productIds,
  });
}

/**
 * Test Auction Bulk Actions
 */
async function testAuctionBulkActions() {
  logSection("Testing Auction Bulk Actions (4 actions)");

  const shopId = testData.shops[0] || (await createTestShop());
  const auctionIds = await createTestAuctions(shopId, 3);

  // Test 1: Schedule
  await testBulkAction({
    name: "Auctions: Schedule",
    endpoint: "/api/seller/auctions/bulk",
    action: "schedule",
    ids: auctionIds,
    validateResult: async () =>
      verifyDatabaseChanges("auctions", auctionIds, { status: "scheduled" }),
  });

  // Test 2: Cancel
  await testBulkAction({
    name: "Auctions: Cancel",
    endpoint: "/api/seller/auctions/bulk",
    action: "cancel",
    ids: auctionIds,
    validateResult: async () =>
      verifyDatabaseChanges("auctions", auctionIds, { status: "cancelled" }),
  });

  // Test 3: End (will fail as auctions are cancelled, not live)
  logInfo("Note: End action expected to fail (wrong status)");
  await testBulkAction({
    name: "Auctions: End",
    endpoint: "/api/seller/auctions/bulk",
    action: "end",
    ids: auctionIds,
    expectedSuccess: true, // API succeeds but items fail validation
  });

  // Test 4: Delete
  await testBulkAction({
    name: "Auctions: Delete",
    endpoint: "/api/seller/auctions/bulk",
    action: "delete",
    ids: auctionIds,
  });
}

/**
 * Cleanup all test data
 */
async function cleanupTestData() {
  logSection("Cleaning Up Test Data");

  let cleaned = 0;

  for (const [collection, ids] of Object.entries(testData)) {
    if (ids.length > 0) {
      logInfo(`Cleaning ${ids.length} test ${collection}...`);

      for (const id of ids) {
        try {
          await db.collection(collection).doc(id).delete();
          cleaned++;
        } catch (error) {
          logWarning(`Failed to delete ${collection}/${id}: ${error.message}`);
        }
      }
    }
  }

  logSuccess(`Cleaned up ${cleaned} test records`);
}

/**
 * Print test summary
 */
function printSummary() {
  logSection("Test Summary");

  const total = results.passed + results.failed + results.skipped;
  const passRate = total > 0 ? ((results.passed / total) * 100).toFixed(1) : 0;

  log(`\nTotal Tests: ${total}`);
  logSuccess(`Passed: ${results.passed}`);
  logError(`Failed: ${results.failed}`);
  logWarning(`Skipped: ${results.skipped}`);
  log(`Pass Rate: ${passRate}%\n`);

  if (results.failed > 0) {
    logError("Failed Tests:");
    results.tests
      .filter((t) => t.status === "FAILED")
      .forEach((t) => {
        logError(`  - ${t.name}`);
      });
  }

  // Save results
  const fs = require("fs");
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `logs/bulk-action-tests-${timestamp}.json`;

  try {
    fs.mkdirSync("logs", { recursive: true });
    fs.writeFileSync(filename, JSON.stringify(results, null, 2));
    logInfo(`\nDetailed results saved to: ${filename}`);
  } catch (error) {
    logWarning(`Failed to save results: ${error.message}`);
  }
}

/**
 * Main test runner
 */
async function runTests() {
  log(
    "\n╔════════════════════════════════════════════════════════════════╗",
    colors.cyan
  );
  log(
    "║     Bulk Action API Integration Test Suite                    ║",
    colors.cyan
  );
  log(
    "╚════════════════════════════════════════════════════════════════╝",
    colors.cyan
  );

  logInfo(`\nBase URL: ${BASE_URL}`);
  logInfo(`Started: ${new Date().toISOString()}\n`);

  try {
    // Run all test suites
    await testCategoryBulkActions();
    await testUserBulkActions();
    await testProductBulkActions();
    await testAuctionBulkActions();

    // Cleanup
    await cleanupTestData();

    // Print summary
    printSummary();

    // Exit with appropriate code
    process.exit(results.failed > 0 ? 1 : 0);
  } catch (error) {
    logError(`\nFatal error: ${error.message}`);
    console.error(error);

    // Try to cleanup on error
    await cleanupTestData();

    process.exit(1);
  }
}

// Run tests
runTests();
