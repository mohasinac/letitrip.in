/**
 * Firebase Functions for JustForView.in
 *
 * Scheduled Functions:
 * - processAuctions: Runs every minute to process ended auctions
 * - rebuildCategoryTree: Runs every hour to rebuild category tree cache
 *
 * Trigger Functions:
 * - onCategoryWrite: Rebuilds tree when categories are modified
 */

import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";
import {notificationService} from "./services/notification.service";

// Initialize Firebase Admin
admin.initializeApp();

const db = admin.firestore();

/**
 * Scheduled function to process ended auctions
 * Runs every minute
 * Optimized with batch processing and resource limits
 */
// Get service account from config or use default
const serviceAccount =
  functions.config().service_account?.email ||
  "letitrip-in-app@appspot.gserviceaccount.com";

export const processAuctions = functions
  .region("asia-south1") // Mumbai region
  .runWith({
    timeoutSeconds: 540, // 9 minutes max
    memory: "1GB",
    minInstances: 0, // Cold start OK for FREE tier
    maxInstances: 3, // Limit concurrent executions to control costs
    serviceAccount,
  })
  .pubsub.schedule("every 1 minutes")
  .timeZone("Asia/Kolkata")
  .onRun(async () => {
    const startTime = Date.now();
    console.log("[Auction Cron] Starting auction processing...");

    try {
      const results = await processEndedAuctions();

      const duration = Date.now() - startTime;
      console.log(`[Auction Cron] Completed in ${duration}ms`);

      // Log performance metrics
      if (duration > 8000) {
        console.warn(
          `[Auction Cron] SLOW EXECUTION: ${duration}ms (threshold: 8000ms)`,
        );
      }

      return {
        success: true,
        duration,
        processed: results.processed,
        successful: results.successful,
        failed: results.failed,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("[Auction Cron] Error processing auctions:", error);

      // Log error but don't throw to avoid function retries
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      };
    }
  });

/**
 * HTTP function to manually trigger auction processing
 * Requires authentication
 */
export const triggerAuctionProcessing = functions
  .region("asia-south1")
  .runWith({
    timeoutSeconds: 540,
    memory: "1GB",
  })
  .https.onCall(async (_data, context) => {
    // Check authentication
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "User must be authenticated",
      );
    }

    // Check if user is admin
    const userDoc = await db.collection("users").doc(context.auth.uid).get();
    const user = userDoc.data();

    if (!user || user.role !== "admin") {
      throw new functions.https.HttpsError(
        "permission-denied",
        "Admin access required",
      );
    }

    console.log("[Auction Cron] Manual trigger by admin:", context.auth.uid);

    try {
      await processEndedAuctions();

      return {
        success: true,
        message: "Auction processing completed",
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("[Auction Cron] Error in manual trigger:", error);
      throw new functions.https.HttpsError(
        "internal",
        error instanceof Error ? error.message : String(error),
      );
    }
  });

/**
 * Process all ended auctions with batch processing
 */
async function processEndedAuctions(): Promise<{
  processed: number;
  successful: number;
  failed: number;
}> {
  const now = admin.firestore.Timestamp.now();

  // Get all live auctions that have ended (limit to 50 per run)
  const snapshot = await db
    .collection("auctions")
    .where("status", "==", "live")
    .where("end_time", "<=", now)
    .limit(50)
    .get();

  console.log(`[Auction Cron] Found ${snapshot.size} auctions to process`);

  if (snapshot.empty) {
    return {processed: 0, successful: 0, failed: 0};
  }

  // Process each ended auction in batches
  const promises = snapshot.docs.map((doc) => closeAuction(doc.id));
  const results = await Promise.allSettled(promises);

  // Log results
  const successful = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.filter((r) => r.status === "rejected").length;

  console.log(
    `[Auction Cron] Processed ${snapshot.size}: ${successful} successful, ${failed} failed`,
  );

  // Log failures
  results.forEach((result, index) => {
    if (result.status === "rejected") {
      console.error(
        `[Auction Cron] Failed to process auction ${snapshot.docs[index].id}:`,
        result.reason,
      );
    }
  });

  return {
    processed: snapshot.size,
    successful,
    failed,
  };
}

/**
 * Close an auction and determine winner
 */
async function closeAuction(auctionId: string): Promise<void> {
  console.log(`[Auction Cron] Closing auction ${auctionId}`);

  const auctionRef = db.collection("auctions").doc(auctionId);
  const auctionDoc = await auctionRef.get();

  if (!auctionDoc.exists) {
    console.error(`[Auction Cron] Auction ${auctionId} not found`);
    return;
  }

  const auction = auctionDoc.data() as Record<string, unknown>;

  // Find highest bid
  const bidsSnapshot = await db
    .collection("bids")
    .where("auction_id", "==", auctionId)
    .orderBy("amount", "desc")
    .limit(1)
    .get();

  if (bidsSnapshot.empty) {
    // No bids - mark as ended with no winner
    await auctionRef.update({
      status: "ended",
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log(`[Auction Cron] Auction ${auctionId} ended with no bids`);

    // Notify seller (no winner)
    try {
      const sellerDoc = await db
        .collection("users")
        .doc(auction.seller_id as string)
        .get();
      const seller = sellerDoc.data();

      if (seller) {
        await notificationService.notifySellerNoBids({
          auctionId,
          auctionName: auction.name as string,
          auctionSlug: auction.slug as string,
          auctionImage:
            Array.isArray(auction.images) && auction.images.length > 0 ?
              (auction.images[0] as string) :
              undefined,
          startingBid: auction.starting_bid as number,
          reservePrice: auction.reserve_price ?
            (auction.reserve_price as number) :
            undefined,
          seller: {
            email: seller.email as string,
            name: (seller.name as string) || (seller.email as string),
          },
        });
        console.log(
          `[Auction Cron] Notified seller of no-bid auction: ${auction.seller_id}`,
        );
      }
    } catch (error) {
      console.error("[Auction Cron] Error notifying seller:", error);
    }

    return;
  }

  const winningBid = bidsSnapshot.docs[0].data() as Record<string, unknown>;
  const winnerId = winningBid.user_id as string;
  const finalBid = winningBid.amount as number;

  // Check if reserve price was met
  if (auction.reserve_price && finalBid < (auction.reserve_price as number)) {
    // Reserve not met
    await auctionRef.update({
      status: "ended",
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log(
      `[Auction Cron] Auction ${auctionId} ended - reserve price not met`,
    );

    // Notify seller and highest bidder
    try {
      const [sellerDoc, bidderDoc] = await Promise.all([
        db
          .collection("users")
          .doc(auction.seller_id as string)
          .get(),
        db.collection("users").doc(winnerId).get(),
      ]);

      const seller = sellerDoc.data();
      const bidder = bidderDoc.data();

      if (seller && bidder) {
        await notificationService.notifyReserveNotMet({
          auctionId,
          auctionName: auction.name as string,
          auctionSlug: auction.slug as string,
          auctionImage:
            Array.isArray(auction.images) && auction.images.length > 0 ?
              (auction.images[0] as string) :
              undefined,
          startingBid: auction.starting_bid as number,
          reservePrice: auction.reserve_price as number,
          finalBid,
          seller: {
            email: seller.email as string,
            name: (seller.name as string) || (seller.email as string),
          },
          bidder: {
            email: bidder.email as string,
            name: (bidder.name as string) || (bidder.email as string),
          },
        });
        console.log(
          "[Auction Cron] Notified seller and bidder of reserve not met",
        );
      }
    } catch (error) {
      console.error("[Auction Cron] Error notifying users:", error);
    }

    return;
  }

  // Winner! Update auction
  await auctionRef.update({
    status: "ended",
    winner_id: winnerId,
    final_bid: finalBid,
    updated_at: admin.firestore.FieldValue.serverTimestamp(),
  });

  console.log(
    `[Auction Cron] Auction ${auctionId} won by user ${winnerId} for ₹${finalBid}`,
  );

  // Create order for winner
  await createWinnerOrder(auction, auctionId, winnerId, finalBid);

  // Add to won_auctions collection
  await db.collection("won_auctions").add({
    auction_id: auctionId,
    user_id: winnerId,
    shop_id: auction.shop_id,
    final_bid: finalBid,
    name: auction.name,
    slug: auction.slug,
    images: auction.images || [],
    won_at: admin.firestore.FieldValue.serverTimestamp(),
    order_created: true,
  });

  // Notify winner and seller
  try {
    const [sellerDoc, winnerDoc] = await Promise.all([
      db
        .collection("users")
        .doc(auction.seller_id as string)
        .get(),
      db.collection("users").doc(winnerId).get(),
    ]);

    const seller = sellerDoc.data();
    const winner = winnerDoc.data();

    if (seller && winner) {
      await notificationService.notifyAuctionWon({
        auctionId,
        auctionName: auction.name as string,
        auctionSlug: auction.slug as string,
        auctionImage:
          Array.isArray(auction.images) && auction.images.length > 0 ?
            (auction.images[0] as string) :
            undefined,
        startingBid: auction.starting_bid as number,
        finalBid,
        seller: {
          email: seller.email as string,
          name: (seller.name as string) || (seller.email as string),
        },
        winner: {
          email: winner.email as string,
          name: (winner.name as string) || (winner.email as string),
        },
      });
      console.log(
        "[Auction Cron] Notified winner and seller of auction completion",
      );
    }
  } catch (error) {
    console.error("[Auction Cron] Error notifying winner/seller:", error);
  }

  // Update product inventory if linked
  if (auction.product_id && typeof auction.product_id === "string") {
    await updateInventory(auction.product_id);
  }
}

/**
 * Create order for auction winner
 */
async function createWinnerOrder(
  auction: Record<string, unknown>,
  auctionId: string,
  winnerId: string,
  finalBid: number,
): Promise<void> {
  try {
    // Get winner details
    const winnerDoc = await db.collection("users").doc(winnerId).get();
    const winner = winnerDoc.data() as Record<string, unknown>;

    if (!winner) {
      console.error(`[Auction Cron] Winner ${winnerId} not found`);
      return;
    }

    // Get default shipping address
    const addressesSnapshot = await db
      .collection("addresses")
      .where("user_id", "==", winnerId)
      .where("is_default", "==", true)
      .limit(1)
      .get();

    let shippingAddress = null;
    if (!addressesSnapshot.empty) {
      shippingAddress = {
        id: addressesSnapshot.docs[0].id,
        ...addressesSnapshot.docs[0].data(),
      };
    }

    // Create order
    const orderId = `ORD-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)
      .toUpperCase()}`;

    const orderData = {
      order_id: orderId,
      user_id: winnerId,
      user_email: winner.email,
      user_name: winner.name || winner.email,
      shop_id: auction.shop_id,

      // Order items (single auction item)
      items: [
        {
          type: "auction",
          auction_id: auctionId,
          name: auction.name,
          slug: auction.slug,
          price: finalBid,
          quantity: 1,
          images: auction.images || [],
          subtotal: finalBid,
        },
      ],

      // Pricing
      subtotal: finalBid,
      discount: 0,
      shipping_fee: 0, // Free shipping for auctions
      tax: Math.round(finalBid * 0.18), // 18% GST
      total: Math.round(finalBid * 1.18),

      // Addresses
      shipping_address: shippingAddress,
      billing_address: shippingAddress,

      // Payment
      payment_method: "pending", // Winner needs to complete payment
      payment_status: "pending",

      // Status
      order_status: "pending",
      fulfillment_status: "unfulfilled",

      // Metadata
      source: "auction",
      notes: `Order created automatically for auction win: ${auction.name}`,

      created_at: admin.firestore.FieldValue.serverTimestamp(),
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    };

    await db.collection("orders").add(orderData);

    console.log(
      `[Auction Cron] Created order ${orderId} for winner ${winnerId}`,
    );
  } catch (error) {
    console.error("[Auction Cron] Error creating winner order:", error);
  }
}

/**
 * Update product inventory after auction ends
 */
async function updateInventory(productId: string): Promise<void> {
  try {
    const productRef = db.collection("products").doc(productId);
    const productDoc = await productRef.get();

    if (productDoc.exists) {
      const product = productDoc.data() as Record<string, unknown>;
      const newStock = Math.max(0, ((product.stock as number) || 0) - 1);

      await productRef.update({
        stock: newStock,
        status: newStock === 0 ? "out_of_stock" : product.status,
        updated_at: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log(
        `[Auction Cron] Updated inventory for product ${productId}: ${newStock} remaining`,
      );
    }
  } catch (error) {
    console.error("[Auction Cron] Error updating inventory:", error);
  }
}

// ============================================================================
// CATEGORY TREE FUNCTIONS
// ============================================================================

interface CategoryNode {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  icon?: string;
  parentIds: string[];
  level: number;
  productCount: number;
  auctionCount: number;
  isActive: boolean;
  sortOrder: number;
  children: CategoryNode[];
  ancestors: Array<{ id: string; name: string; slug: string }>;
  path: string; // Full path like "Electronics > Phones > Smartphones"
}

interface CategoryTreeCache {
  tree: CategoryNode[];
  flat: Record<string, Omit<CategoryNode, "children">>;
  roots: string[];
  leaves: string[];
  totalCount: number;
  maxDepth: number;
  updatedAt: admin.firestore.Timestamp;
  version: number;
}

/**
 * Scheduled function to rebuild category tree cache
 * Runs every hour to keep the cache fresh
 */
export const rebuildCategoryTree = functions
  .region("asia-south1")
  .runWith({
    timeoutSeconds: 120,
    memory: "512MB",
    minInstances: 0,
    maxInstances: 1,
    serviceAccount,
  })
  .pubsub.schedule("every 60 minutes")
  .timeZone("Asia/Kolkata")
  .onRun(async () => {
    console.log("[Category Tree] Starting scheduled rebuild...");

    try {
      const result = await buildAndSaveCategoryTree();
      console.log(`[Category Tree] Scheduled rebuild complete: ${result.totalCount} categories`);
      return result;
    } catch (error) {
      console.error("[Category Tree] Scheduled rebuild failed:", error);
      return {success: false, error: String(error)};
    }
  });

/**
 * Firestore trigger to rebuild tree when categories change
 */
export const onCategoryWrite = functions
  .region("asia-south1")
  .runWith({
    timeoutSeconds: 120,
    memory: "512MB",
  })
  .firestore.document("categories/{categoryId}")
  .onWrite(async (change, context) => {
    console.log(`[Category Tree] Category ${context.params.categoryId} changed, triggering rebuild...`);

    // Debounce: Only rebuild if last update was more than 5 seconds ago
    const cacheRef = db.collection("cache").doc("category_tree");
    const cacheDoc = await cacheRef.get();

    if (cacheDoc.exists) {
      const cache = cacheDoc.data() as CategoryTreeCache;
      const lastUpdate = cache.updatedAt?.toDate();
      if (lastUpdate && Date.now() - lastUpdate.getTime() < 5000) {
        console.log("[Category Tree] Skipping rebuild - too recent");
        return;
      }
    }

    try {
      await buildAndSaveCategoryTree();
      console.log("[Category Tree] Trigger rebuild complete");
    } catch (error) {
      console.error("[Category Tree] Trigger rebuild failed:", error);
    }
  });

/**
 * HTTP callable function to manually rebuild category tree
 */
export const triggerCategoryTreeRebuild = functions
  .region("asia-south1")
  .runWith({
    timeoutSeconds: 120,
    memory: "512MB",
  })
  .https.onCall(async (_data, context) => {
    // Require authentication
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "User must be authenticated",
      );
    }

    // Only admins can manually rebuild
    const userDoc = await db.collection("users").doc(context.auth.uid).get();
    const user = userDoc.data();

    if (!user || user.role !== "admin") {
      throw new functions.https.HttpsError(
        "permission-denied",
        "Admin access required",
      );
    }

    console.log("[Category Tree] Manual rebuild triggered by:", context.auth.uid);

    try {
      const result = await buildAndSaveCategoryTree();
      return {
        success: true,
        ...result,
      };
    } catch (error) {
      console.error("[Category Tree] Manual rebuild failed:", error);
      throw new functions.https.HttpsError(
        "internal",
        error instanceof Error ? error.message : String(error),
      );
    }
  });

/**
 * Build the complete category tree and save to cache
 */
async function buildAndSaveCategoryTree(): Promise<{
  totalCount: number;
  rootCount: number;
  leafCount: number;
  maxDepth: number;
}> {
  console.log("[Category Tree] Building tree structure...");

  // Fetch all categories
  const categoriesSnapshot = await db
    .collection("categories")
    .where("isActive", "==", true)
    .get();

  if (categoriesSnapshot.empty) {
    console.log("[Category Tree] No active categories found");

    // Save empty cache
    await db.collection("cache").doc("category_tree").set({
      tree: [],
      flat: {},
      roots: [],
      leaves: [],
      totalCount: 0,
      maxDepth: 0,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      version: Date.now(),
    });

    return {totalCount: 0, rootCount: 0, leafCount: 0, maxDepth: 0};
  }

  // Build flat map first
  const categoryMap = new Map<string, any>();
  const childrenMap = new Map<string, string[]>();

  categoriesSnapshot.docs.forEach((doc) => {
    const data = doc.data();
    categoryMap.set(doc.id, {
      id: doc.id,
      ...data,
    });

    // Build parent -> children mapping
    const parentIds = data.parentIds || (data.parentId ? [data.parentId] : []);
    parentIds.forEach((parentId: string) => {
      if (!childrenMap.has(parentId)) {
        childrenMap.set(parentId, []);
      }
      childrenMap.get(parentId)!.push(doc.id);
    });
  });

  // Find root categories (no parents)
  const rootIds: string[] = [];
  categoryMap.forEach((cat, id) => {
    const parentIds = cat.parentIds || (cat.parentId ? [cat.parentId] : []);
    if (parentIds.length === 0 || parentIds.every((pid: string) => !categoryMap.has(pid))) {
      rootIds.push(id);
    }
  });

  // Build tree recursively
  function buildNode(
    catId: string,
    level: number,
    ancestors: Array<{id: string; name: string; slug: string}>,
  ): CategoryNode {
    const cat = categoryMap.get(catId)!;
    const childIds = childrenMap.get(catId) || [];

    const currentAncestors = [
      ...ancestors,
      {id: catId, name: cat.name, slug: cat.slug},
    ];

    const children = childIds
      .map((childId) => buildNode(childId, level + 1, currentAncestors))
      .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));

    const path = [...ancestors.map((a) => a.name), cat.name].join(" > ");

    return {
      id: catId,
      name: cat.name,
      slug: cat.slug,
      description: cat.description || "",
      image: cat.image || "",
      icon: cat.icon || "",
      parentIds: cat.parentIds || (cat.parentId ? [cat.parentId] : []),
      level,
      productCount: cat.productCount || 0,
      auctionCount: cat.auctionCount || 0,
      isActive: cat.isActive !== false,
      sortOrder: cat.sortOrder || 0,
      children,
      ancestors: ancestors,
      path,
    };
  }

  // Build full tree
  const tree = rootIds
    .map((rootId) => buildNode(rootId, 0, []))
    .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));

  // Build flat map without children for quick lookups
  const flat: Record<string, Omit<CategoryNode, "children">> = {};
  function flattenNode(node: CategoryNode) {
    const {children, ...rest} = node;
    flat[node.id] = rest;
    children.forEach(flattenNode);
  }
  tree.forEach(flattenNode);

  // Find leaf nodes (no children)
  const leaves: string[] = [];
  function findLeaves(node: CategoryNode) {
    if (node.children.length === 0) {
      leaves.push(node.id);
    } else {
      node.children.forEach(findLeaves);
    }
  }
  tree.forEach(findLeaves);

  // Calculate max depth
  function getMaxDepth(nodes: CategoryNode[], currentDepth: number): number {
    if (nodes.length === 0) return currentDepth;
    return Math.max(...nodes.map((n) => getMaxDepth(n.children, currentDepth + 1)));
  }
  const maxDepth = tree.length > 0 ? getMaxDepth(tree, 0) : 0;

  // Save to cache
  const cacheData: CategoryTreeCache = {
    tree,
    flat,
    roots: rootIds,
    leaves,
    totalCount: categoryMap.size,
    maxDepth,
    updatedAt: admin.firestore.Timestamp.now(),
    version: Date.now(),
  };

  await db.collection("cache").doc("category_tree").set(cacheData);

  console.log(
    `[Category Tree] Saved tree with ${categoryMap.size} categories, ` +
    `${rootIds.length} roots, ${leaves.length} leaves, depth ${maxDepth}`,
  );

  return {
    totalCount: categoryMap.size,
    rootCount: rootIds.length,
    leafCount: leaves.length,
    maxDepth,
  };
}

// ============================================================================
// ORDER STATUS TRIGGER FUNCTIONS
// ============================================================================

/**
 * Firestore trigger for order status changes
 * Sends notifications when order status changes
 */
export const onOrderStatusChange = functions
  .region("asia-south1")
  .runWith({
    timeoutSeconds: 60,
    memory: "256MB",
  })
  .firestore.document("orders/{orderId}")
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    const {orderId} = context.params;

    // Skip if status hasn't changed
    if (before.status === after.status && before.order_status === after.order_status) {
      return;
    }

    const newStatus = after.status || after.order_status;
    const oldStatus = before.status || before.order_status;

    console.log(`[Order Trigger] Order ${orderId} status changed: ${oldStatus} -> ${newStatus}`);

    try {
      // Create notification for the user
      const notificationData = {
        userId: after.user_id,
        type: "order_status",
        title: getOrderStatusTitle(newStatus),
        message: getOrderStatusMessage(newStatus, after.order_id || orderId),
        orderId: orderId,
        read: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      await db.collection("notifications").add(notificationData);
      console.log(`[Order Trigger] Created notification for user ${after.user_id}`);

      // If order is confirmed, notify seller
      if (newStatus === "confirmed" && after.shop_id) {
        const shopDoc = await db.collection("shops").doc(after.shop_id).get();
        const shop = shopDoc.data();
        if (shop?.owner_id) {
          await db.collection("notifications").add({
            userId: shop.owner_id,
            type: "new_order",
            title: "New Order Received",
            message: `You have a new order #${after.order_id || orderId} to fulfill.`,
            orderId: orderId,
            read: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
          });
          console.log(`[Order Trigger] Notified seller ${shop.owner_id} of new order`);
        }
      }

      // If order is delivered, schedule review request
      if (newStatus === "delivered") {
        // Create a delayed notification for review request (could be enhanced with scheduled functions)
        await db.collection("notifications").add({
          userId: after.user_id,
          type: "review_request",
          title: "How was your order?",
          message: "Your order has been delivered. Would you like to leave a review?",
          orderId: orderId,
          read: false,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        console.log(`[Order Trigger] Created review request notification for order ${orderId}`);
      }
    } catch (error) {
      console.error(`[Order Trigger] Error processing order ${orderId}:`, error);
    }
  });

/**
 * Get human-readable title for order status
 */
function getOrderStatusTitle(status: string): string {
  const titles: Record<string, string> = {
    pending: "Order Pending",
    confirmed: "Order Confirmed",
    processing: "Order Processing",
    shipped: "Order Shipped",
    delivered: "Order Delivered",
    cancelled: "Order Cancelled",
    refunded: "Order Refunded",
  };
  return titles[status] || `Order ${status}`;
}

/**
 * Get human-readable message for order status
 */
function getOrderStatusMessage(status: string, orderId: string): string {
  const messages: Record<string, string> = {
    pending: `Your order #${orderId} is pending confirmation.`,
    confirmed: `Great news! Your order #${orderId} has been confirmed and is being prepared.`,
    processing: `Your order #${orderId} is being processed.`,
    shipped: `Your order #${orderId} has been shipped and is on its way!`,
    delivered: `Your order #${orderId} has been delivered. Enjoy!`,
    cancelled: `Your order #${orderId} has been cancelled.`,
    refunded: `Your order #${orderId} has been refunded.`,
  };
  return messages[status] || `Your order #${orderId} status has been updated to ${status}.`;
}

// ============================================================================
// PAYMENT STATUS TRIGGER FUNCTIONS
// ============================================================================

/**
 * Firestore trigger for payment status changes
 * Auto-confirms orders when payment succeeds
 */
export const onPaymentStatusChange = functions
  .region("asia-south1")
  .runWith({
    timeoutSeconds: 60,
    memory: "256MB",
  })
  .firestore.document("payments/{paymentId}")
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    const {paymentId} = context.params;

    // Skip if payment status hasn't changed
    if (before.status === after.status) {
      return;
    }

    console.log(`[Payment Trigger] Payment ${paymentId} status changed: ${before.status} -> ${after.status}`);

    try {
      // If payment is successful, update order status to confirmed
      if (after.status === "completed" || after.status === "success" || after.status === "paid") {
        if (after.order_id) {
          const orderRef = db.collection("orders").doc(after.order_id);
          const orderDoc = await orderRef.get();

          if (orderDoc.exists) {
            const order = orderDoc.data();
            // Only update if order is still pending
            if (order?.status === "pending" || order?.order_status === "pending") {
              await orderRef.update({
                status: "confirmed",
                order_status: "confirmed",
                payment_status: "paid",
                paid_at: admin.firestore.FieldValue.serverTimestamp(),
                updated_at: admin.firestore.FieldValue.serverTimestamp(),
              });
              console.log(`[Payment Trigger] Auto-confirmed order ${after.order_id}`);
            }
          }
        }
      }

      // If payment failed, notify user
      if (after.status === "failed") {
        if (after.user_id) {
          await db.collection("notifications").add({
            userId: after.user_id,
            type: "payment_failed",
            title: "Payment Failed",
            message: "Your payment could not be processed. Please try again.",
            paymentId: paymentId,
            orderId: after.order_id,
            read: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
          });
          console.log(`[Payment Trigger] Notified user ${after.user_id} of payment failure`);
        }
      }
    } catch (error) {
      console.error(`[Payment Trigger] Error processing payment ${paymentId}:`, error);
    }
  });

// ============================================================================
// RETURN STATUS TRIGGER FUNCTIONS
// ============================================================================

/**
 * Firestore trigger for return request status changes
 * Handles notifications and refund processing
 */
export const onReturnStatusChange = functions
  .region("asia-south1")
  .runWith({
    timeoutSeconds: 60,
    memory: "256MB",
  })
  .firestore.document("returns/{returnId}")
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    const {returnId} = context.params;

    // Skip if status hasn't changed
    if (before.status === after.status) {
      return;
    }

    console.log(`[Return Trigger] Return ${returnId} status changed: ${before.status} -> ${after.status}`);

    try {
      // Create notification for the user
      const notificationData = {
        userId: after.user_id,
        type: "return_status",
        title: getReturnStatusTitle(after.status),
        message: getReturnStatusMessage(after.status, returnId),
        returnId: returnId,
        orderId: after.order_id,
        read: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      await db.collection("notifications").add(notificationData);
      console.log(`[Return Trigger] Created notification for user ${after.user_id}`);

      // If return is approved, notify seller
      if (after.status === "approved" && after.shop_id) {
        const shopDoc = await db.collection("shops").doc(after.shop_id).get();
        const shop = shopDoc.data();
        if (shop?.owner_id) {
          await db.collection("notifications").add({
            userId: shop.owner_id,
            type: "return_approved",
            title: "Return Request Approved",
            message: `Return request #${returnId} has been approved. Please process the return.`,
            returnId: returnId,
            read: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
          });
          console.log(`[Return Trigger] Notified seller ${shop.owner_id} of approved return`);
        }
      }

      // If return is completed/refunded, update inventory
      if (after.status === "refunded" || after.status === "completed") {
        // Restore inventory for returned items
        if (after.items && Array.isArray(after.items)) {
          for (const item of after.items) {
            if (item.product_id) {
              const productRef = db.collection("products").doc(item.product_id);
              await productRef.update({
                stock: admin.firestore.FieldValue.increment(item.quantity || 1),
                updated_at: admin.firestore.FieldValue.serverTimestamp(),
              });
              console.log(`[Return Trigger] Restored ${item.quantity || 1} units to product ${item.product_id}`);
            }
          }
        }
      }
    } catch (error) {
      console.error(`[Return Trigger] Error processing return ${returnId}:`, error);
    }
  });

/**
 * Get human-readable title for return status
 */
function getReturnStatusTitle(status: string): string {
  const titles: Record<string, string> = {
    pending: "Return Request Received",
    approved: "Return Approved",
    rejected: "Return Rejected",
    processing: "Return Processing",
    shipped: "Return Shipped",
    received: "Return Received",
    refunded: "Refund Completed",
    completed: "Return Completed",
  };
  return titles[status] || `Return ${status}`;
}

/**
 * Get human-readable message for return status
 */
function getReturnStatusMessage(status: string, returnId: string): string {
  const messages: Record<string, string> = {
    pending: `Your return request #${returnId} has been received and is pending review.`,
    approved: `Your return request #${returnId} has been approved. Please ship the item back.`,
    rejected: `Your return request #${returnId} has been rejected. Please contact support for more information.`,
    processing: `Your return #${returnId} is being processed.`,
    shipped: `Your return #${returnId} shipment has been recorded.`,
    received: `We have received your returned item for #${returnId}.`,
    refunded: `Your refund for return #${returnId} has been processed.`,
    completed: `Your return #${returnId} has been completed.`,
  };
  return messages[status] || `Your return #${returnId} status has been updated to ${status}.`;
}

// ============================================================================
// TICKET STATUS TRIGGER FUNCTIONS
// ============================================================================

/**
 * Firestore trigger for support ticket status changes
 */
export const onTicketStatusChange = functions
  .region("asia-south1")
  .runWith({
    timeoutSeconds: 60,
    memory: "256MB",
  })
  .firestore.document("support_tickets/{ticketId}")
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    const {ticketId} = context.params;

    // Skip if status hasn't changed
    if (before.status === after.status) {
      return;
    }

    console.log(`[Ticket Trigger] Ticket ${ticketId} status changed: ${before.status} -> ${after.status}`);

    try {
      const userId = after.userId || after.user_id;
      if (!userId) {
        console.warn(`[Ticket Trigger] No user ID found for ticket ${ticketId}`);
        return;
      }

      // Create notification for the user
      await db.collection("notifications").add({
        userId: userId,
        type: "ticket_status",
        title: getTicketStatusTitle(after.status),
        message: getTicketStatusMessage(after.status, ticketId),
        ticketId: ticketId,
        read: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log(`[Ticket Trigger] Created notification for user ${userId}`);
    } catch (error) {
      console.error(`[Ticket Trigger] Error processing ticket ${ticketId}:`, error);
    }
  });

/**
 * Get human-readable title for ticket status
 */
function getTicketStatusTitle(status: string): string {
  const titles: Record<string, string> = {
    open: "Ticket Opened",
    in_progress: "Ticket In Progress",
    waiting_on_customer: "Response Needed",
    resolved: "Ticket Resolved",
    closed: "Ticket Closed",
  };
  return titles[status] || `Ticket ${status}`;
}

/**
 * Get human-readable message for ticket status
 */
function getTicketStatusMessage(status: string, ticketId: string): string {
  const messages: Record<string, string> = {
    open: `Your support ticket #${ticketId} has been opened.`,
    in_progress: `Your support ticket #${ticketId} is now being worked on by our team.`,
    waiting_on_customer: `We need more information for ticket #${ticketId}. Please check and respond.`,
    resolved: `Your support ticket #${ticketId} has been resolved.`,
    closed: `Your support ticket #${ticketId} has been closed.`,
  };
  return messages[status] || `Your ticket #${ticketId} status has been updated to ${status}.`;
}

// ============================================================================
// NEW BID TRIGGER FUNCTIONS
// ============================================================================

/**
 * Firestore trigger for new bids
 * Sends outbid notifications to previous highest bidder
 */
export const onNewBid = functions
  .region("asia-south1")
  .runWith({
    timeoutSeconds: 60,
    memory: "256MB",
  })
  .firestore.document("bids/{bidId}")
  .onCreate(async (snapshot, context) => {
    const bid = snapshot.data();
    const {bidId} = context.params;

    console.log(`[Bid Trigger] New bid ${bidId} on auction ${bid.auction_id}`);

    try {
      // Get auction details
      const auctionRef = db.collection("auctions").doc(bid.auction_id);
      const auctionDoc = await auctionRef.get();

      if (!auctionDoc.exists) {
        console.warn(`[Bid Trigger] Auction ${bid.auction_id} not found`);
        return;
      }

      const auction = auctionDoc.data() as Record<string, unknown>;
      const previousHighestBidderId = auction.highest_bidder_id as string | undefined;

      // Update auction with new highest bid
      await auctionRef.update({
        current_bid: bid.amount,
        highest_bidder_id: bid.user_id,
        bid_count: admin.firestore.FieldValue.increment(1),
        updated_at: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Notify previous highest bidder if they were outbid
      if (previousHighestBidderId && previousHighestBidderId !== bid.user_id) {
        await db.collection("notifications").add({
          userId: previousHighestBidderId,
          type: "outbid",
          title: "You've Been Outbid!",
          message: `Someone placed a higher bid of ₹${bid.amount.toLocaleString("en-IN")} on "${auction.name}".`,
          auctionId: bid.auction_id,
          read: false,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        console.log(`[Bid Trigger] Notified previous bidder ${previousHighestBidderId} of outbid`);
      }

      // Notify seller of new bid
      const sellerId = auction.seller_id as string | undefined;
      if (sellerId) {
        await db.collection("notifications").add({
          userId: sellerId,
          type: "new_bid",
          title: "New Bid Received",
          message: `A new bid of ₹${bid.amount.toLocaleString("en-IN")} was placed on "${auction.name}".`,
          auctionId: bid.auction_id,
          read: false,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        console.log(`[Bid Trigger] Notified seller ${sellerId} of new bid`);
      }
    } catch (error) {
      console.error(`[Bid Trigger] Error processing bid ${bidId}:`, error);
    }
  });

// ============================================================================
// NEW REVIEW TRIGGER FUNCTIONS
// ============================================================================

/**
 * Firestore trigger for new reviews
 * Updates shop/product ratings
 */
export const onNewReview = functions
  .region("asia-south1")
  .runWith({
    timeoutSeconds: 60,
    memory: "256MB",
  })
  .firestore.document("reviews/{reviewId}")
  .onCreate(async (snapshot, context) => {
    const review = snapshot.data();
    const {reviewId} = context.params;

    console.log(`[Review Trigger] New review ${reviewId} for ${review.type || "product"}`);

    try {
      // Update shop rating if shop_id is provided
      if (review.shop_id) {
        await updateShopRating(review.shop_id);
      }

      // Update product rating if product_id is provided
      if (review.product_id) {
        await updateProductRating(review.product_id);
      }

      // Notify seller of new review
      if (review.shop_id) {
        const shopDoc = await db.collection("shops").doc(review.shop_id).get();
        const shop = shopDoc.data();
        if (shop?.owner_id) {
          await db.collection("notifications").add({
            userId: shop.owner_id,
            type: "new_review",
            title: "New Review",
            message: `You received a ${review.rating}-star review${review.product_id ? " for a product" : ""}.`,
            reviewId: reviewId,
            shopId: review.shop_id,
            productId: review.product_id,
            read: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
          });
          console.log(`[Review Trigger] Notified seller ${shop.owner_id} of new review`);
        }
      }
    } catch (error) {
      console.error(`[Review Trigger] Error processing review ${reviewId}:`, error);
    }
  });

/**
 * Update shop average rating
 */
async function updateShopRating(shopId: string): Promise<void> {
  try {
    const reviewsSnapshot = await db
      .collection("reviews")
      .where("shop_id", "==", shopId)
      .where("isApproved", "==", true)
      .get();

    if (reviewsSnapshot.empty) {
      return;
    }

    let totalRating = 0;
    reviewsSnapshot.docs.forEach((doc) => {
      totalRating += doc.data().rating || 0;
    });

    const averageRating = totalRating / reviewsSnapshot.size;

    await db.collection("shops").doc(shopId).update({
      rating: Math.round(averageRating * 10) / 10,
      review_count: reviewsSnapshot.size,
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log(`[Review Trigger] Updated shop ${shopId} rating to ${averageRating.toFixed(1)}`);
  } catch (error) {
    console.error("[Review Trigger] Error updating shop rating:", error);
  }
}

/**
 * Update product average rating
 */
async function updateProductRating(productId: string): Promise<void> {
  try {
    const reviewsSnapshot = await db
      .collection("reviews")
      .where("product_id", "==", productId)
      .where("isApproved", "==", true)
      .get();

    if (reviewsSnapshot.empty) {
      return;
    }

    let totalRating = 0;
    reviewsSnapshot.docs.forEach((doc) => {
      totalRating += doc.data().rating || 0;
    });

    const averageRating = totalRating / reviewsSnapshot.size;

    await db.collection("products").doc(productId).update({
      rating: Math.round(averageRating * 10) / 10,
      review_count: reviewsSnapshot.size,
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log(`[Review Trigger] Updated product ${productId} rating to ${averageRating.toFixed(1)}`);
  } catch (error) {
    console.error("[Review Trigger] Error updating product rating:", error);
  }
}

// ============================================================================
// SCHEDULED CLEANUP FUNCTIONS
// ============================================================================

/**
 * Scheduled function to clean up expired sessions
 * Runs every hour
 */
export const cleanupExpiredSessions = functions
  .region("asia-south1")
  .runWith({
    timeoutSeconds: 120,
    memory: "256MB",
    minInstances: 0,
    maxInstances: 1,
    serviceAccount,
  })
  .pubsub.schedule("every 60 minutes")
  .timeZone("Asia/Kolkata")
  .onRun(async () => {
    console.log("[Cleanup] Starting expired sessions cleanup...");

    try {
      const now = admin.firestore.Timestamp.now();
      const sessionsSnapshot = await db
        .collection("sessions")
        .where("expiresAt", "<", now)
        .limit(500)
        .get();

      if (sessionsSnapshot.empty) {
        console.log("[Cleanup] No expired sessions found");
        return {cleaned: 0};
      }

      const batch = db.batch();
      sessionsSnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();
      console.log(`[Cleanup] Deleted ${sessionsSnapshot.size} expired sessions`);

      return {cleaned: sessionsSnapshot.size};
    } catch (error) {
      console.error("[Cleanup] Error cleaning sessions:", error);
      return {error: String(error)};
    }
  });

/**
 * Scheduled function to clean up abandoned carts
 * Runs every 6 hours
 */
export const cleanupAbandonedCarts = functions
  .region("asia-south1")
  .runWith({
    timeoutSeconds: 120,
    memory: "256MB",
    minInstances: 0,
    maxInstances: 1,
    serviceAccount,
  })
  .pubsub.schedule("every 6 hours")
  .timeZone("Asia/Kolkata")
  .onRun(async () => {
    console.log("[Cleanup] Starting abandoned carts cleanup...");

    try {
      // Delete carts older than 30 days
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 30);
      const cutoffTimestamp = admin.firestore.Timestamp.fromDate(cutoffDate);

      const cartsSnapshot = await db
        .collection("carts")
        .where("updated_at", "<", cutoffTimestamp)
        .limit(500)
        .get();

      if (cartsSnapshot.empty) {
        console.log("[Cleanup] No abandoned carts found");
        return {cleaned: 0};
      }

      const batch = db.batch();
      cartsSnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();
      console.log(`[Cleanup] Deleted ${cartsSnapshot.size} abandoned carts`);

      return {cleaned: cartsSnapshot.size};
    } catch (error) {
      console.error("[Cleanup] Error cleaning carts:", error);
      return {error: String(error)};
    }
  });

/**
 * Scheduled function to expire coupons
 * Runs every hour
 */
export const expireCoupons = functions
  .region("asia-south1")
  .runWith({
    timeoutSeconds: 60,
    memory: "256MB",
    minInstances: 0,
    maxInstances: 1,
    serviceAccount,
  })
  .pubsub.schedule("every 60 minutes")
  .timeZone("Asia/Kolkata")
  .onRun(async () => {
    console.log("[Cleanup] Starting coupon expiry check...");

    try {
      const now = admin.firestore.Timestamp.now();
      const couponsSnapshot = await db
        .collection("coupons")
        .where("is_active", "==", true)
        .where("end_date", "<", now)
        .limit(100)
        .get();

      if (couponsSnapshot.empty) {
        console.log("[Cleanup] No coupons to expire");
        return {expired: 0};
      }

      const batch = db.batch();
      couponsSnapshot.docs.forEach((doc) => {
        batch.update(doc.ref, {
          is_active: false,
          updated_at: admin.firestore.FieldValue.serverTimestamp(),
        });
      });

      await batch.commit();
      console.log(`[Cleanup] Expired ${couponsSnapshot.size} coupons`);

      return {expired: couponsSnapshot.size};
    } catch (error) {
      console.error("[Cleanup] Error expiring coupons:", error);
      return {error: String(error)};
    }
  });
