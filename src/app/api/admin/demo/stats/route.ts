import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { COLLECTIONS } from "@/constants/database";
import { safeToISOString } from "@letitrip/react-library";
import { NextResponse } from "next/server";

// Disable caching for live stats
export const dynamic = "force-dynamic";
export const revalidate = 0;

const DEMO_PREFIX = "DEMO_";

/**
 * Get statistics for existing demo data with DEMO_ prefix
 * GET /api/admin/demo/stats
 */
export async function GET() {
  try {
    const db = getFirestoreAdmin();

    // Count documents with DEMO_ prefix in each collection
    // Use count queries instead of fetching all documents to reduce payload
    const [
      categoriesCount,
      usersCount,
      shopsCount,
      productsCount,
      auctionsCount,
      bidsCount,
      ordersCount,
      paymentsCount,
      shipmentsCount,
      reviewsCount,
      heroSlidesCount,
      favoritesCount,
      cartsCount,
      notificationsCount,
    ] = await Promise.all([
      db
        .collection(COLLECTIONS.CATEGORIES)
        .where("name", ">=", DEMO_PREFIX)
        .where("name", "<", DEMO_PREFIX + "\uf8ff")
        .count()
        .get(),
      db
        .collection(COLLECTIONS.USERS)
        .where("name", ">=", DEMO_PREFIX)
        .where("name", "<", DEMO_PREFIX + "\uf8ff")
        .count()
        .get(),
      db
        .collection(COLLECTIONS.SHOPS)
        .where("name", ">=", DEMO_PREFIX)
        .where("name", "<", DEMO_PREFIX + "\uf8ff")
        .count()
        .get(),
      db
        .collection(COLLECTIONS.PRODUCTS)
        .where("name", ">=", DEMO_PREFIX)
        .where("name", "<", DEMO_PREFIX + "\uf8ff")
        .count()
        .get(),
      db
        .collection(COLLECTIONS.AUCTIONS)
        .where("title", ">=", DEMO_PREFIX)
        .where("title", "<", DEMO_PREFIX + "\uf8ff")
        .count()
        .get(),
      db
        .collection(COLLECTIONS.BIDS)
        .where("bidderName", ">=", DEMO_PREFIX)
        .where("bidderName", "<", DEMO_PREFIX + "\uf8ff")
        .count()
        .get(),
      db
        .collection(COLLECTIONS.ORDERS)
        .where("buyerName", ">=", DEMO_PREFIX)
        .where("buyerName", "<", DEMO_PREFIX + "\uf8ff")
        .count()
        .get(),
      db
        .collection(COLLECTIONS.PAYMENTS)
        .where("transactionId", ">=", DEMO_PREFIX)
        .where("transactionId", "<", DEMO_PREFIX + "\uf8ff")
        .count()
        .get(),
      db
        .collection(COLLECTIONS.SHIPMENTS)
        .where("trackingNumber", ">=", DEMO_PREFIX)
        .where("trackingNumber", "<", DEMO_PREFIX + "\uf8ff")
        .count()
        .get(),
      db
        .collection(COLLECTIONS.REVIEWS)
        .where("user_name", ">=", DEMO_PREFIX)
        .where("user_name", "<", DEMO_PREFIX + "\uf8ff")
        .count()
        .get(),
      db
        .collection(COLLECTIONS.HERO_SLIDES)
        .where("title", ">=", DEMO_PREFIX)
        .where("title", "<", DEMO_PREFIX + "\uf8ff")
        .count()
        .get(),
      db.collection(COLLECTIONS.FAVORITES).count().get(),
      db.collection(COLLECTIONS.CARTS).count().get(),
      db.collection(COLLECTIONS.NOTIFICATIONS).count().get(),
    ]);

    const categories = categoriesCount.data().count;
    const users = usersCount.data().count;
    const shops = shopsCount.data().count;
    const products = productsCount.data().count;
    const auctions = auctionsCount.data().count;
    const bids = bidsCount.data().count;
    const orders = ordersCount.data().count;
    const payments = paymentsCount.data().count;
    const shipments = shipmentsCount.data().count;
    const reviews = reviewsCount.data().count;
    const heroSlides = heroSlidesCount.data().count;
    const favorites = favoritesCount.data().count;
    const carts = cartsCount.data().count;
    const notifications = notificationsCount.data().count;

    // Get the latest creation timestamp (fetch only 1 document for timestamp)
    let latestCreatedAt = null;
    if (categories > 0) {
      const latestDoc = await db
        .collection(COLLECTIONS.CATEGORIES)
        .where("name", ">=", DEMO_PREFIX)
        .where("name", "<", DEMO_PREFIX + "\uf8ff")
        .orderBy("name")
        .limit(1)
        .get();

      if (!latestDoc.empty) {
        const firstDoc = latestDoc.docs[0].data();
        latestCreatedAt =
          firstDoc.created_at?.toDate() || firstDoc.createdAt?.toDate();
      }
    }

    // Check if any demo data exists
    const hasData =
      categories > 0 || users > 0 || shops > 0 || products > 0 || auctions > 0;

    if (!hasData) {
      return NextResponse.json({
        exists: false,
        summary: null,
      });
    }

    // Count settings collections using count queries
    const [
      siteSettingsCount,
      paymentSettingsCount,
      shippingZonesCount,
      emailTemplatesCount,
      featureFlagsCount,
      homepageSettingsCount,
    ] = await Promise.all([
      db.collection(COLLECTIONS.SITE_SETTINGS).count().get(),
      db.collection(COLLECTIONS.PAYMENT_SETTINGS).count().get(),
      db.collection(COLLECTIONS.SHIPPING_ZONES).count().get(),
      db.collection(COLLECTIONS.EMAIL_TEMPLATES).count().get(),
      db.collection(COLLECTIONS.FEATURE_FLAGS).count().get(),
      db.collection(COLLECTIONS.HOMEPAGE_SETTINGS).count().get(),
    ]);

    const settings =
      siteSettingsCount.data().count +
      paymentSettingsCount.data().count +
      shippingZonesCount.data().count +
      emailTemplatesCount.data().count +
      featureFlagsCount.data().count +
      homepageSettingsCount.data().count;

    return NextResponse.json({
      exists: true,
      summary: {
        prefix: DEMO_PREFIX,
        categories,
        users,
        shops,
        products,
        auctions,
        bids,
        orders,
        payments,
        shipments,
        reviews,
        heroSlides,
        favorites,
        carts,
        notifications,
        settings,
        createdAt: latestCreatedAt
          ? safeToISOString(latestCreatedAt) ?? new Date().toISOString()
          : new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error("Demo stats fetch error:", error);
    return NextResponse.json(
      {
        exists: false,
        summary: null,
        error: error.message,
      },
      { status: 200 },
    );
  }
}
