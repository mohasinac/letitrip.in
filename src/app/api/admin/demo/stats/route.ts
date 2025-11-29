import { NextResponse } from "next/server";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { safeToISOString } from "@/lib/date-utils";

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
