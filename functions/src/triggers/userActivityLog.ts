import * as admin from "firebase-admin";
import type { Change, EventContext } from "firebase-functions/v1";
import * as functions from "firebase-functions/v1";
import type { DocumentSnapshot } from "firebase-functions/v1/firestore";

const db = admin.firestore();

/**
 * Firestore trigger: Track user activity across multiple collections
 * Logs user actions for analytics and personalization
 */
export const onProductView = functions.firestore
  .document("productViews/{viewId}")
  .onCreate(async (snapshot: DocumentSnapshot, context: EventContext) => {
    const viewData = snapshot.data();

    if (!viewData) return null;

    const { userId, productId, categoryId } = viewData as {
      userId: string;
      productId: string;
      categoryId?: string;
    };

    if (!userId || userId === "anonymous") return null;

    const batch = db.batch();

    try {
      // 1. Log activity to user's subcollection
      const activityRef = db
        .collection("users")
        .doc(userId)
        .collection("activityLog")
        .doc();

      batch.set(activityRef, {
        type: "product_view",
        productId,
        categoryId,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });

      // 2. Update user preferences based on category
      if (categoryId) {
        const userRef = db.collection("users").doc(userId);
        batch.update(userRef, {
          [`preferences.categories.${categoryId}`]:
            admin.firestore.FieldValue.increment(1),
          "preferences.lastActivityAt":
            admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }

      // 3. Update product view count
      const productRef = db.collection("products").doc(productId);
      batch.update(productRef, {
        viewCount: admin.firestore.FieldValue.increment(1),
        lastViewedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      await batch.commit();
      return null;
    } catch (error) {
      console.error("Error in onProductView:", error);
      return null;
    }
  });

/**
 * Firestore trigger: Track search queries
 */
export const onSearchQuery = functions.firestore
  .document("searchQueries/{queryId}")
  .onCreate(async (snapshot: DocumentSnapshot, context: EventContext) => {
    const queryData = snapshot.data();

    if (!queryData) return null;

    const { userId, query, filters, resultsCount } = queryData as {
      userId: string;
      query: string;
      filters?: any;
      resultsCount: number;
    };

    if (!userId || userId === "anonymous") return null;

    try {
      // Log search activity
      await db.collection("users").doc(userId).collection("activityLog").add({
        type: "search",
        query,
        filters,
        resultsCount,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Update user preferences if category filter was used
      if (filters?.categoryId) {
        await db
          .collection("users")
          .doc(userId)
          .update({
            [`preferences.searchCategories.${filters.categoryId}`]:
              admin.firestore.FieldValue.increment(1),
            "preferences.lastActivityAt":
              admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
      }

      return null;
    } catch (error) {
      console.error("Error in onSearchQuery:", error);
      return null;
    }
  });

/**
 * Firestore trigger: Track purchases for recommendations
 */
export const onOrderComplete = functions.firestore
  .document("orders/{orderId}")
  .onUpdate(async (change: Change<DocumentSnapshot>, context: EventContext) => {
    const before = change.before.data();
    const after = change.after.data();

    if (!before || !after) return null;

    // Only track when order is delivered
    if (after.status !== "delivered" || before.status === "delivered") {
      return null;
    }

    const { buyerId, items } = after as {
      buyerId: string;
      items: any[];
      totalAmount: number;
    };
    const batch = db.batch();

    try {
      // 1. Log purchase activity
      const activityRef = db
        .collection("users")
        .doc(buyerId)
        .collection("activityLog")
        .doc();

      batch.set(activityRef, {
        type: "purchase",
        orderId: context.params.orderId,
        items: items.map((item: any) => ({
          productId: item.productId,
          categoryId: item.categoryId,
          price: item.price,
        })),
        totalAmount: after.totalAmount,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });

      // 2. Update user preferences based on purchased categories
      const userRef = db.collection("users").doc(buyerId);
      const categoryPurchases: Record<string, number> = {};

      items.forEach((item: any) => {
        if (item.categoryId) {
          categoryPurchases[item.categoryId] =
            (categoryPurchases[item.categoryId] || 0) + 1;
        }
      });

      const updateData: any = {
        "preferences.lastPurchaseAt":
          admin.firestore.FieldValue.serverTimestamp(),
        "metrics.totalPurchases": admin.firestore.FieldValue.increment(1),
        "metrics.totalSpent": admin.firestore.FieldValue.increment(
          after.totalAmount
        ),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      Object.entries(categoryPurchases).forEach(([categoryId, count]) => {
        updateData[`preferences.purchasedCategories.${categoryId}`] =
          admin.firestore.FieldValue.increment(count);
      });

      batch.update(userRef, updateData);

      await batch.commit();
      return null;
    } catch (error) {
      console.error("Error in onOrderComplete:", error);
      return null;
    }
  });

/**
 * Scheduled function: Aggregate user activity data daily
 * Runs at 2 AM IST every day
 */
export const aggregateUserActivity = functions.pubsub
  .schedule("0 2 * * *")
  .timeZone("Asia/Kolkata")
  .onRun(async (context: EventContext) => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    try {
      // Get all users with recent activity
      const usersSnapshot = await db
        .collection("users")
        .where("preferences.lastActivityAt", ">=", yesterday)
        .limit(500)
        .get();

      const promises = usersSnapshot.docs.map(async (userDoc) => {
        const userId = userDoc.id;

        // Aggregate activity from yesterday
        const activitySnapshot = await db
          .collection("users")
          .doc(userId)
          .collection("activityLog")
          .where("timestamp", ">=", yesterday)
          .where("timestamp", "<", today)
          .get();

        const stats = {
          views: 0,
          searches: 0,
          purchases: 0,
          bids: 0,
        };

        activitySnapshot.docs.forEach((doc) => {
          const type = doc.data().type;
          if (type === "product_view") stats.views++;
          if (type === "search") stats.searches++;
          if (type === "purchase") stats.purchases++;
          if (type === "bid") stats.bids++;
        });

        // Store daily aggregate
        return db
          .collection("users")
          .doc(userId)
          .collection("dailyStats")
          .doc(yesterday.toISOString().split("T")[0])
          .set({
            date: admin.firestore.Timestamp.fromDate(yesterday),
            ...stats,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
          });
      });

      await Promise.all(promises);

      console.log(`Aggregated activity for ${usersSnapshot.size} users`);
      return null;
    } catch (error) {
      console.error("Error in aggregateUserActivity:", error);
      throw error;
    }
  });
