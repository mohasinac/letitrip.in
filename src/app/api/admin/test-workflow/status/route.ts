import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/app/api/lib/session";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";

export async function GET(request: NextRequest) {
  try {
    // Check authentication and admin role
    const user = await getCurrentUser(request);
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get Firestore instance
    const db = getFirestoreAdmin();

    // Count test data across all collections
    const counts = {
      products: 0,
      auctions: 0,
      orders: 0,
      reviews: 0,
      tickets: 0,
      shops: 0,
      coupons: 0,
      categories: 0,
    };

    // Count test products
    const productsSnapshot = await db
      .collection("products")
      .where("name", ">=", "TEST_")
      .where("name", "<", "TEST_\uf8ff")
      .get();
    counts.products = productsSnapshot.size;

    // Count test auctions
    const auctionsSnapshot = await db
      .collection("auctions")
      .where("title", ">=", "TEST_AUCT_")
      .where("title", "<", "TEST_AUCT_\uf8ff")
      .get();
    counts.auctions = auctionsSnapshot.size;

    // Count test orders
    const ordersSnapshot = await db
      .collection("orders")
      .where("orderNumber", ">=", "TEST_ORD_")
      .where("orderNumber", "<", "TEST_ORD_\uf8ff")
      .get();
    counts.orders = ordersSnapshot.size;

    // Count test reviews
    const reviewsSnapshot = await db
      .collection("reviews")
      .where("comment", ">=", "TEST_")
      .where("comment", "<", "TEST_\uf8ff")
      .get();
    counts.reviews = reviewsSnapshot.size;

    // Count test tickets
    const ticketsSnapshot = await db
      .collection("support_tickets")
      .where("subject", ">=", "TEST_")
      .where("subject", "<", "TEST_\uf8ff")
      .get();
    counts.tickets = ticketsSnapshot.size;

    // Count test shops
    const shopsSnapshot = await db
      .collection("shops")
      .where("name", ">=", "TEST_SHOP_")
      .where("name", "<", "TEST_SHOP_\uf8ff")
      .get();
    counts.shops = shopsSnapshot.size;

    // Count test coupons
    const couponsSnapshot = await db
      .collection("coupons")
      .where("code", ">=", "TEST_COUP_")
      .where("code", "<", "TEST_COUP_\uf8ff")
      .get();
    counts.coupons = couponsSnapshot.size;

    // Count test categories
    const categoriesSnapshot = await db
      .collection("categories")
      .where("name", ">=", "TEST_CAT_")
      .where("name", "<", "TEST_CAT_\uf8ff")
      .get();
    counts.categories = categoriesSnapshot.size;

    return NextResponse.json({ success: true, data: counts });
  } catch (error: any) {
    console.error("Error getting test data status:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to get status" },
      { status: 500 }
    );
  }
}
