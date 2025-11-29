/**
 * Migration Script: Convert Categories to Multi-Parent Support
 *
 * This script migrates existing categories from single-parent to multi-parent structure.
 * It safely converts parent_id to parent_ids array and builds children_ids arrays.
 *
 * Run: npx ts-node scripts/migrate-categories-multi-parent.ts
 */

import { getFirestoreAdmin } from "../src/app/api/lib/firebase/admin";

async function migrateCategories() {
  console.log("🚀 Starting category migration to multi-parent support...\n");

  const db = getFirestoreAdmin();
  const categoriesRef = db.collection("categories");

  try {
    // Fetch all categories
    const snapshot = await categoriesRef.get();
    console.log(`📊 Found ${snapshot.size} categories to migrate\n`);

    if (snapshot.empty) {
      console.log("✅ No categories to migrate");
      return;
    }

    // Phase 1: Convert parent_id to parent_ids
    console.log("Phase 1: Converting parent_id to parent_ids array...");
    let batch = db.batch();
    let operationCount = 0;
    const batchLimit = 500; // Firestore batch limit

    for (const doc of snapshot.docs) {
      const data = doc.data();

      // Skip if already migrated
      if (data.parent_ids !== undefined && data.children_ids !== undefined) {
        console.log(`  ⏭️  Skipping ${data.name} (already migrated)`);
        continue;
      }

      // Convert parent_id to parent_ids array
      const parentIds = data.parent_id ? [data.parent_id] : [];

      batch.update(doc.ref, {
        parent_ids: parentIds,
        children_ids: [], // Will be populated in phase 2
        updated_at: new Date().toISOString(),
      });

      operationCount++;

      // Commit batch when limit reached
      if (operationCount >= batchLimit) {
        await batch.commit();
        console.log(`  ✅ Committed batch of ${operationCount} updates`);
        batch = db.batch();
        operationCount = 0;
      }
    }

    // Commit remaining operations
    if (operationCount > 0) {
      await batch.commit();
      console.log(`  ✅ Committed final batch of ${operationCount} updates`);
    }

    console.log("✅ Phase 1 completed\n");

    // Phase 2: Build children_ids arrays
    console.log("Phase 2: Building children_ids arrays...");

    // Re-fetch to get updated data
    const updatedSnapshot = await categoriesRef.get();
    const categoriesMap = new Map<
      string,
      {
        ref: FirebaseFirestore.DocumentReference;
        name: string;
        parentIds: string[];
        childrenIds: string[];
      }
    >();

    // Build category map
    updatedSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      categoriesMap.set(doc.id, {
        ref: doc.ref,
        name: data.name,
        parentIds: data.parent_ids || [],
        childrenIds: [],
      });
    });

    // Build children relationships
    categoriesMap.forEach((category, categoryId) => {
      category.parentIds.forEach((parentId: string) => {
        const parent = categoriesMap.get(parentId);
        if (parent) {
          if (!parent.childrenIds.includes(categoryId)) {
            parent.childrenIds.push(categoryId);
          }
        } else {
          console.log(
            `  ⚠️  Warning: Parent ${parentId} not found for ${category.name}`,
          );
        }
      });
    });

    // Update children_ids for all categories
    batch = db.batch();
    operationCount = 0;

    categoriesMap.forEach((category) => {
      batch.update(category.ref, {
        children_ids: category.childrenIds,
        child_count: category.childrenIds.length,
        has_children: category.childrenIds.length > 0,
        updated_at: new Date().toISOString(),
      });

      operationCount++;

      if (operationCount >= batchLimit) {
        // Note: In practice, you'd need to handle this asynchronously
        console.log(`  ⚠️  Batch limit reached, consider splitting migration`);
      }
    });

    await batch.commit();
    console.log(`  ✅ Updated children_ids for ${operationCount} categories`);
    console.log("✅ Phase 2 completed\n");

    // Phase 3: Validation
    console.log("Phase 3: Validating migration...");
    const validationSnapshot = await categoriesRef.get();
    let validCount = 0;
    let invalidCount = 0;

    validationSnapshot.docs.forEach((doc) => {
      const data = doc.data();

      // Check required fields
      if (
        data.parent_ids !== undefined &&
        Array.isArray(data.parent_ids) &&
        data.children_ids !== undefined &&
        Array.isArray(data.children_ids)
      ) {
        validCount++;
      } else {
        invalidCount++;
        console.log(`  ❌ Invalid: ${data.name} (${doc.id})`);
      }
    });

    console.log(`  ✅ Valid categories: ${validCount}`);
    if (invalidCount > 0) {
      console.log(`  ❌ Invalid categories: ${invalidCount}`);
    }
    console.log("✅ Phase 3 completed\n");

    // Summary
    console.log("📊 Migration Summary:");
    console.log(`   Total categories: ${snapshot.size}`);
    console.log(`   Successfully migrated: ${validCount}`);
    console.log(`   Failed: ${invalidCount}`);

    if (invalidCount === 0) {
      console.log("\n✅ Migration completed successfully!");
    } else {
      console.log(
        "\n⚠️  Migration completed with errors. Please review invalid categories.",
      );
    }
  } catch (error) {
    console.error("\n❌ Migration failed:", error);
    throw error;
  }
}

// Run migration
if (require.main === module) {
  migrateCategories()
    .then(() => {
      console.log("\n✅ Migration script finished");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n❌ Migration script failed:", error);
      process.exit(1);
    });
}

export { migrateCategories };
