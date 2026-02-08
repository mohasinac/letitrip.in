/**
 * FAQ Seeding Script
 *
 * Seeds 102 FAQs across 7 categories to Firebase Firestore
 *
 * Usage:
 *   npm run seed:faqs
 *
 * Requirements:
 *   - Firebase Admin SDK configured
 *   - FIREBASE_ADMIN_KEY environment variable set
 */

import { FAQ_SEED_DATA } from "./seed-data/faq-seed-data";
import { getAdminDb } from "@/lib/firebase/admin";
import { FAQS_COLLECTION } from "@/db/schema/faqs";

async function seedFAQs() {
  console.log("🌱 Starting FAQ seeding process...\n");

  try {
    const db = getAdminDb();
    const faqCollection = db.collection(FAQS_COLLECTION);

    // Category counters
    const categoryCount: Record<string, number> = {};

    // Batch writes for efficiency (max 500 operations per batch)
    const batchSize = 500;
    let batch = db.batch();
    let operationCount = 0;

    for (const faq of FAQ_SEED_DATA) {
      // Generate unique ID: category-order-timestamp-random
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 8);
      const docId = `${faq.category}-${faq.order}-${timestamp}-${random}`;

      const docRef = faqCollection.doc(docId);

      // Prepare document data with timestamps and convert answer to FAQAnswer object
      const docData = {
        ...faq,
        answer: {
          text: faq.answer,
          format: "plain" as const,
        },
        id: docId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      batch.set(docRef, docData);
      operationCount++;

      // Track category count
      categoryCount[faq.category] = (categoryCount[faq.category] || 0) + 1;

      // Commit batch if we reach batch size
      if (operationCount >= batchSize) {
        await batch.commit();
        console.log(`✅ Committed batch of ${operationCount} FAQs`);
        batch = db.batch();
        operationCount = 0;
      }
    }

    // Commit remaining operations
    if (operationCount > 0) {
      await batch.commit();
      console.log(`✅ Committed final batch of ${operationCount} FAQs`);
    }

    // Summary
    console.log("\n🎉 FAQ seeding completed successfully!\n");
    console.log("📊 Summary by category:");
    console.log("─────────────────────────────────────");

    const categories = Object.keys(categoryCount).sort();
    let total = 0;

    for (const category of categories) {
      const count = categoryCount[category];
      total += count;
      console.log(`  ${category.padEnd(15)} : ${count} FAQs`);
    }

    console.log("─────────────────────────────────────");
    console.log(`  ${"TOTAL".padEnd(15)} : ${total} FAQs\n`);
  } catch (error) {
    console.error("❌ Error seeding FAQs:", error);
    process.exit(1);
  }
}

// Run the seeding script
seedFAQs()
  .then(() => {
    console.log("✨ Seeding script finished successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Fatal error:", error);
    process.exit(1);
  });
