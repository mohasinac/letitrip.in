/**
 * Seed All Data Script
 *
 * This script seeds all collections with sample data for development and testing.
 *
 * Usage:
 * npx ts-node scripts/seed-all-data.ts
 *
 * Or with specific collections only:
 * npx ts-node scripts/seed-all-data.ts --collections=users,products,categories
 *
 * Cache clearing (requires a running Next.js server + CACHE_REVALIDATION_SECRET):
 * npx ts-node scripts/seed-all-data.ts --clear-cache
 * npx ts-node scripts/seed-all-data.ts --server-url=http://localhost:3000 --clear-cache
 *
 * WARNING: This will overwrite existing data. Use with caution!
 */

import { getAdminDb, getAdminAuth } from "@/lib/firebase/admin";
import {
  usersSeedData,
  addressesSeedData,
  categoriesSeedData,
  productsSeedData,
  ordersSeedData,
  reviewsSeedData,
  bidsSeedData,
  couponsSeedData,
  carouselSlidesSeedData,
  homepageSectionsSeedData,
  siteSettingsSeedData,
  faqSeedData,
  blogPostsSeedData,
  eventsSeedData,
  eventEntriesSeedData,
  notificationsSeedData,
  payoutsSeedData,
  sessionsSeedData,
  cartsSeedData,
} from "@/db/seed-data";
import {
  USER_COLLECTION,
  CATEGORIES_COLLECTION,
  PRODUCT_COLLECTION,
  ORDER_COLLECTION,
  REVIEW_COLLECTION,
  BID_COLLECTION,
  COUPONS_COLLECTION,
  CAROUSEL_SLIDES_COLLECTION,
  HOMEPAGE_SECTIONS_COLLECTION,
  SITE_SETTINGS_COLLECTION,
  FAQS_COLLECTION,
  BLOG_POSTS_COLLECTION,
  EVENTS_COLLECTION,
  EVENT_ENTRIES_COLLECTION,
  NOTIFICATIONS_COLLECTION,
  PAYOUT_COLLECTION,
  SESSION_COLLECTION,
  CART_COLLECTION,
} from "@/db/schema";

interface SeedOptions {
  collections?: string[];
  dryRun?: boolean;
  verbose?: boolean;
  clearCache?: boolean;
  serverUrl?: string;
}

/**
 * Parse command line arguments
 */
function parseArgs(): SeedOptions {
  const args = process.argv.slice(2);
  const options: SeedOptions = {
    dryRun: false,
    verbose: false,
  };

  for (const arg of args) {
    if (arg.startsWith("--collections=")) {
      options.collections = arg.split("=")[1].split(",");
    } else if (arg === "--dry-run") {
      options.dryRun = true;
    } else if (arg === "--verbose" || arg === "-v") {
      options.verbose = true;
    } else if (arg === "--clear-cache") {
      options.clearCache = true;
    } else if (arg.startsWith("--server-url=")) {
      options.serverUrl = arg.split("=")[1];
    }
  }

  return options;
}

/**
 * Create Firebase Auth users with custom UIDs
 */
async function seedAuthUsers(options: SeedOptions) {
  console.log("\n📝 Seeding Auth Users...");
  const auth = getAdminAuth();
  let created = 0;
  let skipped = 0;
  let errors = 0;

  for (const userData of usersSeedData) {
    try {
      if (options.dryRun) {
        console.log(`  [DRY RUN] Would create auth user: ${userData.email}`);
        created++;
        continue;
      }

      // Check if user already exists
      try {
        await auth.getUser(userData.uid!);
        if (options.verbose) {
          console.log(`  ⏭️  User exists: ${userData.email}`);
        }
        skipped++;
        continue;
      } catch (error: any) {
        if (error.code !== "auth/user-not-found") {
          throw error;
        }
      }

      // Create auth user
      await auth.createUser({
        uid: userData.uid,
        email: userData.email || undefined,
        phoneNumber: userData.phoneNumber || undefined,
        displayName: userData.displayName || undefined,
        photoURL: userData.photoURL || undefined,
        emailVerified: userData.emailVerified || false,
        disabled: userData.disabled || false,
      });

      if (options.verbose) {
        console.log(`  ✅ Created auth user: ${userData.email}`);
      }
      created++;
    } catch (error: any) {
      console.error(
        `  ❌ Error creating user ${userData.email}:`,
        error.message,
      );
      errors++;
    }
  }

  console.log(
    `\n✅ Auth Users: ${created} created, ${skipped} skipped, ${errors} errors`,
  );
}

/**
 * Seed a Firestore collection
 */
async function seedCollection<T extends { id?: string }>(
  collectionName: string,
  data: T[],
  options: SeedOptions,
) {
  console.log(`\n📝 Seeding ${collectionName}...`);
  const db = getAdminDb();
  const collectionRef = db.collection(collectionName);
  let created = 0;
  let updated = 0;
  let errors = 0;

  for (const doc of data) {
    try {
      const docId = doc.id || db.collection(collectionName).doc().id;

      if (options.dryRun) {
        console.log(`  [DRY RUN] Would create/update: ${docId}`);
        created++;
        continue;
      }

      // Convert Date objects to Firestore Timestamps
      const processedDoc = convertDatesToTimestamps(doc);

      const docRef = collectionRef.doc(docId);
      const docSnapshot = await docRef.get();

      if (docSnapshot.exists) {
        await docRef.update(processedDoc);
        if (options.verbose) {
          console.log(`  🔄 Updated: ${docId}`);
        }
        updated++;
      } else {
        await docRef.set(processedDoc);
        if (options.verbose) {
          console.log(`  ✅ Created: ${docId}`);
        }
        created++;
      }
    } catch (error: any) {
      console.error(`  ❌ Error seeding document:`, error.message);
      errors++;
    }
  }

  console.log(
    `✅ ${collectionName}: ${created} created, ${updated} updated, ${errors} errors`,
  );
}

/**
 * Seed user addresses (subcollection)
 */
async function seedAddresses(options: SeedOptions) {
  console.log("\n📍 Seeding User Addresses...");
  const db = getAdminDb();
  let created = 0;
  let skipped = 0;
  let errors = 0;

  for (const address of addressesSeedData) {
    try {
      if (options.dryRun) {
        console.log(
          `  [DRY RUN] Would create address: ${address.label} for user ${address.userId}`,
        );
        created++;
        continue;
      }

      const { userId, ...addressData } = address;
      const addressRef = db
        .collection(USER_COLLECTION)
        .doc(userId)
        .collection("addresses")
        .doc(address.id);

      const docSnapshot = await addressRef.get();

      if (docSnapshot.exists) {
        if (options.verbose) {
          console.log(`  ⏭️  Address exists: ${address.label} (${address.id})`);
        }
        skipped++;
      } else {
        await addressRef.set(addressData);
        if (options.verbose) {
          console.log(`  ✅ Created address: ${address.label} (${address.id})`);
        }
        created++;
      }
    } catch (error: any) {
      console.error(`  ❌ Error seeding address ${address.id}:`, error.message);
      errors++;
    }
  }

  console.log(
    `\n📍 Addresses: ${created} created, ${skipped} skipped, ${errors} errors`,
  );
}

/**
 * Seed singleton document
 */
async function seedSingleton<T>(
  collectionName: string,
  docId: string,
  data: T,
  options: SeedOptions,
) {
  console.log(`\n📝 Seeding ${collectionName}/${docId}...`);
  const db = getAdminDb();
  const docRef = db.collection(collectionName).doc(docId);

  try {
    if (options.dryRun) {
      console.log(`  [DRY RUN] Would create/update singleton document`);
      return;
    }

    // Convert Date objects to Firestore Timestamps
    const processedData = convertDatesToTimestamps(data);

    const docSnapshot = await docRef.get();

    if (docSnapshot.exists) {
      await docRef.update(processedData);
      console.log(`  🔄 Updated singleton document`);
    } else {
      await docRef.set(processedData);
      console.log(`  ✅ Created singleton document`);
    }
  } catch (error: any) {
    console.error(`  ❌ Error seeding singleton:`, error.message);
  }
}

/**
 * Convert Date objects to Firestore Timestamps recursively
 */
function convertDatesToTimestamps(obj: any): any {
  if (obj instanceof Date) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => convertDatesToTimestamps(item));
  }

  if (obj !== null && typeof obj === "object") {
    const converted: any = {};
    for (const [key, value] of Object.entries(obj)) {
      converted[key] = convertDatesToTimestamps(value);
    }
    return converted;
  }

  return obj;
}

/**
 * Clear in-memory API caches on the running Next.js server.
 *
 * Calls POST /api/cache/revalidate with the collections that were seeded so
 * the server evicts any stale cached responses immediately rather than waiting
 * for the TTL to expire.
 *
 * Requires:
 *   - CACHE_REVALIDATION_SECRET  env var (must match the server's value)
 *   - A running Next.js server (NEXT_PUBLIC_APP_URL or --server-url arg)
 */
async function clearApiCaches(
  collectionsToSeed: string[],
  options: SeedOptions,
): Promise<void> {
  const secret = process.env.CACHE_REVALIDATION_SECRET;
  if (!secret) {
    console.warn(
      "\n⚠️  CACHE_REVALIDATION_SECRET is not set — skipping cache clear.",
    );
    return;
  }

  const baseUrl =
    options.serverUrl ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000";

  const url = `${baseUrl}/api/cache/revalidate`;

  // Determine which collections have cacheable API routes
  const cacheableCollections = [
    "categories",
    "products",
    "carouselSlides",
    "homepageSections",
    "siteSettings",
    "faqs",
    "reviews",
    "blogPosts",
    "events",
    "coupons",
  ];

  const collectionsForCache = collectionsToSeed.filter((c) =>
    cacheableCollections.includes(c),
  );

  const body =
    collectionsForCache.length > 0
      ? JSON.stringify({ collections: collectionsForCache })
      : undefined;

  console.log(`\n🗑️  Clearing API caches at ${url}...`);
  if (options.verbose && collectionsForCache.length > 0) {
    console.log(`   Collections: ${collectionsForCache.join(", ")}`);
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": secret,
      },
      body,
    });

    if (!response.ok) {
      const text = await response.text().catch(() => String(response.status));
      console.warn(`\n⚠️  Cache clear failed (${response.status}): ${text}`);
      return;
    }

    const result = await response.json();
    if (result.cleared === "all") {
      console.log("✅ All API caches cleared.");
    } else {
      console.log(
        `✅ Cleared cache paths: ${(result.cleared as string[]).join(", ")}`,
      );
    }
  } catch (error: any) {
    console.warn(
      `\n⚠️  Could not reach server at ${url} — cache not cleared. (${error.message})`,
    );
  }
}

/**
 * Main seed function
 */
async function seedAllData(options: SeedOptions) {
  console.log("🌱 Starting database seeding...\n");

  if (options.dryRun) {
    console.log("⚠️  DRY RUN MODE - No changes will be made\n");
  }

  const allCollections = [
    "users",
    "addresses",
    "categories",
    "products",
    "orders",
    "reviews",
    "bids",
    "coupons",
    "carouselSlides",
    "homepageSections",
    "siteSettings",
    "faqs",
    "blogPosts",
    "events",
    "eventEntries",
    "notifications",
    "payouts",
    "sessions",
    "carts",
  ];

  const collectionsToSeed =
    options.collections && options.collections.length > 0
      ? options.collections
      : allCollections;

  console.log(`📦 Collections to seed: ${collectionsToSeed.join(", ")}\n`);

  try {
    // Seed Auth Users (if users collection is included)
    if (collectionsToSeed.includes("users")) {
      await seedAuthUsers(options);
      await seedCollection(USER_COLLECTION, usersSeedData, options);
    }

    // Seed Addresses (subcollection of users)
    if (collectionsToSeed.includes("addresses")) {
      await seedAddresses(options);
    }

    // Seed Categories
    if (collectionsToSeed.includes("categories")) {
      await seedCollection(CATEGORIES_COLLECTION, categoriesSeedData, options);
    }

    // Seed Products
    if (collectionsToSeed.includes("products")) {
      await seedCollection(PRODUCT_COLLECTION, productsSeedData, options);
    }

    // Seed Orders
    if (collectionsToSeed.includes("orders")) {
      await seedCollection(ORDER_COLLECTION, ordersSeedData, options);
    }

    // Seed Reviews
    if (collectionsToSeed.includes("reviews")) {
      await seedCollection(REVIEW_COLLECTION, reviewsSeedData, options);
    }

    // Seed Bids (depends on products and users)
    if (collectionsToSeed.includes("bids")) {
      await seedCollection(BID_COLLECTION, bidsSeedData, options);
    }

    // Seed Coupons
    if (collectionsToSeed.includes("coupons")) {
      await seedCollection(COUPONS_COLLECTION, couponsSeedData, options);
    }

    // Seed Carousel Slides
    if (collectionsToSeed.includes("carouselSlides")) {
      await seedCollection(
        CAROUSEL_SLIDES_COLLECTION,
        carouselSlidesSeedData,
        options,
      );
    }

    // Seed Homepage Sections
    if (collectionsToSeed.includes("homepageSections")) {
      await seedCollection(
        HOMEPAGE_SECTIONS_COLLECTION,
        homepageSectionsSeedData,
        options,
      );
    }

    // Seed Site Settings (Singleton)
    if (collectionsToSeed.includes("siteSettings")) {
      await seedSingleton(
        SITE_SETTINGS_COLLECTION,
        "global",
        siteSettingsSeedData,
        options,
      );
    }

    // Seed FAQs
    if (collectionsToSeed.includes("faqs")) {
      await seedCollection(FAQS_COLLECTION, faqSeedData, options);
    }

    // Seed Blog Posts
    if (collectionsToSeed.includes("blogPosts")) {
      await seedCollection(BLOG_POSTS_COLLECTION, blogPostsSeedData, options);
    }

    // Seed Events
    if (collectionsToSeed.includes("events")) {
      await seedCollection(EVENTS_COLLECTION, eventsSeedData, options);
    }

    // Seed Event Entries
    if (collectionsToSeed.includes("eventEntries")) {
      await seedCollection(
        EVENT_ENTRIES_COLLECTION,
        eventEntriesSeedData,
        options,
      );
    }

    // Seed Notifications
    if (collectionsToSeed.includes("notifications")) {
      await seedCollection(
        NOTIFICATIONS_COLLECTION,
        notificationsSeedData,
        options,
      );
    }

    // Seed Payouts
    if (collectionsToSeed.includes("payouts")) {
      await seedCollection(PAYOUT_COLLECTION, payoutsSeedData, options);
    }

    // Seed Sessions
    if (collectionsToSeed.includes("sessions")) {
      await seedCollection(SESSION_COLLECTION, sessionsSeedData, options);
    }

    // Seed Carts (document ID = userId)
    if (collectionsToSeed.includes("carts")) {
      await seedCollection(CART_COLLECTION, cartsSeedData, options);
    }

    console.log("\n✅ Database seeding completed successfully!\n");

    // Clear API caches so stale responses are evicted immediately
    if (options.clearCache && !options.dryRun) {
      await clearApiCaches(collectionsToSeed, options);
    }
  } catch (error) {
    console.error("\n❌ Error during seeding:", error);
    process.exit(1);
  }
}

// Run the seeder
const options = parseArgs();
seedAllData(options).catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
