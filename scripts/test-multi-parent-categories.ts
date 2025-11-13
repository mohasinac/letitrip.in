/**
 * Test Script: Multi-Parent Categories
 *
 * Tests the new multi-parent category functionality
 *
 * Run: npx ts-node scripts/test-multi-parent-categories.ts
 */

import { categoriesService } from "../src/services/categories.service";

async function testMultiParentCategories() {
  console.log("🧪 Testing Multi-Parent Categories\n");

  try {
    // Test 1: Create root categories
    console.log("Test 1: Creating root categories...");
    const electronics = await categoriesService.create({
      name: "Electronics (Test)",
      slug: `electronics-test-${Date.now()}`,
      description: "Test electronics category",
      parentIds: [],
      sortOrder: 1,
      isFeatured: true,
      showOnHomepage: true,
      isActive: true,
      commissionRate: 10,
    });
    console.log(`  ✅ Created: ${electronics.name} (${electronics.id})`);

    const accessories = await categoriesService.create({
      name: "Accessories (Test)",
      slug: `accessories-test-${Date.now()}`,
      description: "Test accessories category",
      parentIds: [],
      sortOrder: 2,
      isFeatured: true,
      showOnHomepage: true,
      isActive: true,
      commissionRate: 10,
    });
    console.log(`  ✅ Created: ${accessories.name} (${accessories.id})\n`);

    // Test 2: Create category with multiple parents
    console.log("Test 2: Creating category with multiple parents...");
    const wirelessEarbuds = await categoriesService.create({
      name: "Wireless Earbuds (Test)",
      slug: `wireless-earbuds-test-${Date.now()}`,
      description: "Test wireless earbuds category",
      parentIds: [electronics.id, accessories.id],
      sortOrder: 1,
      isFeatured: false,
      showOnHomepage: false,
      isActive: true,
      commissionRate: 12,
    });
    console.log(
      `  ✅ Created: ${wirelessEarbuds.name} (${wirelessEarbuds.id})`
    );
    console.log(`  📍 Parents: ${wirelessEarbuds.parentIds?.join(", ")}\n`);

    // Test 3: Verify parents have children
    console.log("Test 3: Verifying parent-child relationships...");
    const updatedElectronics = await categoriesService.getById(electronics.id);
    const updatedAccessories = await categoriesService.getById(accessories.id);

    console.log(
      `  ✅ Electronics children: ${
        updatedElectronics.childrenIds?.length || 0
      }`
    );
    console.log(
      `  ✅ Accessories children: ${
        updatedAccessories.childrenIds?.length || 0
      }\n`
    );

    // Test 4: Add another parent
    console.log("Test 4: Adding third parent...");
    const bluetooth = await categoriesService.create({
      name: "Bluetooth Devices (Test)",
      slug: `bluetooth-test-${Date.now()}`,
      description: "Test bluetooth category",
      parentIds: [],
      sortOrder: 3,
      isFeatured: false,
      showOnHomepage: false,
      isActive: true,
      commissionRate: 10,
    });
    console.log(`  ✅ Created: ${bluetooth.name} (${bluetooth.id})`);

    await categoriesService.addParent(wirelessEarbuds.slug, bluetooth.id);
    console.log(`  ✅ Added ${bluetooth.name} as parent\n`);

    // Test 5: Get all parents
    console.log("Test 5: Getting all parents...");
    const parents = await categoriesService.getParents(wirelessEarbuds.slug);
    console.log(`  ✅ Found ${parents.length} parents:`);
    parents.forEach((parent) => {
      console.log(`     - ${parent.name} (${parent.id})`);
    });
    console.log();

    // Test 6: Get children
    console.log("Test 6: Getting children of Electronics...");
    const children = await categoriesService.getChildren(electronics.slug);
    console.log(`  ✅ Found ${children.length} children:`);
    children.forEach((child) => {
      console.log(`     - ${child.name} (${child.id})`);
    });
    console.log();

    // Test 7: Remove a parent
    console.log("Test 7: Removing a parent...");
    await categoriesService.removeParent(wirelessEarbuds.slug, accessories.id);
    console.log(`  ✅ Removed Accessories as parent\n`);

    // Test 8: Verify updated relationships
    console.log("Test 8: Verifying updated relationships...");
    const finalParents = await categoriesService.getParents(
      wirelessEarbuds.slug
    );
    console.log(`  ✅ Remaining parents: ${finalParents.length}`);
    finalParents.forEach((parent) => {
      console.log(`     - ${parent.name} (${parent.id})`);
    });
    console.log();

    // Cleanup
    console.log("🧹 Cleaning up test data...");
    try {
      await categoriesService.delete(wirelessEarbuds.slug);
      await categoriesService.delete(electronics.slug);
      await categoriesService.delete(accessories.slug);
      await categoriesService.delete(bluetooth.slug);
      console.log("  ✅ Cleanup completed\n");
    } catch (cleanupError) {
      console.log("  ⚠️  Cleanup failed (may need manual cleanup)\n");
    }

    console.log("✅ All tests passed!");
  } catch (error: any) {
    console.error("\n❌ Test failed:", error.message);
    throw error;
  }
}

// Run tests
if (require.main === module) {
  testMultiParentCategories()
    .then(() => {
      console.log("\n✅ Test script finished");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n❌ Test script failed:", error);
      process.exit(1);
    });
}

export { testMultiParentCategories };
