import { NextResponse } from "next/server";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { safeToISOString } from "@/lib/date-utils";

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
    const [
      categoriesSnapshot,
      usersSnapshot,
      shopsSnapshot,
      productsSnapshot,
      auctionsSnapshot,
      bidsSnapshot,
      ordersSnapshot,
      paymentsSnapshot,
      shipmentsSnapshot,
      reviewsSnapshot,
      heroSlidesSnapshot,
      favoritesSnapshot,
      cartsSnapshot,
      notificationsSnapshot,
    ] = await Promise.all([
      db
        .collection("categories")
        .where("name", ">=", DEMO_PREFIX)
        .where("name", "<", DEMO_PREFIX + "\uf8ff")
        .get(),
      db
        .collection("users")
        .where("name", ">=", DEMO_PREFIX)
        .where("name", "<", DEMO_PREFIX + "\uf8ff")
        .get(),
      db
        .collection("shops")
        .where("name", ">=", DEMO_PREFIX)
        .where("name", "<", DEMO_PREFIX + "\uf8ff")
        .get(),
      db
        .collection("products")
        .where("name", ">=", DEMO_PREFIX)
        .where("name", "<", DEMO_PREFIX + "\uf8ff")
        .get(),
      db
        .collection("auctions")
        .where("title", ">=", DEMO_PREFIX)
        .where("title", "<", DEMO_PREFIX + "\uf8ff")
        .get(),
      db
        .collection("bids")
        .where("bidderName", ">=", DEMO_PREFIX)
        .where("bidderName", "<", DEMO_PREFIX + "\uf8ff")
        .get(),
      db
        .collection("orders")
        .where("buyerName", ">=", DEMO_PREFIX)
        .where("buyerName", "<", DEMO_PREFIX + "\uf8ff")
        .get(),
      db
        .collection("payments")
        .where("transactionId", ">=", DEMO_PREFIX)
        .where("transactionId", "<", DEMO_PREFIX + "\uf8ff")
        .get(),
      db
        .collection("shipments")
        .where("trackingNumber", ">=", DEMO_PREFIX)
        .where("trackingNumber", "<", DEMO_PREFIX + "\uf8ff")
        .get(),
      db
        .collection("reviews")
        .where("user_name", ">=", DEMO_PREFIX)
        .where("user_name", "<", DEMO_PREFIX + "\uf8ff")
        .get(),
      db
        .collection("hero_slides")
        .where("title", ">=", DEMO_PREFIX)
        .where("title", "<", DEMO_PREFIX + "\uf8ff")
        .get(),
      db.collection("favorites").get(), // Favorites don't have DEMO_ prefix, count all for demo users
      db.collection("carts").get(), // Carts don't have DEMO_ prefix, count all for demo users
      db.collection("notifications").get(), // Notifications don't have DEMO_ prefix
    ]);

    const categories = categoriesSnapshot.size;
    const users = usersSnapshot.size;
    const shops = shopsSnapshot.size;
    const products = productsSnapshot.size;
    const auctions = auctionsSnapshot.size;
    const bids = bidsSnapshot.size;
    const orders = ordersSnapshot.size;
    const payments = paymentsSnapshot.size;
    const shipments = shipmentsSnapshot.size;
    const reviews = reviewsSnapshot.size;
    const heroSlides = heroSlidesSnapshot.size;
    const favorites = favoritesSnapshot.size;
    const carts = cartsSnapshot.size;
    const notifications = notificationsSnapshot.size;

    // Get the latest creation timestamp
    let latestCreatedAt = null;
    if (!categoriesSnapshot.empty) {
      const firstDoc = categoriesSnapshot.docs[0].data();
      latestCreatedAt =
        firstDoc.created_at?.toDate() || firstDoc.createdAt?.toDate();
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

    // Count settings collections
    const [
      siteSettings,
      paymentSettings,
      shippingZones,
      emailTemplates,
      featureFlags,
      homepageSettings,
    ] = await Promise.all([
      db.collection("site_settings").get(),
      db.collection("payment_settings").get(),
      db.collection("shipping_zones").get(),
      db.collection("email_templates").get(),
      db.collection("feature_flags").get(),
      db.collection("homepage_settings").get(),
    ]);

    const settings =
      siteSettings.size +
      paymentSettings.size +
      shippingZones.size +
      emailTemplates.size +
      featureFlags.size +
      homepageSettings.size;

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
          ? (safeToISOString(latestCreatedAt) ?? new Date().toISOString())
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
