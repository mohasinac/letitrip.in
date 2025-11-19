import { NextResponse } from "next/server";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const db = getFirestoreAdmin();
    const { sessionId } = await params;

    // Count documents by demo session
    const [categories, users, shops, products, auctions, bids, orders] =
      await Promise.all([
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
        db
          .collection("bids")
          .where("demoSession", "==", sessionId)
          .count()
          .get(),
        db
          .collection("orders")
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
