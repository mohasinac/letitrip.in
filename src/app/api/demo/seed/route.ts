import "@/providers.config";
import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/firebase/auth-server";
import { getAdminDb, getAdminAuth } from "@mohasinac/appkit";
import { serverLogger } from "@mohasinac/appkit";
import {
  encryptPiiFields,
  addPiiIndices,
  encryptPayoutDetails,
  encryptPayoutBankAccount,
  encryptShippingConfig,
  USER_PII_FIELDS,
  USER_PII_INDEX_MAP,
  ADDRESS_PII_FIELDS,
  ORDER_PII_FIELDS,
  BID_PII_FIELDS,
  PAYOUT_PII_FIELDS,
  REVIEW_PII_FIELDS,
  OFFER_PII_FIELDS,
  EVENT_ENTRY_PII_FIELDS,
  CHAT_PII_FIELDS,
  getPiiConfigError,
} from "@mohasinac/appkit";
import {
  usersSeedData,
  addressesSeedData,
  storeAddressesSeedData,
  categoriesSeedData,
  storesSeedData,
  sessionsSeedData,
  productsStandardSeedData,
  productsAuctionsSeedData,
  productsPreordersSeedData,
  productsPrizeDrawsSeedData,
  productsClassifiedsSeedData,
  productsDigitalCodesSeedData,
  productsLiveItemsSeedData,
  ordersSeedData,
  reviewsSeedData,
  cartsSeedData,
  bidsSeedData,
  couponsSeedData,
  couponUsageSeedData,
  claimedCouponsSeedData,
  eventsSeedData,
  eventEntriesSeedData,
  payoutsSeedData,
  notificationsSeedData,
  blogPostsSeedData,
  carouselsSeedData,
  carouselSlidesSeedData,
  homepageSectionsSeedData,
  siteSettingsSeedData,
  faqSeedData,
  wishlistsSeedData,
  historySeedData,
  conversationsSeedData,
  groupedListingsSeedData,
  scammersSeedData,
  supportTicketsSeedData,
  productFeaturesSeedData,
  offersSeedData,
  payoutMethodsSeedData,
  shippingConfigsSeedData,
  analyticsCardsSeedData,
  analyticsAlertsSeedData,
  storeCategoriesSeedData,
  listingTemplatesSeedData,
  moderationQueueSeedData,
  reportsSeedData,
  itemRequestsSeedData,
  storeWhatsAppConfigSeedData,
  storeGoogleConfigSeedData,
} from "@mohasinac/appkit";
import {
  CAROUSEL_SLIDES_COLLECTION,
  HOMEPAGE_SECTIONS_COLLECTION,
  CAROUSELS_COLLECTION,
} from "@mohasinac/appkit";
import { SITE_SETTINGS_COLLECTION } from "@mohasinac/appkit";
import { FAQS_COLLECTION } from "@mohasinac/appkit";
import { USER_COLLECTION } from "@mohasinac/appkit";
import { ORDER_COLLECTION } from "@mohasinac/appkit";
import { REVIEW_COLLECTION } from "@mohasinac/appkit";
import { BID_COLLECTION } from "@mohasinac/appkit";
import { COUPONS_COLLECTION } from "@mohasinac/appkit";
import { CATEGORIES_COLLECTION } from "@mohasinac/appkit";
// SB-UNI-C — BRANDS_COLLECTION dropped; brands live in CATEGORIES_COLLECTION with categoryType:"brand".
import { NOTIFICATIONS_COLLECTION } from "@mohasinac/appkit";
import { PAYOUT_COLLECTION } from "@mohasinac/appkit";
import { BLOG_POSTS_COLLECTION } from "@mohasinac/appkit";
import { EVENTS_COLLECTION, EVENT_ENTRIES_COLLECTION } from "@mohasinac/appkit";
import { SESSION_COLLECTION } from "@mohasinac/appkit";
import { CART_COLLECTION } from "@mohasinac/appkit";
import { STORE_COLLECTION } from "@mohasinac/appkit";
import { PRODUCT_COLLECTION } from "@mohasinac/appkit";

import { CONVERSATIONS_COLLECTION } from "@mohasinac/appkit";
// SB-UNI-B — SUBLISTING_CATEGORIES_COLLECTION removed; sublistings now live in CATEGORIES_COLLECTION with categoryType:"sublisting".
import { GROUPED_LISTINGS_COLLECTION } from "@mohasinac/appkit";
// SB-UNI-V — BUNDLES_COLLECTION dropped; bundles in CATEGORIES_COLLECTION with categoryType:"bundle".
import { SCAMMER_COLLECTION } from "@mohasinac/appkit";
import { SUPPORT_TICKET_COLLECTION } from "@mohasinac/appkit";
import { WISHLIST_COLLECTION, HISTORY_COLLECTION } from "@mohasinac/appkit";
import { PRODUCT_FEATURES_COLLECTION } from "@mohasinac/appkit";
import { OFFER_COLLECTION } from "@mohasinac/appkit";

type CollectionName =
  | "users"
  | "addresses"
  | "categories"
  | "stores"
  | "products"
  | "carousels"
  | "carouselSlides"
  | "homepageSections"
  | "siteSettings"
  | "faqs"
  | "orders"
  | "reviews"
  | "bids"
  | "coupons"
  | "notifications"
  | "payouts"
  | "blogPosts"
  | "events"
  | "eventEntries"
  | "sessions"
  | "carts"
  | "wishlists"
  | "history"
  | "conversations"
  | "groupedListings"
  | "couponUsage"
  | "claimedCoupons"
  | "scammerProfiles"
  | "supportTickets"
  | "productFeatures"
  | "offers"
  | "payoutMethods"
  | "shippingConfigs"
  | "analyticsCards"
  | "analyticsAlerts"
  | "storeCategories"
  | "listingTemplates"
  | "moderationQueue"
  | "reports"
  | "itemRequests"
  | "storeWhatsAppConfig"
  | "storeGoogleConfig"
  | "roleOverrides"
  | "customRoles"
  | "adminNotifications";

interface SeedRequest {
  action: "load" | "delete";
  collections?: CollectionName[];
  dryRun?: boolean;
}

const COLLECTION_MAP: Record<CollectionName, string> = {
  users: USER_COLLECTION,
  // SB-UNI-A 2026-05-13 — top-level collection w/ ownerType:"user"|"store".
  addresses: "addresses",
  couponUsage: "couponUsage", // Subcollection under users
  categories: CATEGORIES_COLLECTION,
  stores: STORE_COLLECTION,
  products: PRODUCT_COLLECTION,
  orders: ORDER_COLLECTION,
  reviews: REVIEW_COLLECTION,
  bids: BID_COLLECTION,
  coupons: COUPONS_COLLECTION,
  claimedCoupons: "claimedCoupons",
  carousels: CAROUSELS_COLLECTION,
  carouselSlides: CAROUSEL_SLIDES_COLLECTION,
  homepageSections: HOMEPAGE_SECTIONS_COLLECTION,
  siteSettings: SITE_SETTINGS_COLLECTION,
  faqs: FAQS_COLLECTION,
  notifications: NOTIFICATIONS_COLLECTION,
  payouts: PAYOUT_COLLECTION,
  blogPosts: BLOG_POSTS_COLLECTION,
  events: EVENTS_COLLECTION,
  eventEntries: EVENT_ENTRIES_COLLECTION,
  sessions: SESSION_COLLECTION,
  carts: CART_COLLECTION,
  wishlists: WISHLIST_COLLECTION,
  history: HISTORY_COLLECTION,
  conversations: CONVERSATIONS_COLLECTION,
  groupedListings: GROUPED_LISTINGS_COLLECTION,
  scammerProfiles: SCAMMER_COLLECTION,
  supportTickets: SUPPORT_TICKET_COLLECTION,
  productFeatures: PRODUCT_FEATURES_COLLECTION,
  offers: OFFER_COLLECTION,
  // S-STORE foundation collections (literal names — schemas live in store-extensions feature)
  payoutMethods: "payoutMethods",
  shippingConfigs: "shippingConfigs",
  analyticsCards: "analyticsCards",
  analyticsAlerts: "analyticsAlerts",
  storeCategories: "storeCategories",
  listingTemplates: "listingTemplates",
  moderationQueue: "moderationQueue",
  reports: "reports",
  itemRequests: "itemRequests",
  storeWhatsAppConfig: "storeWhatsAppConfig",
  storeGoogleConfig: "storeGoogleConfig",
  roleOverrides: "roleOverrides",
  customRoles: "customRoles",
  adminNotifications: "adminNotifications",
};

// SB-UNI-A 2026-05-13 — addressesSeedData has ownerType+ownerId set.
// storeAddressesSeedData uses legacy storeSlug — map to ownerType/ownerId.
const mergedAddressesSeedData = [
  ...addressesSeedData,
  ...storeAddressesSeedData.map((a: any) => ({
    ...a,
    ownerType: "store" as const,
    ownerId: a.storeSlug,
  })),
];

const SEED_DATA_MAP: Record<CollectionName, any[]> = {
  users: usersSeedData,
  addresses: mergedAddressesSeedData,
  categories: categoriesSeedData,
  stores: storesSeedData,
  products: [
    ...productsStandardSeedData,
    ...productsAuctionsSeedData,
    ...productsPreordersSeedData,
    ...productsPrizeDrawsSeedData,
    ...productsClassifiedsSeedData,
    ...productsDigitalCodesSeedData,
    ...productsLiveItemsSeedData,
  ],
  orders: ordersSeedData,
  reviews: reviewsSeedData,
  bids: bidsSeedData,
  coupons: couponsSeedData,
  couponUsage: couponUsageSeedData,
  claimedCoupons: claimedCouponsSeedData,
  carousels: carouselsSeedData,
  carouselSlides: carouselSlidesSeedData,
  homepageSections: homepageSectionsSeedData,
  siteSettings: [siteSettingsSeedData], // Wrap singleton in array
  faqs: faqSeedData,
  notifications: notificationsSeedData,
  payouts: payoutsSeedData,
  blogPosts: blogPostsSeedData,
  events: eventsSeedData,
  eventEntries: eventEntriesSeedData,
  sessions: sessionsSeedData,
  carts: cartsSeedData,
  wishlists: wishlistsSeedData,
  history: historySeedData,
  conversations: conversationsSeedData,
  groupedListings: groupedListingsSeedData,
  scammerProfiles: scammersSeedData,
  supportTickets: supportTicketsSeedData,
  productFeatures: productFeaturesSeedData,
  offers: offersSeedData,
  payoutMethods: payoutMethodsSeedData,
  shippingConfigs: shippingConfigsSeedData,
  analyticsCards: analyticsCardsSeedData,
  analyticsAlerts: analyticsAlertsSeedData,
  storeCategories: storeCategoriesSeedData,
  listingTemplates: listingTemplatesSeedData,
  moderationQueue: moderationQueueSeedData,
  reports: reportsSeedData,
  itemRequests: itemRequestsSeedData,
  storeWhatsAppConfig: storeWhatsAppConfigSeedData,
  storeGoogleConfig: storeGoogleConfigSeedData,
  // RBAC + admin inbox — no seed docs yet; entries kept so SeedPanel can list them.
  roleOverrides: [],
  customRoles: [],
  adminNotifications: [],
};

const PII_ENCRYPTED_COLLECTIONS = new Set<CollectionName>([
  "users",
  "addresses",
  "products",
  "orders",
  "reviews",
  "bids",
  "payouts",
  "eventEntries",
  "offers",
]);

/** Delete every document in a Firestore collection (in batches of 500). */
async function purgeCollection(
  db: ReturnType<typeof getAdminDb>,
  collectionPath: string,
): Promise<void> {
  const BATCH_LIMIT = 500;
  let snapshot = await db.collection(collectionPath).limit(BATCH_LIMIT).get();
  while (!snapshot.empty) {
    const batch = db.batch();
    snapshot.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
    if (snapshot.docs.length < BATCH_LIMIT) break;
    snapshot = await db.collection(collectionPath).limit(BATCH_LIMIT).get();
  }
}

/** Recursively remove keys whose value is `undefined` so Firestore doesn't reject them. */
function stripUndefined(obj: any): any {
  if (Array.isArray(obj)) return obj.map(stripUndefined);
  if (obj instanceof Date) return obj;
  if (obj !== null && typeof obj === "object") {
    return Object.fromEntries(
      Object.entries(obj)
        .filter(([, v]) => v !== undefined)
        .map(([k, v]) => [k, stripUndefined(v)]),
    );
  }
  return obj;
}

/** Apply PII encryption to seed data based on collection type */
function encryptSeedPii(collection: string, data: any, _original?: any): any {
  const PII_MAP: Record<string, readonly string[]> = {
    orders: ORDER_PII_FIELDS,
    bids: BID_PII_FIELDS,
    payouts: PAYOUT_PII_FIELDS,
    reviews: REVIEW_PII_FIELDS,
    products: ["sellerName", "sellerEmail"],
    offers: OFFER_PII_FIELDS,
    eventEntries: EVENT_ENTRY_PII_FIELDS,
    chatRooms: CHAT_PII_FIELDS,
  };
  const fields = PII_MAP[collection];
  if (!fields) return data;
  let result = encryptPiiFields(data, [...fields]);
  if (collection === "payouts" && result.bankAccount) {
    result.bankAccount = encryptPayoutBankAccount(result.bankAccount);
  }
  return result;
}

async function countExistingForCollection(
  db: ReturnType<typeof getAdminDb>,
  colName: CollectionName,
): Promise<number> {
  const seedData = SEED_DATA_MAP[colName];
  if (!seedData || seedData.length === 0) return 0;

  if (colName === "addresses") {
    // SB-UNI-A 2026-05-13 — top-level addresses collection w/ ownerType discriminator.
    const refs = (seedData as any[])
      .filter((d) => d.id)
      // eslint-disable-next-line lir/no-hardcoded-collection
      .map((d) => db.collection("addresses").doc(d.id));
    if (refs.length === 0) return 0;
    const snaps = await db.getAll(...refs);
    return snaps.filter((s: FirebaseFirestore.DocumentSnapshot) => s.exists)
      .length;
  }

  if (colName === "wishlists") {
    const refs = (seedData as any[])
      .filter((d) => d.id)
      .map((d) => db.collection(WISHLIST_COLLECTION).doc(d.id));
    if (refs.length === 0) return 0;
    const snaps = await db.getAll(...refs);
    return snaps.filter((s: FirebaseFirestore.DocumentSnapshot) => s.exists)
      .length;
  }

  if (colName === "history") {
    const refs = (seedData as any[])
      .filter((d) => d.id)
      .map((d) => db.collection(HISTORY_COLLECTION).doc(d.id));
    if (refs.length === 0) return 0;
    const snaps = await db.getAll(...refs);
    return snaps.filter((s: FirebaseFirestore.DocumentSnapshot) => s.exists)
      .length;
  }

  if (colName === "couponUsage") {
    const refs = (seedData as any[])
      .filter((d) => d.userId && d.couponId)
      .map((d) =>
        db
          .collection(USER_COLLECTION)
          .doc(d.userId)
          .collection("couponUsage")
          .doc(d.couponId),
      );
    if (refs.length === 0) return 0;
    const snaps = await db.getAll(...refs);
    return snaps.filter((s: FirebaseFirestore.DocumentSnapshot) => s.exists)
      .length;
  }

  if (colName === "siteSettings") {
    const snap = await db.collection(COLLECTION_MAP[colName]).doc("global").get();
    return snap.exists ? 1 : 0;
  }

  if (colName === "users") {
    const refs = (seedData as any[])
      .filter((d) => d.uid)
      .map((d) => db.collection(COLLECTION_MAP[colName]).doc(d.uid));
    if (refs.length === 0) return 0;
    const snaps = await db.getAll(...refs);
    return snaps.filter((s: FirebaseFirestore.DocumentSnapshot) => s.exists)
      .length;
  }

  if (colName === "faqs") {
    const { generateFAQId } = await import("@mohasinac/appkit");
    const refs = (seedData as any[]).map((faq: any) => {
      // Mirror the write path: prefer top-level slug, then seed id, then generate.
      const docId =
        faq.slug ??
        faq.id ??
        generateFAQId({ category: faq.category, question: faq.question });
      return db.collection(COLLECTION_MAP[colName]).doc(docId);
    });
    if (refs.length === 0) return 0;
    const snaps = await db.getAll(...refs);
    return snaps.filter((s: FirebaseFirestore.DocumentSnapshot) => s.exists)
      .length;
  }

  const refs = (seedData as any[])
    .filter((d) => d.id)
    .map((d) => db.collection(COLLECTION_MAP[colName]).doc(d.id));
  if (refs.length === 0) return 0;
  const snaps = await db.getAll(...refs);
  return snaps.filter((s) => s.exists).length;
}

/**
 * Remove any existing Firebase Auth users that hold the same email or phone
 * as the seed user we're about to create. In a demo environment this lets us
 * always assign the canonical seed UID to the identity for reproducible data.
 */
async function resolveAuthConflicts(
  auth: ReturnType<typeof getAdminAuth>,
  uid: string,
  authUserData: { email?: string; phoneNumber?: string },
): Promise<void> {
  if (authUserData.email) {
    try {
      const conflicting = await auth.getUserByEmail(authUserData.email);
      if (conflicting.uid !== uid) {
        serverLogger.warn(`Seed: removing conflicting auth account`, {
          email: authUserData.email,
          conflictingUid: conflicting.uid,
          targetUid: uid,
        });
        await auth.deleteUser(conflicting.uid);
      }
    } catch (e: any) {
      if (e?.code !== "auth/user-not-found") throw e;
    }
  }

  if (authUserData.phoneNumber) {
    try {
      const conflicting = await auth.getUserByPhoneNumber(
        authUserData.phoneNumber,
      );
      if (conflicting.uid !== uid) {
        serverLogger.warn(`Seed: removing conflicting auth account`, {
          phoneNumber: authUserData.phoneNumber,
          conflictingUid: conflicting.uid,
          targetUid: uid,
        });
        await auth.deleteUser(conflicting.uid);
      }
    } catch (e: any) {
      if (e?.code !== "auth/user-not-found") throw e;
    }
  }
}

export async function GET(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user || user.role !== "admin") {
    return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
  }

  const { siteSettingsRepository } = await import("@mohasinac/appkit");
  const settings = await siteSettingsRepository.getSingleton().catch(() => null);
  // Default true when siteSettings doc doesn't exist yet (chicken-and-egg on first run)
  const seedPanelEnabled = settings?.featureFlags?.seedPanel ?? true;
  if (!seedPanelEnabled) {
    return NextResponse.json(
      { success: false, message: "Seed panel is disabled." },
      { status: 403 },
    );
  }

  try {
    const db = getAdminDb();

    const collections = await Promise.all(
      (Object.keys(SEED_DATA_MAP) as CollectionName[]).map(async (colName) => {
        const seedCount = SEED_DATA_MAP[colName]?.length ?? 0;
        try {
          const existingCount = await countExistingForCollection(db, colName);
          return { name: colName, seedCount, existingCount };
        } catch (err: unknown) {
          serverLogger.error(`Error checking status for ${colName}:`, err);
          return { name: colName, seedCount, existingCount: 0 };
        }
      }),
    );

    return NextResponse.json({ success: true, data: { collections } });
  } catch (error) {
    serverLogger.error("Seed status API error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "An error occurred",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user || user.role !== "admin") {
    return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
  }

  // Gate: seedPanel feature flag must be enabled in site settings
  const { siteSettingsRepository } = await import("@mohasinac/appkit");
  const settings = await siteSettingsRepository.getSingleton().catch(() => null);
  // Default true when siteSettings doc doesn't exist yet (chicken-and-egg on first run)
  const seedPanelEnabled = settings?.featureFlags?.seedPanel ?? true;
  if (!seedPanelEnabled) {
    return NextResponse.json(
      { success: false, message: "Seed panel is disabled." },
      { status: 403 },
    );
  }

  try {
    const body: SeedRequest = await request.json();
    const { action, collections, dryRun = false } = body;

    if (!action || !["load", "delete"].includes(action)) {
      return NextResponse.json(
        { success: false, message: 'Invalid action. Use "load" or "delete".' },
        { status: 400 },
      );
    }

    const collectionsToProcess =
      collections ?? (Object.keys(COLLECTION_MAP) as CollectionName[]);

    const db = getAdminDb();
    const auth = getAdminAuth();

    if (action === "load") {
      const encryptedCollections = collectionsToProcess.filter((collectionName) =>
        PII_ENCRYPTED_COLLECTIONS.has(collectionName),
      );
      const piiConfigError =
        encryptedCollections.length > 0 ? getPiiConfigError() : null;

      if (piiConfigError) {
        serverLogger.error("Demo seed aborted: invalid PII configuration", {
          piiConfigError,
          collections: encryptedCollections,
        });
        return NextResponse.json(
          {
            success: false,
            message:
              "Demo seed requires a valid PII_SECRET before loading encrypted collections. " +
              piiConfigError,
          },
          { status: 500 },
        );
      }
    }

    if (dryRun) {
      const collectionPlans = await Promise.all(
        collectionsToProcess.map(async (collectionName) => {
          const seedCount = SEED_DATA_MAP[collectionName]?.length ?? 0;
          const existingCount = await countExistingForCollection(db, collectionName);
          const wouldCreate = action === "load" ? Math.max(seedCount - existingCount, 0) : 0;
          const wouldDelete = action === "delete" ? Math.min(seedCount, existingCount) : 0;
          const wouldSkip =
            action === "load"
              ? Math.min(seedCount, existingCount)
              : Math.max(seedCount - existingCount, 0);

          return {
            name: collectionName,
            seedCount,
            existingCount,
            wouldCreate,
            wouldDelete,
            wouldSkip,
          };
        }),
      );

      const totals = collectionPlans.reduce(
        (acc, plan) => {
          acc.wouldCreate += plan.wouldCreate;
          acc.wouldDelete += plan.wouldDelete;
          acc.wouldSkip += plan.wouldSkip;
          return acc;
        },
        { wouldCreate: 0, wouldDelete: 0, wouldSkip: 0 },
      );

      return NextResponse.json({
        success: true,
        data: {
          message:
            action === "load"
              ? `Dry run complete. Would create ${totals.wouldCreate}, skip ${totals.wouldSkip}.`
              : `Dry run complete. Would delete ${totals.wouldDelete}, skip ${totals.wouldSkip}.`,
          details: {
            created: totals.wouldCreate,
            deleted: totals.wouldDelete,
            skipped: totals.wouldSkip,
            errors: 0,
            dryRun: true,
            collections: collectionsToProcess,
            collectionPlans,
          },
        },
      });
    }

    // Real execution — stream NDJSON progress events so the client can update
    // per-collection UI without multiple round-trips.
    const encoder = new TextEncoder();
    const total = collectionsToProcess.length;

    const stream = new ReadableStream({
      async start(controller) {
        const emit = (data: object) => {
          try { controller.enqueue(encoder.encode(JSON.stringify(data) + "\n")); } catch { /* closed */ }
        };

        let totalCreated = 0;
        let totalDeleted = 0;
        let totalSkipped = 0;
        let totalErrors = 0;
        const processedCollections: string[] = [];
        let progressDone = 0;

    if (action === "load") {
      // Load seed data
      for (const collectionName of collectionsToProcess) {
        emit({ type: "progress", collection: collectionName, status: "running", done: progressDone, total });
        try {
          const firestoreCollection = COLLECTION_MAP[collectionName];
          const seedData = SEED_DATA_MAP[collectionName];

          if (!seedData || seedData.length === 0) {
            serverLogger.info(`⚠️ No seed data for ${collectionName}`);
            continue;
          }

          // Handle users collection (Auth + Firestore)
          if (collectionName === "users") {
            for (const userData of seedData) {
              try {
                const {
                  uid,
                  email,
                  phoneNumber,
                  displayName,
                  photoURL,
                  emailVerified,
                  disabled,
                } = userData as any;

                // Always upsert Firestore user doc (merge so existing fields are preserved)
                const docRef = db.collection(firestoreCollection).doc(uid);

                // Check if Auth user exists
                let userExists = false;
                try {
                  await auth.getUser(uid);
                  userExists = true;
                } catch (error: any) {
                  if (error.code !== "auth/user-not-found") {
                    throw error;
                  }
                }

                // Create Auth user if not present
                // Note: Firebase Auth rejects null/empty strings for email, phoneNumber, photoURL
                const authUserData: any = {
                  displayName,
                  emailVerified,
                  disabled,
                };
                if (email && typeof email === "string")
                  authUserData.email = email;
                if (phoneNumber && typeof phoneNumber === "string")
                  authUserData.phoneNumber = phoneNumber;
                if (
                  photoURL &&
                  typeof photoURL === "string" &&
                  photoURL.trim() !== ""
                ) {
                  authUserData.photoURL = photoURL;
                }

                if (!userExists) {
                  // Remove any auth accounts that already hold this email/phone
                  // so the seed identity is always created with its canonical UID.
                  await resolveAuthConflicts(auth, uid, authUserData);

                  await auth.createUser({
                    uid,
                    ...authUserData,
                    password: "TempPass123!", // Default password for demo
                  });
                } else {
                  // Always sync auth properties so re-seeds keep the record current
                  await auth.updateUser(uid, authUserData);
                }

                // Always sync role as custom claim so auth/me returns correct role
                const seedRole = (userData as any).role;
                if (seedRole && seedRole !== "user") {
                  await auth.setCustomUserClaims(uid, { role: seedRole });
                }

                // Write new Firestore document — encrypt PII fields
                let docData = stripUndefined({ ...userData });
                // Add blind indices from plaintext BEFORE encrypting
                docData = addPiiIndices(docData, USER_PII_INDEX_MAP);
                docData = encryptPiiFields(docData, [...USER_PII_FIELDS]);
                if (docData.payoutDetails) {
                  docData.payoutDetails = encryptPayoutDetails(
                    docData.payoutDetails,
                  );
                }
                if (docData.shippingConfig) {
                  docData.shippingConfig = encryptShippingConfig(
                    docData.shippingConfig,
                  );
                }
                await docRef.set(docData, { merge: true });
                totalCreated++;
              } catch (err) {
                serverLogger.error(`Error seeding user ${userData.uid}:`, err);
                totalErrors++;
              }
            }
          } else if (collectionName === "addresses") {
            // SB-UNI-A 2026-05-13 — top-level addresses collection.
            // Each seed entry carries ownerType + ownerId from the merge above.
            for (const addressData of seedData) {
              try {
                const { id, userId: _u, storeSlug: _s, ...data } = addressData as any;

                if (!id || !data.ownerType || !data.ownerId) {
                  serverLogger.error("Address missing id/ownerType/ownerId");
                  totalErrors++;
                  continue;
                }

                // eslint-disable-next-line lir/no-hardcoded-collection
                const docRef = db.collection("addresses").doc(id);
                await docRef.set(
                  encryptPiiFields(stripUndefined(data), [
                    ...ADDRESS_PII_FIELDS,
                  ]),
                  { merge: true },
                );
                totalCreated++;
              } catch (err) {
                serverLogger.error(`Error seeding address:`, err);
                totalErrors++;
              }
            }
          } else if (collectionName === "wishlists") {
            // One doc per user at top-level wishlists/wishlist-{userId}
            for (const wishlistDoc of seedData) {
              try {
                const { id, userId, items, updatedAt } = wishlistDoc as any;
                if (!id || !userId) {
                  serverLogger.error("Wishlist doc missing id or userId");
                  totalErrors++;
                  continue;
                }
                await db.collection(WISHLIST_COLLECTION).doc(id).set(
                  stripUndefined({
                    userId,
                    items: items ?? [],
                    updatedAt: updatedAt ?? new Date(),
                  }),
                  { merge: false },
                );
                totalCreated++;
              } catch (err) {
                serverLogger.error(`Error seeding wishlist doc:`, err);
                totalErrors++;
              }
            }
          } else if (collectionName === "history") {
            // One doc per user at top-level history/history-{userId}
            for (const historyDoc of seedData) {
              try {
                const { id, userId, items, updatedAt } = historyDoc as any;
                if (!id || !userId) {
                  serverLogger.error("History doc missing id or userId");
                  totalErrors++;
                  continue;
                }
                await db.collection(HISTORY_COLLECTION).doc(id).set(
                  stripUndefined({
                    userId,
                    items: items ?? [],
                    updatedAt: updatedAt ?? new Date(),
                  }),
                  { merge: false },
                );
                totalCreated++;
              } catch (err) {
                serverLogger.error(`Error seeding history doc:`, err);
                totalErrors++;
              }
            }
          } else if (collectionName === "couponUsage") {
            // couponUsage is a subcollection under users; doc id is couponId
            for (const usageData of seedData) {
              try {
                const { userId, couponId, ...data } = usageData as any;

                if (!userId || !couponId) {
                  serverLogger.error("Coupon usage record missing userId or couponId");
                  totalErrors++;
                  continue;
                }

                const docRef = db
                  .collection(USER_COLLECTION)
                  .doc(userId)
                  .collection("couponUsage")
                  .doc(couponId);

                await docRef.set(stripUndefined({ couponId, ...data }), { merge: true });
                totalCreated++;
              } catch (err) {
                serverLogger.error("Error seeding coupon usage record:", err);
                totalErrors++;
              }
            }
          } else if (collectionName === "siteSettings") {
            // Site settings is a singleton document — always upsert
            const settingsData = seedData[0];
            if (settingsData) {
              const docRef = db.collection(firestoreCollection).doc("global");
              await docRef.set(stripUndefined(settingsData), { merge: true });
              totalCreated++;
            }
          } else {
            // Config-only collections are fully replaced on every seed load so
            // stale docs from prior seed runs (different IDs) don't accumulate.
            const REPLACE_COLLECTIONS: CollectionName[] = [
              "homepageSections",
              "carouselSlides",
            ];
            if (REPLACE_COLLECTIONS.includes(collectionName)) {
              await purgeCollection(db, firestoreCollection);
            }

            // Regular collections — upsert (merge) all seed docs in batches of 500
            type WriteItem = {
              docRef: FirebaseFirestore.DocumentReference;
              data: Record<string, any>;
            };
            const items: WriteItem[] = [];

            // Phase 1: resolve document IDs
            for (const docData of seedData) {
              let { id, ...data } = docData as any;

              if (!id && collectionName === "faqs") {
                const { generateFAQId } = await import("@mohasinac/appkit");
                id = generateFAQId({
                  category: (docData as any).category,
                  question: (docData as any).question,
                });
                if (!id) {
                  serverLogger.error(
                    `Failed to generate ID for FAQ: ${(docData as any).question}`,
                  );
                  totalErrors++;
                  continue;
                }
              } else if (!id) {
                serverLogger.error(`Document missing ID in ${collectionName}`);
                totalErrors++;
                continue;
              }

              // Slug normalization: use slug as docId when present; ensure slug
              // field is always written so every doc is addressable by slug.
              const slug: string | undefined = (docData as any).slug;
              const docId = slug ?? id;
              if (!data.slug) data.slug = docId;

              items.push({
                docRef: db.collection(firestoreCollection).doc(docId),
                data: encryptSeedPii(
                  collectionName,
                  stripUndefined(data),
                  docData,
                ),
              });
            }

            if (items.length > 0) {
              // Upsert (merge) in chunks of 500
              const BATCH_LIMIT = 500;
              for (let i = 0; i < items.length; i += BATCH_LIMIT) {
                const chunk = items.slice(i, i + BATCH_LIMIT);
                const batch = db.batch();
                for (const { docRef, data } of chunk) {
                  batch.set(docRef, data, { merge: true });
                }
                await batch.commit();
                totalCreated += chunk.length;
              }
            }
          }

          processedCollections.push(collectionName);
          emit({ type: "progress", collection: collectionName, status: "done", done: ++progressDone, total });
        } catch (err) {
          serverLogger.error(`Error processing collection ${collectionName}:`, err);
          totalErrors++;
          emit({ type: "progress", collection: collectionName, status: "error", error: err instanceof Error ? err.message : "Unknown error", done: ++progressDone, total });
        }
      }

      emit({ type: "done", success: true, message: `Loaded seed data. Created ${totalCreated}, errors ${totalErrors}.`, totals: { created: totalCreated, skipped: totalSkipped, errors: totalErrors } });
    } else if (action === "delete") {
      // Delete seed data — purge entire collections so stale docs with old IDs
      // (from previous seed runs) are also removed.
      for (const collectionName of collectionsToProcess) {
        emit({ type: "progress", collection: collectionName, status: "running", done: progressDone, total });
        try {
          const firestoreCollection = COLLECTION_MAP[collectionName];
          const seedData = SEED_DATA_MAP[collectionName];

          if (collectionName === "users") {
            // Auth + Firestore — delete each seed user's auth account then Firestore doc.
            // The platform admin (admin@letitrip.in) is protected — skip it here;
            // remove manually via the Firebase console if needed.
            const PROTECTED_UIDS = new Set(["user-admin-letitrip"]);
            for (const userData of seedData) {
              try {
                const { uid } = userData as any;
                if (PROTECTED_UIDS.has(uid)) {
                  totalSkipped++;
                  continue;
                }
                try {
                  await auth.deleteUser(uid);
                } catch (err: any) {
                  if (err?.code !== "auth/user-not-found") {
                    serverLogger.error(`Error deleting auth user ${uid}`, { error: err instanceof Error ? err.message : String(err) });
                  }
                }
                const docRef = db.collection(firestoreCollection).doc(uid);
                if ((await docRef.get()).exists) {
                  await docRef.delete();
                  totalDeleted++;
                } else {
                  totalSkipped++;
                }
              } catch (err) {
                serverLogger.error(`Error deleting user`, { uid: (userData as any).uid, error: err instanceof Error ? err.message : String(err) });
                totalErrors++;
              }
            }
          } else if (collectionName === "addresses") {
            // SB-UNI-A 2026-05-13 — top-level addresses collection.
            try {
              await purgeCollection(db, "addresses");
              totalDeleted++;
            } catch (err) {
              serverLogger.error("Error purging addresses", { error: err instanceof Error ? err.message : String(err) });
              totalErrors++;
            }
          } else if (collectionName === "wishlists") {
            // Top-level wishlists collection — purge all docs.
            try {
              await purgeCollection(db, WISHLIST_COLLECTION);
              totalDeleted++;
            } catch (err) {
              serverLogger.error("Error purging wishlists", { error: err instanceof Error ? err.message : String(err) });
              totalErrors++;
            }
          } else if (collectionName === "history") {
            // Top-level history collection — purge all docs.
            try {
              await purgeCollection(db, HISTORY_COLLECTION);
              totalDeleted++;
            } catch (err) {
              serverLogger.error("Error purging history", { error: err instanceof Error ? err.message : String(err) });
              totalErrors++;
            }
          } else if (collectionName === "couponUsage") {
            // Purge the couponUsage subcollection for every seed user that has records.
            const userIds = [...new Set((seedData as any[]).map((d) => d.userId).filter(Boolean))] as string[];
            for (const userId of userIds) {
              try {
                await purgeCollection(db, `${USER_COLLECTION}/${userId}/couponUsage`);
                totalDeleted++;
              } catch (err) {
                serverLogger.error(`Error purging couponUsage for user ${userId}`, { error: err instanceof Error ? err.message : String(err) });
                totalErrors++;
              }
            }
          } else if (collectionName === "siteSettings") {
            // Singleton document — delete by known ID.
            const docRef = db.collection(firestoreCollection).doc("global");
            if ((await docRef.get()).exists) {
              await docRef.delete();
              totalDeleted++;
            } else {
              totalSkipped++;
            }
          } else {
            // All other top-level collections — purge the whole collection so
            // docs with IDs that differ from the current seed data are also removed.
            const countSnap = await (db.collection(firestoreCollection) as any).count().get();
            const count = countSnap.data().count;
            if (count > 0) {
              await purgeCollection(db, firestoreCollection);
              totalDeleted += count;
            } else {
              totalSkipped++;
            }
          }

          processedCollections.push(collectionName);
          emit({ type: "progress", collection: collectionName, status: "done", done: ++progressDone, total });
        } catch (err) {
          serverLogger.error(`Error processing collection ${collectionName}`, { error: err instanceof Error ? err.message : String(err) });
          totalErrors++;
          emit({ type: "progress", collection: collectionName, status: "error", error: err instanceof Error ? err.message : "Unknown error", done: ++progressDone, total });
        }
      }

      emit({ type: "done", success: true, message: `Deleted seed data. Removed ${totalDeleted} docs, errors ${totalErrors}.`, totals: { deleted: totalDeleted, skipped: totalSkipped, errors: totalErrors } });
    } else {
      emit({ type: "done", success: false, message: "Invalid action" });
    }

        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "application/x-ndjson",
        "Cache-Control": "no-cache, no-store",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error) {
    serverLogger.error("Seed API error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "An error occurred",
      },
      { status: 500 },
    );
  }
}

