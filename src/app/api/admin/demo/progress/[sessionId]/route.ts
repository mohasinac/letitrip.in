import { NextResponse } from "next/server";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { COLLECTIONS } from "@/constants/database";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  try {
    const db = getFirestoreAdmin();
    const { sessionId } = await params;

    // Count documents by demo session
    const [categories, users, shops, products, auctions, bids, orders] =
      await Promise.all([
        db
          .collection(COLLECTIONS.CATEGORIES)
          .where("demoSession", "==", sessionId)
          .count()
          .get(),
        db
          .collection(COLLECTIONS.USERS)
          .where("demoSession", "==", sessionId)
          .count()
          .get(),
        db
          .collection(COLLECTIONS.SHOPS)
          .where("demoSession", "==", sessionId)
          .count()
          .get(),
        db
          .collection(COLLECTIONS.PRODUCTS)
          .where("demoSession", "==", sessionId)
          .count()
          .get(),
        db
          .collection(COLLECTIONS.AUCTIONS)
          .where("demoSession", "==", sessionId)
          .count()
          .get(),
        db
          .collection(COLLECTIONS.BIDS)
          .where("demoSession", "==", sessionId)
          .count()
          .get(),
        db
          .collection(COLLECTIONS.ORDERS)
          .where("demoSession", "==", sessionId)
          .count()
          .get(),
      ]);

    const progress = {
      categories: categories.data().count,
      users: users.data().count,
      shops: shops.data().count,
      products: products.data().count,
      auctions: auctions.data().count,
      bids: bids.data().count,
      orders: orders.data().count,
      total: 261, // Expected total
      current:
        categories.data().count +
        users.data().count +
        shops.data().count +
        products.data().count +
        auctions.data().count +
        bids.data().count +
        orders.data().count,
      percentage: 0,
      status: "in_progress",
    };

    progress.percentage = Math.round((progress.current / progress.total) * 100);
    progress.status = progress.percentage >= 100 ? "completed" : "in_progress";

    return NextResponse.json(progress);
  } catch (error: any) {
    console.error("Progress fetch error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
