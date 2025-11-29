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
      addresses: 0,
      blogPosts: 0,
      notifications: 0,
    };

    console.log("Starting test data cleanup...");

    // Helper function to delete documents in batches
    const deleteCollection = async (
      collectionName: string,
      whereField: string,
      statKey: keyof typeof stats,
    ) => {
      let totalDeleted = 0;
      let hasMore = true;

      while (hasMore) {
        const snapshot = await db
          .collection(collectionName)
          .where(whereField, ">=", PREFIX)
          .where(whereField, "<", PREFIX + "\uf8ff")
          .limit(500)
          .get();

        if (snapshot.empty) {
          hasMore = false;
          break;
        }

        const batch = db.batch();
        snapshot.docs.forEach((doc) => {
          batch.delete(doc.ref);
        });

        await batch.commit();
        totalDeleted += snapshot.docs.length;

        console.log(`Deleted ${snapshot.docs.length} from ${collectionName}`);

        if (snapshot.docs.length < 500) {
          hasMore = false;
        }
      }

      stats[statKey] = totalDeleted;
      console.log(`Total deleted from ${collectionName}: ${totalDeleted}`);
    };

    // Delete in reverse order of dependencies
    // Reviews depend on products and users
    await deleteCollection(COLLECTIONS.REVIEWS, "title", "reviews");

    // Orders depend on products and users
    await deleteCollection(COLLECTIONS.ORDERS, "order_number", "orders");

    // Support tickets depend on users
    await deleteCollection(COLLECTIONS.SUPPORT_TICKETS, "subject", "tickets");

    // Bids depend on auctions and users
    const bidsSnapshot = await db.collection("bids").limit(1000).get();

    if (!bidsSnapshot.empty) {
      const batch = db.batch();
      let count = 0;

      for (const doc of bidsSnapshot.docs) {
        const data = doc.data();
        // Delete if user_id or auction_id starts with TEST_
        if (
          (data.user_id && data.user_id.startsWith(PREFIX)) ||
          (data.auction_id && data.auction_id.startsWith(PREFIX))
        ) {
          batch.delete(doc.ref);
          count++;
        }
      }

      if (count > 0) {
        await batch.commit();
        stats.bids = count;
        console.log(`Deleted ${count} bids`);
      }
    }

    // Coupons depend on shops
    await deleteCollection(COLLECTIONS.COUPONS, "code", "coupons");

    // Hero slides
    await deleteCollection(COLLECTIONS.HERO_SLIDES, "id", "heroSlides");

    // Auctions depend on shops
    await deleteCollection(COLLECTIONS.AUCTIONS, "name", "auctions");

    // Products depend on shops
    await deleteCollection(COLLECTIONS.PRODUCTS, "name", "products");

    // Addresses depend on users
    const addressesSnapshot = await db
      .collection(COLLECTIONS.ADDRESSES)
      .limit(1000)
      .get();

    if (!addressesSnapshot.empty) {
      const batch = db.batch();
      let count = 0;

      for (const doc of addressesSnapshot.docs) {
        const data = doc.data();
        // Delete if name starts with TEST_
        if (data.name && data.name.startsWith(PREFIX)) {
          batch.delete(doc.ref);
          count++;
        }
      }

      if (count > 0) {
        await batch.commit();
        stats.addresses = count;
        console.log(`Deleted ${count} addresses`);
      }
    }

    // Blog posts
    if (db.collection(COLLECTIONS.BLOG_POSTS)) {
      await deleteCollection(COLLECTIONS.BLOG_POSTS, "title", "blogPosts");
    }

    // Notifications
    const notificationsSnapshot = await db
      .collection("notifications")
      .limit(1000)
      .get();

    if (!notificationsSnapshot.empty) {
      const batch = db.batch();
      let count = 0;

      for (const doc of notificationsSnapshot.docs) {
        const data = doc.data();
        // Delete if related to test users
        if (data.user_id && data.user_id.startsWith(PREFIX)) {
          batch.delete(doc.ref);
          count++;
        }
      }

      if (count > 0) {
        await batch.commit();
        stats.notifications = count;
        console.log(`Deleted ${count} notifications`);
      }
    }

    // Shops depend on users
    await deleteCollection(COLLECTIONS.SHOPS, "name", "shops");

    // Categories - independent
    await deleteCollection(COLLECTIONS.CATEGORIES, "name", "categories");

    // Users - should be deleted last
    await deleteCollection(COLLECTIONS.USERS, "email", "users");

    const totalDeleted = Object.values(stats).reduce(
      (sum, count) => sum + count,
      0,
    );
    console.log(`Cleanup complete. Total items deleted: ${totalDeleted}`);

    return NextResponse.json({
      success: true,
      deleted: stats,
      totalDeleted,
      message: `Successfully deleted ${totalDeleted} test items`,
    });
  } catch (error: any) {
    console.error("Error cleaning up test data:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to cleanup data" },
      { status: 500 },
    );
  }
}
