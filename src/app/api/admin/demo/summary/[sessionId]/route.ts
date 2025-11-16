import { NextRequest, NextResponse } from "next/server";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const db = getFirestoreAdmin();
    const { sessionId } = await params;

    // Fetch counts
    const [
      categoriesSnap,
      usersSnap,
      shopsSnap,
      productsSnap,
      auctionsSnap,
      bidsSnap,
      ordersSnap,
      paymentsSnap,
      shipmentsSnap,
    ] = await Promise.all([
      db
        .collection("categories")
        .where("demoSession", "==", sessionId)
        .count()
        .get(),
      db
        .collection("users")
        .where("demoSession", "==", sessionId)
        .count()
        .get(),
      db
        .collection("shops")
        .where("demoSession", "==", sessionId)
        .count()
        .get(),
      db
        .collection("products")
        .where("demoSession", "==", sessionId)
        .count()
        .get(),
      db
        .collection("auctions")
        .where("demoSession", "==", sessionId)
        .count()
        .get(),
      db.collection("bids").where("demoSession", "==", sessionId).count().get(),
      db
        .collection("orders")
        .where("demoSession", "==", sessionId)
        .count()
        .get(),
      db
        .collection("payments")
        .where("demoSession", "==", sessionId)
        .count()
        .get(),
      db
        .collection("shipments")
        .where("demoSession", "==", sessionId)
        .count()
        .get(),
    ]);

    // Get creation date
    const firstCategory = await db
      .collection("categories")
      .where("demoSession", "==", sessionId)
      .limit(1)
      .get();

    const createdAt = firstCategory.empty
      ? new Date().toISOString()
      : firstCategory.docs[0].data().createdAt?.toDate().toISOString();

    return NextResponse.json({
      categories: categoriesSnap.data().count,
      users: usersSnap.data().count,
      shops: shopsSnap.data().count,
      products: productsSnap.data().count,
      auctions: auctionsSnap.data().count,
      bids: bidsSnap.data().count,
      orders: ordersSnap.data().count,
      payments: paymentsSnap.data().count,
      shipments: shipmentsSnap.data().count,
      reviews: 0,
      sessionId,
      createdAt,
    });
  } catch (error: any) {
    console.error("Summary fetch error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
