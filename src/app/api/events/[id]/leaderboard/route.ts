import "@/providers.config";
import { NextRequest, NextResponse } from "next/server";
import { getAdminDb, getAdminAuth } from "@mohasinac/appkit/providers/db-firebase";
import { serverLogger } from "@mohasinac/appkit/monitoring";
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
} from "@mohasinac/appkit/security";
import {
  usersSeedData,
  addressesSeedData,
  storeAddressesSeedData,
  categoriesSeedData,
  storesSeedData,
  sessionsSeedData,
  productsSeedData,
  ordersSeedData,
  reviewsSeedData,
  cartsSeedData,
  bidsSeedData,
  couponsSeedData,
  eventsSeedData,
  eventEntriesSeedData,
  payoutsSeedData,
  notificationsSeedData,
  blogPostsSeedData,
} from "@mohasinac/appkit/seed";
import { carouselSlidesSeedData } from "@/db/seed-data/carousel-slides-seed-data";
import { homepageSectionsSeedData } from "@/db/seed-data/homepage-sections-seed-data";
import { siteSettingsSeedData } from "@/db/seed-data/site-settings-seed-data";
import { faqSeedData } from "@/db/seed-data/faq-seed-data";
import {
  USER_COLLECTION,
  ORDER_COLLECTION,
  REVIEW_COLLECTION,
  BID_COLLECTION,
  COUPONS_COLLECTION,
  CAROUSEL_SLIDES_COLLECTION,
  HOMEPAGE_SECTIONS_COLLECTION,
  SITE_SETTINGS_COLLECTION,
  FAQS_COLLECTION,
  CATEGORIES_COLLECTION,
  NOTIFICATIONS_COLLECTION,
  PAYOUT_COLLECTION,
  BLOG_POSTS_COLLECTION,
  EVENTS_COLLECTION,
  EVENT_ENTRIES_COLLECTION,
  SESSION_COLLECTION,
  CART_COLLECTION,
  STORE_COLLECTION,
  PRODUCT_COLLECTION,
  ADDRESS_SUBCOLLECTION,
  STORE_ADDRESS_SUBCOLLECTION,
} from "@/db/schema";

type CollectionName =
  | "users"
  | "addresses"
  | "storeAddresses"
  | "categories"
  | "stores"
  | "products"
  | "orders"
  | "reviews"
  | "bids"
  | "coupons"
  | "carouselSlides"
  | "homepageSections"
  | "siteSettings"
  | "faqs"
  | "notifications"
  | "payouts"
  | "blogPosts"
  | "events"
  | "eventEntries"
  | "sessions"
  | "carts";

interface SeedRequest {
  action: "load" | "delete";
  collections?: CollectionName[];
}

const COLLECTION_MAP: Record<CollectionName, string> = {
  users: USER_COLLECTION,
  addresses: "addresses", // Subcollection under users
  storeAddresses: "storeAddresses", // Subcollection under stores
  categories: CATEGORIES_COLLECTION,
  stores: STORE_COLLECTION,
  products: PRODUCT_COLLECTION,
  orders: ORDER_COLLECTION,
  reviews: REVIEW_COLLECTION,
  bids: BID_COLLECTION,
  coupons: COUPONS_COLLECTION,
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
};

const SEED_DATA_MAP: Record<CollectionName, any[]> = {
  users: usersSeedData,
  addresses: addressesSeedData,
  storeAddresses: storeAddressesSeedData,
  categories: categoriesSeedData,
  stores: storesSeedData,
  products: productsSeedData,
  orders: ordersSeedData,
  reviews: reviewsSeedData,
  bids: bidsSeedData,
  coupons: couponsSeedData,
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
};

const PII_ENCRYPTED_COLLECTIONS = new Set<CollectionName>([
  "users",
  "addresses",
  "storeAddresses",
  "products",
  "orders",
  "reviews",
  "bids",
  "payouts",
  "eventEntries",
]);

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

export async function GET(_request: NextRequest) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      {
        success: false,
        message: "This API is only available in development mode",
      },
      { status: 403 },
    );
  }

  try {
    const db = getAdminDb();

    const collections = await Promise.all(
      (Object.keys(SEED_DATA_MAP) as CollectionName[]).map(async (colName) => {
        const seedData = SEED_DATA_MAP[colName];
        const seedCount = seedData.length;

        if (seedCount === 0) {
          return { name: colName, seedCount: 0, existingCount: 0 };
        }

        let existingCount = 0;

        try {
          if (colName === "addresses") {
            const refs = (seedData as any[])
              .filter((d) => d.userId && d.id)
              .map((d) =>
                db
                  .collection(USER_COLLECTION)
                  .doc(d.userId)
                  .collection(ADDRESS_SUBCOLLECTION)
                  .doc(d.id),
              );
            if (refs.length > 0) {
              const snaps = await db.getAll(...refs);
              existingCount = snaps.filter(
                (s: FirebaseFirestore.DocumentSnapshot) => s.exists,
              ).length;
            }
          } else if (colName === "storeAddresses") {
            const refs = (seedData as any[])
              .filter((d) => d.storeSlug && d.id)
              .map((d) =>
                db
                  .collection(STORE_COLLECTION)
                  .doc(d.storeSlug)
                  .collection(STORE_ADDRESS_SUBCOLLECTION)
                  .doc(d.id),
              );
            if (refs.length > 0) {
              const snaps = await db.getAll(...refs);
              existingCount = snaps.filter(
                (s: FirebaseFirestore.DocumentSnapshot) => s.exists,
              ).length;
            }
          } else if (colName === "siteSettings") {
            const snap = await db
              .collection(COLLECTION_MAP[colName])
              .doc("global")
              .get();
            existingCount = snap.exists ? 1 : 0;
          } else if (colName === "users") {
            const refs = (seedData as any[])
              .filter((d) => d.uid)
              .map((d) => db.collection(COLLECTION_MAP[colName]).doc(d.uid));
            if (refs.length > 0) {
              const snaps = await db.getAll(...refs);
              existingCount = snaps.filter(
                (s: FirebaseFirestore.DocumentSnapshot) => s.exists,
              ).length;
            }
          } else if (colName === "faqs") {
            // FAQs use generated IDs â€” build them the same way the POST handler does
            const { generateFAQId } = await import("@/utils");
            const refs = (seedData as any[]).map((faq: any) => {
              const id = generateFAQId({
                category: faq.category,
                question: faq.question,
              });
              return db.collection(COLLECTION_MAP[colName]).doc(id);
            });
            if (refs.length > 0) {
              const snaps = await db.getAll(...refs);
              existingCount = snaps.filter(
                (s: FirebaseFirestore.DocumentSnapshot) => s.exists,
              ).length;
            }
          } else {
            const refs = (seedData as any[])
              .filter((d) => d.id)
              .map((d) => db.collection(COLLECTION_MAP[colName]).doc(d.id));
            if (refs.length > 0) {
              const snaps = await db.getAll(...refs);
              existingCount = snaps.filter((s) => s.exists).length;
            }
          }
        } catch (err: unknown) {
          serverLogger.error(`Error checking status for ${colName}:`, err);
        }

        return { name: colName, seedCount, existingCount };
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
  // Double check environment
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      {
        success: false,
        message: "This API is only available in development mode",
      },
      { status: 403 },
    );
  }

  try {
    const body: SeedRequest = await request.json();
    const { action, collections } = body;

    if (!action || !["load", "delete"].includes(action)) {
      return NextResponse.json(
        { success: false, message: 'Invalid action. Use "load" or "delete".' },
        { status: 400 },
      );
    }

    const collectionsToProcess =
      collections || (Object.keys(COLLECTION_MAP) as CollectionName[]);
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

    let totalCreated = 0;
    let totalDeleted = 0;
    let totalSkipped = 0;
    let totalErrors = 0;
    const processedCollections: string[] = [];

    if (action === "load") {
      // Load seed data
      for (const collectionName of collectionsToProcess) {
        try {
          const firestoreCollection = COLLECTION_MAP[collectionName];
          const seedData = SEED_DATA_MAP[collectionName];

          if (!seedData || seedData.length === 0) {
            serverLogger.info(`âš ï¸ No seed data for ${collectionName}`);
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

                // Check if Firestore document already exists â€” skip if so
                const docRef = db.collection(firestoreCollection).doc(uid);
                const docSnapshot = await docRef.get();
                if (docSnapshot.exists) {
                  totalSkipped++;
                  continue;
                }

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
                }

                // Write new Firestore document â€” encrypt PII fields
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
                await docRef.set(docData);
                totalCreated++;
              } catch (err) {
                serverLogger.error(`Error seeding user ${userData.uid}:`, err);
                totalErrors++;
              }
            }
          } else if (collectionName === "addresses") {
            // Addresses are subcollection under users
            for (const addressData of seedData) {
              try {
                const { userId, id, ...data } = addressData as any;

                if (!userId || !id) {
                  serverLogger.error("Address missing userId or id");
                  totalErrors++;
                  continue;
                }

                // Skip if document already exists
                const docRef = db
                  .collection(USER_COLLECTION)
                  .doc(userId)
                  .collection(ADDRESS_SUBCOLLECTION)
                  .doc(id);
                const docSnapshot = await docRef.get();
                if (docSnapshot.exists) {
                  totalSkipped++;
                  continue;
                }

                await docRef.set(
                  encryptPiiFields(stripUndefined(data), [
                    ...ADDRESS_PII_FIELDS,
                  ]),
                );
                totalCreated++;
              } catch (err) {
                serverLogger.error(`Error seeding address:`, err);
                totalErrors++;
              }
            }
          } else if (collectionName === "storeAddresses") {
            // Store addresses are subcollection under stores
            for (const addressData of seedData) {
              try {
                const { storeSlug, id, ...data } = addressData as any;

                if (!storeSlug || !id) {
                  serverLogger.error("Store address missing storeSlug or id");
                  totalErrors++;
                  continue;
                }

                const docRef = db
                  .collection(STORE_COLLECTION)
                  .doc(storeSlug)
                  .collection(STORE_ADDRESS_SUBCOLLECTION)
                  .doc(id);
                const docSnapshot = await docRef.get();
                if (docSnapshot.exists) {
                  totalSkipped++;
                  continue;
                }

                await docRef.set(
                  encryptPiiFields(stripUndefined(data), [
                    ...ADDRESS_PII_FIELDS,
                  ]),
                );
                totalCreated++;
              } catch (err) {
                serverLogger.error(`Error seeding store address:`, err);
                totalErrors++;
              }
            }
          } else if (collectionName === "siteSettings") {
            // Site settings is a singleton document
            const settingsData = seedData[0];
            if (settingsData) {
              const docRef = db.collection(firestoreCollection).doc("global");
              const docSnapshot = await docRef.get();
              if (docSnapshot.exists) {
                totalSkipped++;
              } else {
                await docRef.set(stripUndefined(settingsData));
                totalCreated++;
              }
            }
          } else {
            // Regular collections â€” bulk-check existence then batch write (500 per batch)
            type WriteItem = {
              docRef: FirebaseFirestore.DocumentReference;
              data: Record<string, any>;
            };
            const items: WriteItem[] = [];

            // Phase 1: resolve document IDs
            for (const docData of seedData) {
              let { id, ...data } = docData as any;

              if (!id && collectionName === "faqs") {
                const { generateFAQId } = await import("@/utils");
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

              items.push({
                docRef: db.collection(firestoreCollection).doc(id),
                data: encryptSeedPii(
                  collectionName,
                  stripUndefined(data),
                  docData,
                ),
              });
            }

            if (items.length > 0) {
              // Phase 2: bulk existence check
              const snaps = await db.getAll(...items.map((i) => i.docRef));
              const toWrite = items.filter((_, idx) => !snaps[idx].exists);
              totalSkipped += items.length - toWrite.length;

              // Phase 3: batch write in chunks of 500
              const BATCH_LIMIT = 500;
              for (let i = 0; i < toWrite.length; i += BATCH_LIMIT) {
                const chunk = toWrite.slice(i, i + BATCH_LIMIT);
                const batch = db.batch();
                for (const { docRef, data } of chunk) {
                  batch.set(docRef, data);
                }
                await batch.commit();
                totalCreated += chunk.length;
              }
            }
          }

          processedCollections.push(collectionName);
        } catch (err) {
          serverLogger.error(
            `Error processing collection ${collectionName}:`,
            err,
          );
          totalErrors++;
        }
      }

      return NextResponse.json({
        success: true,
        data: {
          message: `Successfully loaded seed data. Created ${totalCreated}, skipped ${totalSkipped} (already exist).`,
          details: {
            created: totalCreated,
            skipped: totalSkipped,
            errors: totalErrors,
            collections: processedCollections,
          },
        },
      });
    } else if (action === "delete") {
      // Delete seed data by ID
      for (const collectionName of collectionsToProcess) {
        try {
          const firestoreCollection = COLLECTION_MAP[collectionName];
          const seedData = SEED_DATA_MAP[collectionName];

          if (!seedData || seedData.length === 0) {
            serverLogger.info(`âš ï¸ No seed data for ${collectionName}`);
            continue;
          }

          // Handle users collection (Auth + Firestore)
          if (collectionName === "users") {
            for (const userData of seedData) {
              try {
                const { uid } = userData as any;

                // Check if Auth user exists before deleting
                let authUserExists = false;
                try {
                  await auth.getUser(uid);
                  authUserExists = true;
                } catch (err: any) {
                  if (err.code !== "auth/user-not-found") {
                    serverLogger.error(`Error checking auth user ${uid}:`, err);
                  }
                }

                // Delete Auth user if exists
                if (authUserExists) {
                  try {
                    await auth.deleteUser(uid);
                  } catch (err: any) {
                    serverLogger.error(`Error deleting auth user ${uid}:`, err);
                  }
                }

                // Check if Firestore document exists before deleting
                const docRef = db.collection(firestoreCollection).doc(uid);
                const docSnapshot = await docRef.get();

                if (docSnapshot.exists) {
                  await docRef.delete();
                  totalDeleted++;
                } else {
                  totalSkipped++;
                }
              } catch (err) {
                serverLogger.error(`Error deleting user ${userData.uid}:`, err);
                totalErrors++;
              }
            }
          } else if (collectionName === "addresses") {
            // Addresses are subcollection under users
            for (const addressData of seedData) {
              try {
                const { userId, id } = addressData as any;

                if (!userId || !id) {
                  serverLogger.error("Address missing userId or id");
                  totalErrors++;
                  continue;
                }

                // Check if document exists before deleting
                const docRef = db
                  .collection(USER_COLLECTION)
                  .doc(userId)
                  .collection(ADDRESS_SUBCOLLECTION)
                  .doc(id);
                const docSnapshot = await docRef.get();

                if (docSnapshot.exists) {
                  await docRef.delete();
                  totalDeleted++;
                } else {
                  totalSkipped++;
                }
              } catch (err) {
                serverLogger.error(`Error deleting address:`, err);
                totalErrors++;
              }
            }
          } else if (collectionName === "storeAddresses") {
            // Store addresses are subcollection under stores
            for (const addressData of seedData) {
              try {
                const { storeSlug, id } = addressData as any;

                if (!storeSlug || !id) {
                  serverLogger.error("Store address missing storeSlug or id");
                  totalErrors++;
                  continue;
                }

                const docRef = db
                  .collection(STORE_COLLECTION)
                  .doc(storeSlug)
                  .collection(STORE_ADDRESS_SUBCOLLECTION)
                  .doc(id);
                const docSnapshot = await docRef.get();

                if (docSnapshot.exists) {
                  await docRef.delete();
                  totalDeleted++;
                } else {
                  totalSkipped++;
                }
              } catch (err) {
                serverLogger.error(`Error deleting store address:`, err);
                totalErrors++;
              }
            }
          } else if (collectionName === "siteSettings") {
            // Delete singleton document
            const docRef = db.collection(firestoreCollection).doc("global");
            const docSnapshot = await docRef.get();

            if (docSnapshot.exists) {
              await docRef.delete();
              totalDeleted++;
            } else {
              totalSkipped++;
            }
          } else {
            // Regular collections - delete by ID only
            for (const docData of seedData) {
              try {
                let { id } = docData as any;

                // Special handling for FAQs - generate ID if missing
                if (!id && collectionName === "faqs") {
                  const { generateFAQId } = await import("@/utils");
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
                  serverLogger.error(
                    `Document missing ID in ${collectionName}`,
                  );
                  totalErrors++;
                  continue;
                }

                // Check if document exists before deleting
                const docRef = db.collection(firestoreCollection).doc(id);
                const docSnapshot = await docRef.get();

                if (docSnapshot.exists) {
                  await docRef.delete();
                  totalDeleted++;
                } else {
                  totalSkipped++;
                }
              } catch (err) {
                serverLogger.error(
                  `Error deleting document ${docData.id} in ${collectionName}:`,
                  err,
                );
                totalErrors++;
              }
            }
          }

          processedCollections.push(collectionName);
        } catch (err) {
          serverLogger.error(
            `Error processing collection ${collectionName}:`,
            err,
          );
          totalErrors++;
        }
      }

      return NextResponse.json({
        success: true,
        data: {
          message: `Successfully deleted seed data. Removed ${totalDeleted} documents${totalSkipped > 0 ? `, skipped ${totalSkipped} (not found)` : ""}.`,
          details: {
            deleted: totalDeleted,
            skipped: totalSkipped,
            errors: totalErrors,
            collections: processedCollections,
          },
        },
      });
    }

    return NextResponse.json(
      { success: false, message: "Invalid action" },
      { status: 400 },
    );
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
