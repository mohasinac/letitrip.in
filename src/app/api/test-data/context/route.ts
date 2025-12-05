/**
 * @fileoverview TypeScript Module
 * @module src/app/api/test-data/context/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { COLLECTIONS } from "@/constants/database";
import { logError } from "@/lib/firebase-error-logger";
import { NextRequest, NextResponse } from "next/server";

/**
 * PREFIX constant
 * 
 * @constant
 * @type {any}
 * @description Configuration constant for prefix
 */
const PREFIX = "TEST_";

/**
 * GET - Fetch current test data context
 * Returns organized test data for use in workflows
 */
/**
 * Performs g e t operation
 *
 * @param {NextRequest} req - The req
 *
 * @returns {Promise<any>} Promise resolving to get result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * GET(req);
 */

/**
 * Performs g e t operation
 *
 * @param {NextRequest} req - The req
 *
 * @returns {Promise<any>} Promise resolving to get result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * GET(req);
 */

export async function GET(req: NextRequest) {
  try {
    const db = getFirestoreAdmin();
    const context: any = {
      /** Users */
      users: {
        /** Admin */
        admin: [],
        /** Sellers */
        sellers: [],
        /** Customers */
        customers: [],
        /** All */
        all: [],
      },
      /** Shops */
      shops: {
        /** Verified */
        verified: [],
        /** Unverified */
        unverified: [],
        /** Featured */
        featured: [],
        /** All */
        all: [],
        /** By Owner Id */
        byOwnerId: {},
      },
      /** Categories */
      categories: {
        /** Root */
        root: [],
        /** Children */
        children: [],
        /** All */
        all: [],
        /** By Parent Id */
        byParentId: {},
      },
      /** Products */
      products: {
        /** Published */
        published: [],
        /** Draft */
        draft: [],
        /** Featured */
        featured: [],
        /** In Stock */
        inStock: [],
        /** All */
        all: [],
        /** By Shop Id */
        byShopId: {},
        /** By Category Id */
        byCategoryId: {},
      },
      /** Auctions */
      auctions: {
        /** Live */
        live: [],
        /** Scheduled */
        scheduled: [],
        /** Draft */
        draft: [],
        /** Featured */
        featured: [],
        /** All */
        all: [],
        /** By Shop Id */
        byShopId: {},
      },
      /** Coupons */
      coupons: {
        /** Active */
        active: [],
        /** Inactive */
        inactive: [],
        /** All */
        all: [],
        /** By Shop Id */
        byShopId: {},
      },
      /** Orders */
      orders: {
        /** Pending */
        pending: [],
        /** Confirmed */
        confirmed: [],
        /** Shipped */
        shipped: [],
        /** Delivered */
        delivered: [],
        /** All */
        all: [],
        /** By User Id */
        byUserId: {},
        /** By Shop Id */
        byShopId: {},
      },
      /** Metadata */
      metadata: {
        /** Generated At */
        generatedAt: new Date().toISOString(),
        /** Total Items */
        totalItems: 0,
        /** Prefix */
        prefix: PREFIX,
      },
    };

    // Fetch Users
    const usersSnapshot = await db
      .collection(COLLECTIONS.USERS)
      .where("email", ">=", PREFIX)
      .where("email", "<", PREFIX + "\uf8ff")
      .limit(500)
      .get();

    usersSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      const user = {
        /** Id */
        id: doc.id,
        /** Email */
        email: data.email,
        /** Name */
        name: data.name,
        /** Role */
        role: data.role,
        /** Phone */
        phone: data.phone,
        /** Avatar */
        avatar: data.profile?.avatar,
      };

      context.users.all.push(user);
      if (user.role === "admin") context.users.admin.push(user);
      else if (user.role === "seller") context.users.sellers.push(user);
      else context.users.customers.push(user);
    });

    // Fetch Shops
    const shopsSnapshot = await db
      .collection(COLLECTIONS.SHOPS)
      .where("name", ">=", PREFIX)
      .where("name", "<", PREFIX + "\uf8ff")
      .limit(500)
      .get();

    shopsSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      const shop = {
        /** Id */
        id: doc.id,
        /** Owner Id */
        ownerId: data.owner_id,
        /** Name */
        name: data.name,
        /** Slug */
        slug: data.slug,
        /** Email */
        email: data.email,
        /** Phone */
        phone: data.phone,
        /** Is Verified */
        isVerified: data.is_verified,
        /** Featured */
        featured: data.is_featured,
      };

      context.shops.all.push(shop);
      if (shop.isVerified) context.shops.verified.push(shop);
      else context.shops.unverified.push(shop);
      if (shop.featured) context.shops.featured.push(shop);

      if (!context.shops.byOwnerId[shop.ownerId]) {
        context.shops.byOwnerId[shop.ownerId] = [];
      }
      context.shops.byOwnerId[shop.ownerId].push(shop);
    });

    // Fetch Categories
    const categoriesSnapshot = await db
      .collection(COLLECTIONS.CATEGORIES)
      .where("name", ">=", PREFIX)
      .where("name", "<", PREFIX + "\uf8ff")
      .limit(500)
      .get();

    categoriesSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      const category = {
        /** Id */
        id: doc.id,
        /** Name */
        name: data.name,
        /** Slug */
        slug: data.slug,
        /** Parent Id */
        parentId: data.parent_id,
        /** Level */
        level: data.level || 0,
        /** Product Count */
        productCount: data.product_count || 0,
      };

      context.categories.all.push(category);
      if (!category.parentId) context.categories.root.push(category);
      else context.categories.children.push(category);

      if (category.parentId) {
        if (!context.categories.byParentId[category.parentId]) {
          context.categories.byParentId[category.parentId] = [];
        }
        context.categories.byParentId[category.parentId].push(category);
      }
    });

    // Fetch Products
    const productsSnapshot = await db
      .collection(COLLECTIONS.PRODUCTS)
      .where("name", ">=", PREFIX)
      .where("name", "<", PREFIX + "\uf8ff")
      .limit(500)
      .get();

    productsSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      const product = {
        /** Id */
        id: doc.id,
        /** Shop Id */
        shopId: data.shop_id,
        /** Category Id */
        categoryId: data.category_id,
        /** Name */
        name: data.name,
        /** Slug */
        slug: data.slug,
        /** Price */
        price: data.price,
        /** Stock Count */
        stockCount: data.stock_count || 0,
        /** Status */
        status: data.status,
        /** Featured */
        featured: data.is_featured,
        /** Sku */
        sku: data.sku,
      };

      context.products.all.push(product);
      if (product.status === "published")
        context.products.published.push(product);
      if (product.status === "draft") context.products.draft.push(product);
      if (product.featured) context.products.featured.push(product);
      if (product.stockCount > 0) context.products.inStock.push(product);

      if (!context.products.byShopId[product.shopId]) {
        context.products.byShopId[product.shopId] = [];
      }
      context.products.byShopId[product.shopId].push(product);

      if (!context.products.byCategoryId[product.categoryId]) {
        context.products.byCategoryId[product.categoryId] = [];
      }
      context.products.byCategoryId[product.categoryId].push(product);
    });

    // Fetch Auctions
    const auctionsSnapshot = await db
      .collection(COLLECTIONS.AUCTIONS)
      .where("name", ">=", PREFIX)
      .where("name", "<", PREFIX + "\uf8ff")
      .limit(500)
      .get();

    auctionsSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      const auction = {
        /** Id */
        id: doc.id,
        /** Shop Id */
        shopId: data.shop_id,
        /** Category Id */
        categoryId: data.category_id,
        /** Name */
        name: data.name,
        /** Slug */
        slug: data.slug,
        /** Starting Bid */
        startingBid: data.starting_bid,
        /** Current Bid */
        currentBid: data.current_bid,
        /** Status */
        status: data.status,
        /** Featured */
        featured: data.is_featured,
        /** Start Time */
        startTime: data.start_time,
        /** End Time */
        endTime: data.end_time,
        /** Bid Count */
        bidCount: data.bid_count || 0,
      };

      context.auctions.all.push(auction);
      if (auction.status === "live") context.auctions.live.push(auction);
      if (auction.status === "scheduled")
        context.auctions.scheduled.push(auction);
      if (auction.status === "draft") context.auctions.draft.push(auction);
      if (auction.featured) context.auctions.featured.push(auction);

      if (!context.auctions.byShopId[auction.shopId]) {
        context.auctions.byShopId[auction.shopId] = [];
      }
      context.auctions.byShopId[auction.shopId].push(auction);
    });

    // Fetch Coupons
    const couponsSnapshot = await db
      .collection(COLLECTIONS.COUPONS)
      .where("code", ">=", PREFIX)
      .where("code", "<", PREFIX + "\uf8ff")
      .limit(500)
      .get();

    couponsSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      const coupon = {
        /** Id */
        id: doc.id,
        /** Shop Id */
        shopId: data.shop_id,
        /** Code */
        code: data.code,
        /** Discount Type */
        discountType: data.discount_type,
        /** Discount Value */
        discountValue: data.discount_value,
        /** Min Order Value */
        minOrderValue: data.min_order_value,
        /** Is Active */
        isActive: data.is_active,
      };

      context.coupons.all.push(coupon);
      if (coupon.isActive) context.coupons.active.push(coupon);
      else context.coupons.inactive.push(coupon);

      if (!context.coupons.byShopId[coupon.shopId]) {
        context.coupons.byShopId[coupon.shopId] = [];
      }
      context.coupons.byShopId[coupon.shopId].push(coupon);
    });

    // Fetch Orders
    const ordersSnapshot = await db
      .collection(COLLECTIONS.ORDERS)
      .where("order_number", ">=", PREFIX)
      .where("order_number", "<", PREFIX + "\uf8ff")
      .limit(500)
      .get();

    ordersSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      const order = {
        /** Id */
        id: doc.id,
        /** User Id */
        userId: data.user_id,
        /** Shop Id */
        shopId: data.shop_id,
        /** Order Number */
        orderNumber: data.order_number,
        /** Status */
        status: data.status,
        /** Payment Status */
        paymentStatus: data.payment_status,
        /** Total */
        total: data.total,
        /** Item Count */
        itemCount: data.items?.length || 0,
      };

      context.orders.all.push(order);
      if (order.status === "pending") context.orders.pending.push(order);
      if (order.status === "confirmed") context.orders.confirmed.push(order);
      if (order.status === "shipped") context.orders.shipped.push(order);
      if (order.status === "delivered") context.orders.delivered.push(order);

      if (!context.orders.byUserId[order.userId]) {
        context.orders.byUserId[order.userId] = [];
      }
      context.orders.byUserId[order.userId].push(order);

      if (!context.orders.byShopId[order.shopId]) {
        context.orders.byShopId[order.shopId] = [];
      }
      context.orders.byShopId[order.shopId].push(order);
    });

    // Calculate total items
    context.metadata.totalItems =
      context.users.all.length +
      context.shops.all.length +
      context.categories.all.length +
      context.products.all.length +
      context.auctions.all.length +
      context.coupons.all.length +
      context.orders.all.length;

    return NextResponse.json({ success: true, context });
  } catch (error: any) {
    logError(error as Error, { component: "API.testData.context.GET" });
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch context" },
      { status: 500 },
    );
  }
}

/**
 * DELETE - Clear test data context cache
 */
/**
 * Performs d e l e t e operation
 *
 * @param {NextRequest} req - The req
 *
 * @returns {Promise<any>} Promise resolving to delete result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * DELETE(req);
 */

/**
 * Performs d e l e t e operation
 *
 * @param {NextRequest} req - The req
 *
 * @returns {Promise<any>} Promise resolving to delete result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * DELETE(req);
 */

export async function DELETE(req: NextRequest) {
  try {
    // This endpoint can be used to clear any cached context
    // For now, it's a placeholder for future caching implementation
    return NextResponse.json({
      /** Success */
      success: true,
      /** Message */
      message: "Test data context cache cleared",
    });
  } catch (error: any) {
    logError(error as Error, { component: "API.testData.context.DELETE" });
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
