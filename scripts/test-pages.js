/**
 * Test script for validating public pages functionality
 * Run with: node scripts/test-pages.js
 */

const axios = require("axios");

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

// Colors for console output
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(name, passed) {
  const symbol = passed ? "✓" : "✗";
  const color = passed ? "green" : "red";
  log(`  ${symbol} ${name}`, color);
}

// Test Results Tracker
const results = {
  total: 0,
  passed: 0,
  failed: 0,
};

function recordTest(passed) {
  results.total++;
  if (passed) results.passed++;
  else results.failed++;
}

// Test Products Page
async function testProductsPage() {
  log("\n📦 Testing Products Page...", "blue");

  try {
    // Test filters
    const response = await axios.get(`${BASE_URL}/api/products`, {
      params: {
        page: 1,
        limit: 10,
        minPrice: 100,
        maxPrice: 1000,
        minRating: 4,
        inStock: true,
      },
    });

    const passed = response.status === 200 && response.data.success;
    logTest("Products API with filters", passed);
    recordTest(passed);

    // Test pagination
    const page2 = await axios.get(`${BASE_URL}/api/products?page=2&limit=10`);
    const paginationWorks =
      page2.status === 200 && page2.data.pagination.page === 2;
    logTest("Pagination", paginationWorks);
    recordTest(paginationWorks);

    // Test search
    const searchResults = await axios.get(
      `${BASE_URL}/api/products?search=test`,
    );
    const searchWorks = searchResults.status === 200;
    logTest("Search functionality", searchWorks);
    recordTest(searchWorks);
  } catch (error) {
    log(`  Error: ${error.message}`, "red");
    recordTest(false);
  }
}

// Test Product Detail Page
async function testProductDetail() {
  log("\n🔍 Testing Product Detail...", "blue");

  try {
    // Get first product
    const productsRes = await axios.get(`${BASE_URL}/api/products?limit=1`);
    if (!productsRes.data.products || productsRes.data.products.length === 0) {
      log("  No products found to test", "yellow");
      return;
    }

    const product = productsRes.data.products[0];

    // Test product detail
    const detailRes = await axios.get(
      `${BASE_URL}/api/products/${product.slug}`,
    );
    const detailWorks = detailRes.status === 200 && detailRes.data.success;
    logTest("Product detail API", detailWorks);
    recordTest(detailWorks);

    // Test variants
    const variantsRes = await axios.get(
      `${BASE_URL}/api/products/${product.slug}/variants`,
    );
    const variantsWork = variantsRes.status === 200;
    logTest("Product variants API", variantsWork);
    recordTest(variantsWork);

    // Test similar products
    const similarRes = await axios.get(
      `${BASE_URL}/api/products/${product.slug}/similar`,
    );
    const similarWorks = similarRes.status === 200;
    logTest("Similar products API", similarWorks);
    recordTest(similarWorks);

    // Test seller items
    const sellerRes = await axios.get(
      `${BASE_URL}/api/products/${product.slug}/seller-items`,
    );
    const sellerWorks = sellerRes.status === 200;
    logTest("Seller items API", sellerWorks);
    recordTest(sellerWorks);
  } catch (error) {
    log(`  Error: ${error.message}`, "red");
    recordTest(false);
  }
}

// Test Shops Page
async function testShopsPage() {
  log("\n🏪 Testing Shops Page...", "blue");

  try {
    // Test shops listing
    const response = await axios.get(`${BASE_URL}/api/shops`, {
      params: {
        page: 1,
        limit: 10,
        minRating: 4,
        verified: true,
      },
    });

    const passed = response.status === 200 && response.data.success;
    logTest("Shops listing API with filters", passed);
    recordTest(passed);

    // Test search
    const searchRes = await axios.get(`${BASE_URL}/api/shops?search=test`);
    const searchWorks = searchRes.status === 200;
    logTest("Shop search", searchWorks);
    recordTest(searchWorks);
  } catch (error) {
    log(`  Error: ${error.message}`, "red");
    recordTest(false);
  }
}

// Test Shop Detail Page
async function testShopDetail() {
  log("\n🏬 Testing Shop Detail...", "blue");

  try {
    // Get first shop
    const shopsRes = await axios.get(`${BASE_URL}/api/shops?limit=1`);
    if (!shopsRes.data.shops || shopsRes.data.shops.length === 0) {
      log("  No shops found to test", "yellow");
      return;
    }

    const shop = shopsRes.data.shops[0];

    // Test shop detail
    const detailRes = await axios.get(`${BASE_URL}/api/shops/${shop.slug}`);
    const detailWorks = detailRes.status === 200 && detailRes.data.success;
    logTest("Shop detail API", detailWorks);
    recordTest(detailWorks);

    // Test shop products
    const productsRes = await axios.get(
      `${BASE_URL}/api/shops/${shop.slug}/products`,
    );
    const productsWork = productsRes.status === 200;
    logTest("Shop products API", productsWork);
    recordTest(productsWork);

    // Test shop reviews
    const reviewsRes = await axios.get(
      `${BASE_URL}/api/shops/${shop.slug}/reviews`,
    );
    const reviewsWork = reviewsRes.status === 200;
    logTest("Shop reviews API", reviewsWork);
    recordTest(reviewsWork);
  } catch (error) {
    log(`  Error: ${error.message}`, "red");
    recordTest(false);
  }
}

// Test Categories Page
async function testCategoriesPage() {
  log("\n📂 Testing Categories Page...", "blue");

  try {
    // Test categories listing
    const response = await axios.get(`${BASE_URL}/api/categories`);

    const passed = response.status === 200 && response.data.success;
    logTest("Categories listing API", passed);
    recordTest(passed);

    // Test category tree
    const treeRes = await axios.get(`${BASE_URL}/api/categories/tree`);
    const treeWorks = treeRes.status === 200;
    logTest("Category tree API", treeWorks);
    recordTest(treeWorks);
  } catch (error) {
    log(`  Error: ${error.message}`, "red");
    recordTest(false);
  }
}

// Test Category Detail Page
async function testCategoryDetail() {
  log("\n📁 Testing Category Detail...", "blue");

  try {
    // Get first category
    const categoriesRes = await axios.get(`${BASE_URL}/api/categories?limit=1`);
    if (
      !categoriesRes.data.categories ||
      categoriesRes.data.categories.length === 0
    ) {
      log("  No categories found to test", "yellow");
      return;
    }

    const category = categoriesRes.data.categories[0];

    // Test category products
    const productsRes = await axios.get(
      `${BASE_URL}/api/categories/${category.slug}/products`,
    );
    const productsWork = productsRes.status === 200;
    logTest("Category products API", productsWork);
    recordTest(productsWork);

    // Test subcategories
    const subsRes = await axios.get(
      `${BASE_URL}/api/categories/${category.slug}/subcategories`,
    );
    const subsWork = subsRes.status === 200;
    logTest("Subcategories API", subsWork);
    recordTest(subsWork);

    // Test similar categories
    const similarRes = await axios.get(
      `${BASE_URL}/api/categories/${category.slug}/similar`,
    );
    const similarWorks = similarRes.status === 200;
    logTest("Similar categories API", similarWorks);
    recordTest(similarWorks);

    // Test category hierarchy
    const hierarchyRes = await axios.get(
      `${BASE_URL}/api/categories/${category.slug}/hierarchy`,
    );
    const hierarchyWorks = hierarchyRes.status === 200;
    logTest("Category hierarchy API", hierarchyWorks);
    recordTest(hierarchyWorks);
  } catch (error) {
    log(`  Error: ${error.message}`, "red");
    recordTest(false);
  }
}

// Test Guest Cart
async function testGuestCart() {
  log("\n🛒 Testing Guest Cart...", "blue");

  try {
    // Test cart merge endpoint exists
    const mergeRes = await axios
      .post(`${BASE_URL}/api/cart/merge`, {
        guestCart: [{ productId: "test-id", quantity: 1 }],
      })
      .catch((err) => err.response);

    // Should return 401 without auth, which means endpoint exists
    const endpointExists =
      mergeRes && (mergeRes.status === 401 || mergeRes.status === 200);
    logTest("Cart merge endpoint exists", endpointExists);
    recordTest(endpointExists);

    log("  Note: Full guest cart flow requires browser testing", "yellow");
  } catch (error) {
    log(`  Error: ${error.message}`, "red");
    recordTest(false);
  }
}

// Test Auction Pages
async function testAuctionPages() {
  log("\n⚖️ Testing Auction Pages...", "blue");

  try {
    // Test auctions listing
    const response = await axios.get(`${BASE_URL}/api/auctions`, {
      params: {
        page: 1,
        limit: 10,
        status: "active",
      },
    });

    const passed = response.status === 200 && response.data.success;
    logTest("Auctions listing API", passed);
    recordTest(passed);

    // Test with filters
    const filteredRes = await axios.get(`${BASE_URL}/api/auctions`, {
      params: {
        minCurrentBid: 100,
        maxCurrentBid: 1000,
        featured: true,
      },
    });
    const filtersWork = filteredRes.status === 200;
    logTest("Auction filters", filtersWork);
    recordTest(filtersWork);
  } catch (error) {
    log(`  Error: ${error.message}`, "red");
    recordTest(false);
  }
}

// Main test runner
async function runAllTests() {
  log("\n╔════════════════════════════════════════╗", "blue");
  log("║   Public Pages Testing Suite          ║", "blue");
  log("╚════════════════════════════════════════╝", "blue");
  log(`\nTesting against: ${BASE_URL}\n`, "yellow");

  await testProductsPage();
  await testProductDetail();
  await testShopsPage();
  await testShopDetail();
  await testCategoriesPage();
  await testCategoryDetail();
  await testGuestCart();
  await testAuctionPages();

  // Print summary
  log("\n╔════════════════════════════════════════╗", "blue");
  log("║   Test Results Summary                 ║", "blue");
  log("╚════════════════════════════════════════╝", "blue");
  log(`\nTotal Tests: ${results.total}`, "blue");
  log(`Passed: ${results.passed}`, "green");
  log(`Failed: ${results.failed}`, "red");

  const percentage = ((results.passed / results.total) * 100).toFixed(1);
  log(
    `\nSuccess Rate: ${percentage}%\n`,
    percentage >= 80 ? "green" : "yellow",
  );

  process.exit(results.failed > 0 ? 1 : 0);
}

// Run tests
runAllTests().catch((error) => {
  log(`\n❌ Test suite failed: ${error.message}`, "red");
  process.exit(1);
});
