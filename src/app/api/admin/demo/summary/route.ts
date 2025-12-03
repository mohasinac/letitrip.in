import { NextResponse } from "next/server";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { COLLECTIONS } from "@/constants/database";

export async function GET() {
  try {
    const db = getFirestoreAdmin();

    // Get all unique demo sessions from categories
    const categoriesSnapshot = await db
      .collection(COLLECTIONS.CATEGORIES)
      .where("demoSession", "!=", null)
      .select("demoSession", "createdAt")
      .get();

    if (categoriesSnapshot.empty) {
      return NextResponse.json({
        sessions: [],
        total: 0,
      });
    }

    const sessionsMap = new Map<string, Date>();

    categoriesSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.demoSession && !sessionsMap.has(data.demoSession)) {
        sessionsMap.set(
          data.demoSession,
          data.createdAt?.toDate() || new Date(),
        );
      }
    });

    // Get summary for each session
    const summaries = await Promise.all(
      Array.from(sessionsMap.keys()).map(async (sessionId) => {
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
        ] = await Promise.all([
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
          db
            .collection(COLLECTIONS.PAYMENTS)
            .where("demoSession", "==", sessionId)
            .count()
            .get(),
          db
            .collection(COLLECTIONS.SHIPMENTS)
            .where("demoSession", "==", sessionId)
            .count()
            .get(),
        ]);

        return {
          sessionId,
          categories: categoriesCount.data().count,
          users: usersCount.data().count,
          shops: shopsCount.data().count,
          products: productsCount.data().count,
          auctions: auctionsCount.data().count,
          bids: bidsCount.data().count,
          orders: ordersCount.data().count,
          orderItems: 0,
          payments: paymentsCount.data().count,
          shipments: shipmentsCount.data().count,
          reviews: 0,
          createdAt: sessionsMap.get(sessionId)!.toISOString(),
        };
      }),
    );

    // Sort by newest first
    summaries.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    return NextResponse.json({
      sessions: summaries,
      total: summaries.length,
    });
  } catch (error: any) {
    console.error("Summary fetch error:", error);
    return NextResponse.json(
      {
        sessions: [],
        total: 0,
        error: error.message,
      },
      { status: 200 },
    );
  }
}
