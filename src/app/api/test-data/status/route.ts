import { NextResponse } from "next/server";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";

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
    const usersSnapshot = await db
      .collection("users")
      .where("email", ">=", PREFIX)
      .where("email", "<", PREFIX + "\uf8ff")
      .count()
      .get();
    stats.users = usersSnapshot.data().count;

    // Count test shops
    const shopsSnapshot = await db
      .collection("shops")
      .where("name", ">=", PREFIX)
      .where("name", "<", PREFIX + "\uf8ff")
      .count()
      .get();
    stats.shops = shopsSnapshot.data().count;

    // Count featured shops
    const featuredShopsSnapshot = await db
      .collection("shops")
      .where("name", ">=", PREFIX)
      .where("name", "<", PREFIX + "\uf8ff")
      .where("is_featured", "==", true)
      .count()
      .get();
    stats.featuredShops = featuredShopsSnapshot.data().count;

    // Count test categories
    const categoriesSnapshot = await db
      .collection("categories")
      .where("name", ">=", PREFIX)
      .where("name", "<", PREFIX + "\uf8ff")
      .count()
      .get();
    stats.categories = categoriesSnapshot.data().count;

    // Count test products
    const productsSnapshot = await db
      .collection("products")
      .where("name", ">=", PREFIX)
      .where("name", "<", PREFIX + "\uf8ff")
      .count()
      .get();
    stats.products = productsSnapshot.data().count;

    // Count featured products
    const featuredProductsSnapshot = await db
      .collection("products")
      .where("name", ">=", PREFIX)
      .where("name", "<", PREFIX + "\uf8ff")
      .where("is_featured", "==", true)
      .count()
      .get();
    stats.featuredProducts = featuredProductsSnapshot.data().count;

    // Count test auctions
    const auctionsSnapshot = await db
      .collection("auctions")
      .where("name", ">=", PREFIX)
      .where("name", "<", PREFIX + "\uf8ff")
      .count()
      .get();
    stats.auctions = auctionsSnapshot.data().count;

    // Count featured auctions
    const featuredAuctionsSnapshot = await db
      .collection("auctions")
      .where("name", ">=", PREFIX)
      .where("name", "<", PREFIX + "\uf8ff")
      .where("is_featured", "==", true)
      .count()
      .get();
    stats.featuredAuctions = featuredAuctionsSnapshot.data().count;

    // Count homepage items (auctions)
    const homepageAuctionsSnapshot = await db
      .collection("auctions")
      .where("name", ">=", PREFIX)
      .where("name", "<", PREFIX + "\uf8ff")
      .where("show_on_homepage", "==", true)
      .count()
      .get();
    stats.homepageItems = homepageAuctionsSnapshot.data().count;

    // Count test reviews
    const reviewsSnapshot = await db
      .collection("reviews")
      .where("title", ">=", PREFIX)
      .where("title", "<", PREFIX + "\uf8ff")
      .count()
      .get();
    stats.reviews = reviewsSnapshot.data().count;

    // Count test orders
    const ordersSnapshot = await db
      .collection("orders")
      .where("order_number", ">=", PREFIX)
      .where("order_number", "<", PREFIX + "\uf8ff")
      .count()
      .get();
    stats.orders = ordersSnapshot.data().count;

    // Count test tickets
    const ticketsSnapshot = await db
      .collection("support_tickets")
      .where("subject", ">=", PREFIX)
      .where("subject", "<", PREFIX + "\uf8ff")
      .count()
      .get();
    stats.tickets = ticketsSnapshot.data().count;

    // Count test coupons
    const couponsSnapshot = await db
      .collection("coupons")
      .where("code", ">=", PREFIX)
      .where("code", "<", PREFIX + "\uf8ff")
      .count()
      .get();
    stats.coupons = couponsSnapshot.data().count;

    // Count test hero slides
    const heroSlidesSnapshot = await db
      .collection("hero_slides")
      .where("id", ">=", PREFIX)
      .where("id", "<", PREFIX + "\uf8ff")
      .count()
      .get();
    stats.heroSlides = heroSlidesSnapshot.data().count;

    return NextResponse.json({ success: true, stats });
  } catch (error: any) {
    console.error("Error fetching test data status:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch status" },
      { status: 500 }
    );
  }
}
