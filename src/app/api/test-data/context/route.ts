import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { COLLECTIONS } from "@/constants/database";
import { logError } from "@/lib/firebase-error-logger";
import { NextRequest, NextResponse } from "next/server";

const PREFIX = "TEST_";

/**
 * GET - Fetch current test data context
 * Returns organized test data for use in workflows
 */
export async function GET(req: NextRequest) {
  try {
    const db = getFirestoreAdmin();
    const context: any = {
      users: {
        admin: [],
        sellers: [],
        customers: [],
        all: [],
      },
      shops: {
        verified: [],
        unverified: [],
        featured: [],
        all: [],
        byOwnerId: {},
      },
      categories: {
        root: [],
        children: [],
        all: [],
        byParentId: {},
      },
      products: {
        published: [],
        draft: [],
        featured: [],
        inStock: [],
        all: [],
        byShopId: {},
        byCategoryId: {},
      },
      auctions: {
        live: [],
        scheduled: [],
        draft: [],
        featured: [],
        all: [],
        byShopId: {},
      },
      coupons: {
        active: [],
        inactive: [],
        all: [],
        byShopId: {},
      },
      orders: {
        pending: [],
        confirmed: [],
        shipped: [],
        delivered: [],
        all: [],
        byUserId: {},
        byShopId: {},
      },
      metadata: {
        generatedAt: new Date().toISOString(),
        totalItems: 0,
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
        id: doc.id,
        email: data.email,
        name: data.name,
        role: data.role,
        phone: data.phone,
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
        id: doc.id,
        ownerId: data.owner_id,
        name: data.name,
        slug: data.slug,
        email: data.email,
        phone: data.phone,
        isVerified: data.is_verified,
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
        id: doc.id,
        name: data.name,
        slug: data.slug,
        parentId: data.parent_id,
        level: data.level || 0,
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
        id: doc.id,
        shopId: data.shop_id,
        categoryId: data.category_id,
        name: data.name,
        slug: data.slug,
        price: data.price,
        stockCount: data.stock_count || 0,
        status: data.status,
        featured: data.is_featured,
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
        id: doc.id,
        shopId: data.shop_id,
        categoryId: data.category_id,
        name: data.name,
        slug: data.slug,
        startingBid: data.starting_bid,
        currentBid: data.current_bid,
        status: data.status,
        featured: data.is_featured,
        startTime: data.start_time,
        endTime: data.end_time,
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
        id: doc.id,
        shopId: data.shop_id,
        code: data.code,
        discountType: data.discount_type,
        discountValue: data.discount_value,
        minOrderValue: data.min_order_value,
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
        id: doc.id,
        userId: data.user_id,
        shopId: data.shop_id,
        orderNumber: data.order_number,
        status: data.status,
        paymentStatus: data.payment_status,
        total: data.total,
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
export async function DELETE(req: NextRequest) {
  try {
    // This endpoint can be used to clear any cached context
    // For now, it's a placeholder for future caching implementation
    return NextResponse.json({
      success: true,
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
