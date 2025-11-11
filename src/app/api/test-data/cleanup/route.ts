import { NextResponse } from "next/server";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { COLLECTIONS } from "@/constants/database";

const PREFIX = "TEST_";

export async function POST() {
  try {
    const db = getFirestoreAdmin();
    const stats = {
      users: 0,
      shops: 0,
      categories: 0,
      products: 0,
      auctions: 0,
      reviews: 0,
      orders: 0,
      tickets: 0,
      coupons: 0,
      heroSlides: 0,
      bids: 0,
    };

    // Delete in reverse order of dependencies
    const collections = [
      "bids",
      "auto_bids",
      "reviews",
      "orders",
      "support_tickets",
      "coupons",
      "hero_slides",
      "auctions",
      "products",
      "shops",
      "categories",
      "users",
    ];

    for (const collection of collections) {
      const snapshot = await db
        .collection(collection)
        .where("name", ">=", PREFIX)
        .where("name", "<", PREFIX + "\uf8ff")
        .limit(500)
        .get();

      const batch = db.batch();
      let count = 0;

      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
        count++;
      });

      if (count > 0) {
        await batch.commit();
        stats[collection as keyof typeof stats] = count;
      }
    }

    // Also delete by email pattern for users
    const userSnapshot = await db
      .collection(COLLECTIONS.USERS)
      .where("email", ">=", PREFIX)
      .where("email", "<", PREFIX + "\uf8ff")
      .limit(500)
      .get();

    if (userSnapshot.docs.length > 0) {
      const batch = db.batch();
      userSnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      stats.users += userSnapshot.docs.length;
    }

    // Also delete hero slides by id pattern
    const heroSlidesSnapshot = await db
      .collection(COLLECTIONS.HERO_SLIDES)
      .where("id", ">=", PREFIX)
      .where("id", "<", PREFIX + "\uf8ff")
      .limit(500)
      .get();

    if (heroSlidesSnapshot.docs.length > 0) {
      const batch = db.batch();
      heroSlidesSnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      stats.heroSlides = heroSlidesSnapshot.docs.length;
    }

    return NextResponse.json({ success: true, deleted: stats });
  } catch (error: any) {
    console.error("Error cleaning up test data:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to cleanup data" },
      { status: 500 }
    );
  }
}
