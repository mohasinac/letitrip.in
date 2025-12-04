import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { COLLECTIONS } from "@/constants/database";
import { logError } from "@/lib/firebase-error-logger";
import { NextResponse } from "next/server";

const PREFIX = "TEST_";

export async function GET() {
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
      featuredProducts: 0,
      featuredAuctions: 0,
      featuredShops: 0,
      homepageItems: 0,
    };

    // Count test users
    try {
      const usersSnapshot = await db
        .collection(COLLECTIONS.USERS)
        .where("email", ">=", PREFIX)
        .where("email", "<", PREFIX + "\uf8ff")
        .count()
        .get();
      stats.users = usersSnapshot.data().count;
    } catch (error: any) {
      // Fallback: If index not ready, fetch and count in-memory
      if (error.message?.includes("index")) {
        const usersSnapshot = await db
          .collection(COLLECTIONS.USERS)
          .where("email", ">=", PREFIX)
          .where("email", "<", PREFIX + "\uf8ff")
          .get();
        stats.users = usersSnapshot.size;
      } else {
        throw error;
      }
    }

    // Count test shops
    try {
      const shopsSnapshot = await db
        .collection(COLLECTIONS.SHOPS)
        .where("name", ">=", PREFIX)
        .where("name", "<", PREFIX + "\uf8ff")
        .count()
        .get();
      stats.shops = shopsSnapshot.data().count;
    } catch (error: any) {
      if (error.message?.includes("index")) {
        const shopsSnapshot = await db
          .collection(COLLECTIONS.SHOPS)
          .where("name", ">=", PREFIX)
          .where("name", "<", PREFIX + "\uf8ff")
          .get();
        stats.shops = shopsSnapshot.size;
      } else {
        throw error;
      }
    }

    // Count featured shops
    try {
      const featuredShopsSnapshot = await db
        .collection(COLLECTIONS.SHOPS)
        .where("name", ">=", PREFIX)
        .where("name", "<", PREFIX + "\uf8ff")
        .where("is_featured", "==", true)
        .count()
        .get();
      stats.featuredShops = featuredShopsSnapshot.data().count;
    } catch (error: any) {
      if (error.message?.includes("index")) {
        const shopsSnapshot = await db
          .collection(COLLECTIONS.SHOPS)
          .where("name", ">=", PREFIX)
          .where("name", "<", PREFIX + "\uf8ff")
          .get();
        stats.featuredShops = shopsSnapshot.docs.filter(
          (doc) => doc.data().is_featured === true,
        ).length;
      } else {
        throw error;
      }
    }

    // Count test categories
    try {
      const categoriesSnapshot = await db
        .collection(COLLECTIONS.CATEGORIES)
        .where("name", ">=", PREFIX)
        .where("name", "<", PREFIX + "\uf8ff")
        .count()
        .get();
      stats.categories = categoriesSnapshot.data().count;
    } catch (error: any) {
      if (error.message?.includes("index")) {
        const categoriesSnapshot = await db
          .collection(COLLECTIONS.CATEGORIES)
          .where("name", ">=", PREFIX)
          .where("name", "<", PREFIX + "\uf8ff")
          .get();
        stats.categories = categoriesSnapshot.size;
      } else {
        throw error;
      }
    }

    // Count test products
    try {
      const productsSnapshot = await db
        .collection(COLLECTIONS.PRODUCTS)
        .where("name", ">=", PREFIX)
        .where("name", "<", PREFIX + "\uf8ff")
        .count()
        .get();
      stats.products = productsSnapshot.data().count;
    } catch (error: any) {
      if (error.message?.includes("index")) {
        const productsSnapshot = await db
          .collection(COLLECTIONS.PRODUCTS)
          .where("name", ">=", PREFIX)
          .where("name", "<", PREFIX + "\uf8ff")
          .get();
        stats.products = productsSnapshot.size;
      } else {
        throw error;
      }
    }

    // Count featured products
    try {
      const featuredProductsSnapshot = await db
        .collection(COLLECTIONS.PRODUCTS)
        .where("name", ">=", PREFIX)
        .where("name", "<", PREFIX + "\uf8ff")
        .where("is_featured", "==", true)
        .count()
        .get();
      stats.featuredProducts = featuredProductsSnapshot.data().count;
    } catch (error: any) {
      if (error.message?.includes("index")) {
        const productsSnapshot = await db
          .collection(COLLECTIONS.PRODUCTS)
          .where("name", ">=", PREFIX)
          .where("name", "<", PREFIX + "\uf8ff")
          .get();
        stats.featuredProducts = productsSnapshot.docs.filter(
          (doc) => doc.data().is_featured === true,
        ).length;
      } else {
        throw error;
      }
    }

    // Count test auctions
    try {
      const auctionsSnapshot = await db
        .collection(COLLECTIONS.AUCTIONS)
        .where("name", ">=", PREFIX)
        .where("name", "<", PREFIX + "\uf8ff")
        .count()
        .get();
      stats.auctions = auctionsSnapshot.data().count;
    } catch (error: any) {
      if (error.message?.includes("index")) {
        const auctionsSnapshot = await db
          .collection(COLLECTIONS.AUCTIONS)
          .where("name", ">=", PREFIX)
          .where("name", "<", PREFIX + "\uf8ff")
          .get();
        stats.auctions = auctionsSnapshot.size;
      } else {
        throw error;
      }
    }

    // Count featured auctions
    try {
      const featuredAuctionsSnapshot = await db
        .collection(COLLECTIONS.AUCTIONS)
        .where("name", ">=", PREFIX)
        .where("name", "<", PREFIX + "\uf8ff")
        .where("is_featured", "==", true)
        .count()
        .get();
      stats.featuredAuctions = featuredAuctionsSnapshot.data().count;
    } catch (error: any) {
      if (error.message?.includes("index")) {
        const auctionsSnapshot = await db
          .collection(COLLECTIONS.AUCTIONS)
          .where("name", ">=", PREFIX)
          .where("name", "<", PREFIX + "\uf8ff")
          .get();
        stats.featuredAuctions = auctionsSnapshot.docs.filter(
          (doc) => doc.data().is_featured === true,
        ).length;
      } else {
        throw error;
      }
    }

    // Count homepage items (auctions)
    try {
      const homepageAuctionsSnapshot = await db
        .collection(COLLECTIONS.AUCTIONS)
        .where("name", ">=", PREFIX)
        .where("name", "<", PREFIX + "\uf8ff")
        .where("show_on_homepage", "==", true)
        .count()
        .get();
      stats.homepageItems = homepageAuctionsSnapshot.data().count;
    } catch (error: any) {
      if (error.message?.includes("index")) {
        const auctionsSnapshot = await db
          .collection(COLLECTIONS.AUCTIONS)
          .where("name", ">=", PREFIX)
          .where("name", "<", PREFIX + "\uf8ff")
          .get();
        stats.homepageItems = auctionsSnapshot.docs.filter(
          (doc) => doc.data().show_on_homepage === true,
        ).length;
      } else {
        throw error;
      }
    }

    // Count test reviews
    try {
      const reviewsSnapshot = await db
        .collection(COLLECTIONS.REVIEWS)
        .where("title", ">=", PREFIX)
        .where("title", "<", PREFIX + "\uf8ff")
        .count()
        .get();
      stats.reviews = reviewsSnapshot.data().count;
    } catch (error: any) {
      if (error.message?.includes("index")) {
        const reviewsSnapshot = await db
          .collection(COLLECTIONS.REVIEWS)
          .where("title", ">=", PREFIX)
          .where("title", "<", PREFIX + "\uf8ff")
          .get();
        stats.reviews = reviewsSnapshot.size;
      } else {
        throw error;
      }
    }

    // Count test orders
    try {
      const ordersSnapshot = await db
        .collection(COLLECTIONS.ORDERS)
        .where("order_number", ">=", PREFIX)
        .where("order_number", "<", PREFIX + "\uf8ff")
        .count()
        .get();
      stats.orders = ordersSnapshot.data().count;
    } catch (error: any) {
      if (error.message?.includes("index")) {
        const ordersSnapshot = await db
          .collection(COLLECTIONS.ORDERS)
          .where("order_number", ">=", PREFIX)
          .where("order_number", "<", PREFIX + "\uf8ff")
          .get();
        stats.orders = ordersSnapshot.size;
      } else {
        throw error;
      }
    }

    // Count test tickets
    try {
      const ticketsSnapshot = await db
        .collection(COLLECTIONS.SUPPORT_TICKETS)
        .where("subject", ">=", PREFIX)
        .where("subject", "<", PREFIX + "\uf8ff")
        .count()
        .get();
      stats.tickets = ticketsSnapshot.data().count;
    } catch (error: any) {
      if (error.message?.includes("index")) {
        const ticketsSnapshot = await db
          .collection(COLLECTIONS.SUPPORT_TICKETS)
          .where("subject", ">=", PREFIX)
          .where("subject", "<", PREFIX + "\uf8ff")
          .get();
        stats.tickets = ticketsSnapshot.size;
      } else {
        throw error;
      }
    }

    // Count test coupons
    try {
      const couponsSnapshot = await db
        .collection(COLLECTIONS.COUPONS)
        .where("code", ">=", PREFIX)
        .where("code", "<", PREFIX + "\uf8ff")
        .count()
        .get();
      stats.coupons = couponsSnapshot.data().count;
    } catch (error: any) {
      if (error.message?.includes("index")) {
        const couponsSnapshot = await db
          .collection(COLLECTIONS.COUPONS)
          .where("code", ">=", PREFIX)
          .where("code", "<", PREFIX + "\uf8ff")
          .get();
        stats.coupons = couponsSnapshot.size;
      } else {
        throw error;
      }
    }

    // Count test hero slides
    try {
      const heroSlidesSnapshot = await db
        .collection(COLLECTIONS.HERO_SLIDES)
        .where("id", ">=", PREFIX)
        .where("id", "<", PREFIX + "\uf8ff")
        .count()
        .get();
      stats.heroSlides = heroSlidesSnapshot.data().count;
    } catch (error: any) {
      if (error.message?.includes("index")) {
        const heroSlidesSnapshot = await db
          .collection(COLLECTIONS.HERO_SLIDES)
          .where("id", ">=", PREFIX)
          .where("id", "<", PREFIX + "\uf8ff")
          .get();
        stats.heroSlides = heroSlidesSnapshot.size;
      } else {
        throw error;
      }
    }

    return NextResponse.json({ success: true, stats });
  } catch (error: any) {
    logError(error as Error, { component: "API.testData.status" });
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch status" },
      { status: 500 },
    );
  }
}
