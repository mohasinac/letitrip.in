import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/app/api/lib/session";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";

export async function POST(request: NextRequest) {
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

    // Track deletion counts
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

    // Delete test products
    const productsSnapshot = await db
      .collection("products")
      .where("name", ">=", "TEST_")
      .where("name", "<", "TEST_\uf8ff")
      .get();

    for (const doc of productsSnapshot.docs) {
      await doc.ref.delete();
      counts.products++;
    }

    // Delete test auctions
    const auctionsSnapshot = await db
      .collection("auctions")
      .where("title", ">=", "TEST_AUCT_")
      .where("title", "<", "TEST_AUCT_\uf8ff")
      .get();

    for (const doc of auctionsSnapshot.docs) {
      await doc.ref.delete();
      counts.auctions++;
    }

    // Delete test orders
    const ordersSnapshot = await db
      .collection("orders")
      .where("orderNumber", ">=", "TEST_ORD_")
      .where("orderNumber", "<", "TEST_ORD_\uf8ff")
      .get();

    for (const doc of ordersSnapshot.docs) {
      await doc.ref.delete();
      counts.orders++;
    }

    // Delete test reviews
    const reviewsSnapshot = await db
      .collection("reviews")
      .where("comment", ">=", "TEST_")
      .where("comment", "<", "TEST_\uf8ff")
      .get();

    for (const doc of reviewsSnapshot.docs) {
      await doc.ref.delete();
      counts.reviews++;
    }

    // Delete test tickets (including messages subcollection)
    const ticketsSnapshot = await db
      .collection("support_tickets")
      .where("subject", ">=", "TEST_")
      .where("subject", "<", "TEST_\uf8ff")
      .get();

    for (const doc of ticketsSnapshot.docs) {
      // Delete messages subcollection
      const messagesSnapshot = await doc.ref.collection("messages").get();
      for (const msgDoc of messagesSnapshot.docs) {
        await msgDoc.ref.delete();
      }
      await doc.ref.delete();
      counts.tickets++;
    }

    // Delete test shops
    const shopsSnapshot = await db
      .collection("shops")
      .where("name", ">=", "TEST_SHOP_")
      .where("name", "<", "TEST_SHOP_\uf8ff")
      .get();

    for (const doc of shopsSnapshot.docs) {
      await doc.ref.delete();
      counts.shops++;
    }

    // Delete test coupons
    const couponsSnapshot = await db
      .collection("coupons")
      .where("code", ">=", "TEST_COUP_")
      .where("code", "<", "TEST_COUP_\uf8ff")
      .get();

    for (const doc of couponsSnapshot.docs) {
      await doc.ref.delete();
      counts.coupons++;
    }

    // Delete test categories
    const categoriesSnapshot = await db
      .collection("categories")
      .where("name", ">=", "TEST_CAT_")
      .where("name", "<", "TEST_CAT_\uf8ff")
      .get();

    for (const doc of categoriesSnapshot.docs) {
      await doc.ref.delete();
      counts.categories++;
    }

    return NextResponse.json({
      success: true,
      data: counts,
      message: "Test data cleaned successfully"
    });
  } catch (error: any) {
    console.error("Error cleaning test data:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to clean test data" },
      { status: 500 }
    );
  }
}
