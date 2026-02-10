import { NextRequest, NextResponse } from "next/server";
import { getAdminDb, getAdminAuth } from "@/lib/firebase/admin";
import {
  usersSeedData,
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
} from "../../../../../scripts/seed-data";
import {
  USER_COLLECTION,
  PRODUCT_COLLECTION,
  ORDER_COLLECTION,
  REVIEW_COLLECTION,
  BID_COLLECTION,
  COUPONS_COLLECTION,
  CAROUSEL_SLIDES_COLLECTION,
  HOMEPAGE_SECTIONS_COLLECTION,
  SITE_SETTINGS_COLLECTION,
  FAQS_COLLECTION,
  CATEGORIES_COLLECTION,
} from "@/db/schema";

type CollectionName =
  | "users"
  | "categories"
  | "products"
  | "orders"
  | "reviews"
  | "bids"
  | "coupons"
  | "carouselSlides"
  | "homepageSections"
  | "siteSettings"
  | "faqs";

interface SeedRequest {
  action: "load" | "delete";
  collections?: CollectionName[];
}

const COLLECTION_MAP: Record<CollectionName, string> = {
  users: USER_COLLECTION,
  categories: CATEGORIES_COLLECTION,
  products: PRODUCT_COLLECTION,
  orders: ORDER_COLLECTION,
  reviews: REVIEW_COLLECTION,
  bids: BID_COLLECTION,
  coupons: COUPONS_COLLECTION,
  carouselSlides: CAROUSEL_SLIDES_COLLECTION,
  homepageSections: HOMEPAGE_SECTIONS_COLLECTION,
  siteSettings: SITE_SETTINGS_COLLECTION,
  faqs: FAQS_COLLECTION,
};

const SEED_DATA_MAP: Record<CollectionName, any[]> = {
  users: usersSeedData,
  categories: categoriesSeedData,
  products: productsSeedData,
  orders: ordersSeedData,
  reviews: reviewsSeedData,
  bids: bidsSeedData,
  coupons: couponsSeedData,
  carouselSlides: carouselSlidesSeedData,
  homepageSections: homepageSectionsSeedData,
  siteSettings: [siteSettingsSeedData], // Wrap singleton in array
  faqs: faqSeedData,
};

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

    let totalCreated = 0;
    let totalUpdated = 0;
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
            console.log(`⚠️ No seed data for ${collectionName}`);
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

                // Check if user exists in Auth
                let userExists = false;
                try {
                  await auth.getUser(uid);
                  userExists = true;
                } catch (error: any) {
                  if (error.code !== "auth/user-not-found") {
                    throw error;
                  }
                }

                // Create or update Auth user
                // Note: Firebase Auth validates photoURL and rejects null/empty strings
                const authUserData: any = {
                  email,
                  phoneNumber,
                  displayName,
                  emailVerified,
                  disabled,
                };

                // Only include photoURL if it's a valid non-empty string
                if (
                  photoURL &&
                  typeof photoURL === "string" &&
                  photoURL.trim() !== ""
                ) {
                  authUserData.photoURL = photoURL;
                }

                if (userExists) {
                  await auth.updateUser(uid, authUserData);
                } else {
                  await auth.createUser({
                    uid,
                    ...authUserData,
                    password: "TempPass123!", // Default password for demo
                  });
                }

                // Check if Firestore document exists
                const docRef = db.collection(firestoreCollection).doc(uid);
                const docSnapshot = await docRef.get();
                const docExists = docSnapshot.exists;

                // Upsert Firestore document
                const docData = { ...userData };
                if (docData.createdAt instanceof Date) {
                  docData.createdAt = docData.createdAt;
                }
                if (docData.updatedAt instanceof Date) {
                  docData.updatedAt = docData.updatedAt;
                }

                await docRef.set(docData, { merge: true });

                if (docExists) {
                  totalUpdated++;
                } else {
                  totalCreated++;
                }
              } catch (err) {
                console.error(`Error seeding user ${userData.uid}:`, err);
                totalErrors++;
              }
            }
          } else if (collectionName === "siteSettings") {
            // Site settings is a singleton document
            const settingsData = seedData[0];
            if (settingsData) {
              const docRef = db.collection(firestoreCollection).doc("global");
              const docSnapshot = await docRef.get();
              const exists = docSnapshot.exists;

              await docRef.set(settingsData, { merge: true });

              if (exists) {
                totalUpdated++;
              } else {
                totalCreated++;
              }
            }
          } else {
            // Regular collections
            for (const docData of seedData) {
              try {
                let { id, ...data } = docData as any;

                // Special handling for FAQs - generate ID if missing
                if (!id && collectionName === "faqs") {
                  const { generateFAQId } = await import("@/utils");
                  id = generateFAQId({
                    category: (docData as any).category,
                    question: (docData as any).question,
                  });
                  if (!id) {
                    console.error(
                      `Failed to generate ID for FAQ: ${(docData as any).question}`,
                    );
                    totalErrors++;
                    continue;
                  }
                } else if (!id) {
                  console.error(`Document missing ID in ${collectionName}`);
                  totalErrors++;
                  continue;
                }

                // Check if document exists
                const docRef = db.collection(firestoreCollection).doc(id);
                const docSnapshot = await docRef.get();
                const exists = docSnapshot.exists;

                // Convert Date objects properly
                const processedData = { ...data };
                Object.keys(processedData).forEach((key) => {
                  if (processedData[key] instanceof Date) {
                    processedData[key] = processedData[key];
                  }
                });

                // Upsert document
                await docRef.set(processedData, { merge: true });

                if (exists) {
                  totalUpdated++;
                } else {
                  totalCreated++;
                }
              } catch (err) {
                console.error(
                  `Error seeding document in ${collectionName}:`,
                  err,
                );
                totalErrors++;
              }
            }
          }

          processedCollections.push(collectionName);
        } catch (err) {
          console.error(`Error processing collection ${collectionName}:`, err);
          totalErrors++;
        }
      }

      return NextResponse.json({
        success: true,
        message: `Successfully loaded seed data. Created ${totalCreated}, updated ${totalUpdated} documents.`,
        details: {
          created: totalCreated,
          updated: totalUpdated,
          errors: totalErrors,
          collections: processedCollections,
        },
      });
    } else if (action === "delete") {
      // Delete seed data by ID
      for (const collectionName of collectionsToProcess) {
        try {
          const firestoreCollection = COLLECTION_MAP[collectionName];
          const seedData = SEED_DATA_MAP[collectionName];

          if (!seedData || seedData.length === 0) {
            console.log(`⚠️ No seed data for ${collectionName}`);
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
                    console.error(`Error checking auth user ${uid}:`, err);
                  }
                }

                // Delete Auth user if exists
                if (authUserExists) {
                  try {
                    await auth.deleteUser(uid);
                  } catch (err: any) {
                    console.error(`Error deleting auth user ${uid}:`, err);
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
                console.error(`Error deleting user ${userData.uid}:`, err);
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
                    console.error(
                      `Failed to generate ID for FAQ: ${(docData as any).question}`,
                    );
                    totalErrors++;
                    continue;
                  }
                } else if (!id) {
                  console.error(`Document missing ID in ${collectionName}`);
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
                console.error(
                  `Error deleting document ${docData.id} in ${collectionName}:`,
                  err,
                );
                totalErrors++;
              }
            }
          }

          processedCollections.push(collectionName);
        } catch (err) {
          console.error(`Error processing collection ${collectionName}:`, err);
          totalErrors++;
        }
      }

      return NextResponse.json({
        success: true,
        message: `Successfully deleted seed data. Removed ${totalDeleted} documents${totalSkipped > 0 ? `, skipped ${totalSkipped} (not found)` : ""}.`,
        details: {
          deleted: totalDeleted,
          skipped: totalSkipped,
          errors: totalErrors,
          collections: processedCollections,
        },
      });
    }

    return NextResponse.json(
      { success: false, message: "Invalid action" },
      { status: 400 },
    );
  } catch (error) {
    console.error("Seed API error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "An error occurred",
      },
      { status: 500 },
    );
  }
}
