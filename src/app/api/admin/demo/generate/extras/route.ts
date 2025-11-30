import { NextRequest, NextResponse } from "next/server";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { COLLECTIONS } from "@/constants/database";

const DEMO_PREFIX = "DEMO_";

const PRODUCT_IMAGES = [
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
  "https://images.unsplash.com/photo-1585386959984-a4155224a1ad",
  "https://images.unsplash.com/photo-1572635196237-14b3f281503f",
  "https://images.unsplash.com/photo-1560343090-f0409e92791a",
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
  "https://images.unsplash.com/photo-1549298916-b41d501d3772",
  "https://images.unsplash.com/photo-1553062407-98eeb64c6a62",
  "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa",
  "https://images.unsplash.com/photo-1598808503491-fa80d3e5a0d9",
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { shops, buyers, users, products } = body;

    const db = getFirestoreAdmin();
    const timestamp = new Date();

    const counts = {
      heroSlides: 0,
      carts: 0,
      favorites: 0,
      notifications: 0,
      tickets: 0,
      settings: 0,
      featureFlags: 0,
    };

    // Hero Slides (10)
    const heroSlideData = [
      { title: "Black Friday Sale", subtitle: "Up to 70% off" },
      { title: "New Arrivals", subtitle: "Check out latest" },
      { title: "Rare Finds", subtitle: "Limited edition" },
      { title: "Beyblade Tournament", subtitle: "Join the battle" },
      { title: "Holiday Special", subtitle: "Gift collectibles" },
      { title: "Flash Sale", subtitle: "24 hours only" },
      { title: "Collector's Paradise", subtitle: "Premium items" },
      { title: "Free Shipping", subtitle: "Orders above ₹2000" },
      { title: "Auction Week", subtitle: "Bid on rare items" },
      { title: "Member Benefits", subtitle: "Exclusive deals" },
    ];

    for (let i = 0; i < 10; i++) {
      await db.collection(COLLECTIONS.HERO_SLIDES).doc().set({
        title: `${DEMO_PREFIX}${heroSlideData[i].title}`,
        subtitle: heroSlideData[i].subtitle,
        imageUrl: PRODUCT_IMAGES[i % PRODUCT_IMAGES.length],
        linkUrl: `/promo/slide-${i + 1}`,
        order: i + 1,
        isActive: i < 8,
        startDate: timestamp,
        endDate: new Date(timestamp.getTime() + 30 * 24 * 60 * 60 * 1000),
      });
      counts.heroSlides++;
    }

    // Carts (for first 20 buyers)
    if (buyers && products) {
      for (const buyer of buyers.slice(0, 20)) {
        await db.collection(COLLECTIONS.CARTS).doc().set({
          userId: buyer.id,
          items: [{ productId: products[0], quantity: 1, price: 5000 }],
          subtotal: 5000,
          updatedAt: timestamp,
        });
        counts.carts++;
      }
    }

    // Favorites
    if (buyers && products) {
      for (const buyer of buyers) {
        for (let f = 0; f < 3; f++) {
          await db.collection(COLLECTIONS.FAVORITES).doc().set({
            userId: buyer.id,
            itemId: products[f % products.length],
            itemType: "product",
            createdAt: timestamp,
          });
          counts.favorites++;
        }
      }
    }

    // Notifications (for first 50 users)
    if (users) {
      for (const user of users.slice(0, 50)) {
        await db.collection(COLLECTIONS.NOTIFICATIONS).doc().set({
          userId: user.id,
          type: "order",
          title: "Order Update",
          message: "Your order has been shipped!",
          isRead: false,
          createdAt: timestamp,
        });
        counts.notifications++;
      }
    }

    // Tickets
    if (buyers) {
      for (let t = 0; t < 30; t++) {
        await db.collection(COLLECTIONS.SUPPORT_TICKETS).doc().set({
          ticketNumber: `${DEMO_PREFIX}TKT-${String(t + 1).padStart(5, "0")}`,
          userId: buyers[t % buyers.length].id,
          category: ["order_issue", "payment", "shipping", "product_inquiry"][t % 4],
          subject: "Need help",
          description: "Please assist with my issue.",
          priority: ["low", "medium", "high"][t % 3],
          status: ["open", "in_progress", "resolved"][t % 3],
          createdAt: timestamp,
        });
        counts.tickets++;
      }
    }

    // Update shop counts
    if (shops) {
      for (const shop of shops) {
        await db.collection(COLLECTIONS.SHOPS).doc(shop.id).update({
          product_count: 20,
          total_products: 20,
          auction_count: 5,
        });
      }
    }

    return NextResponse.json({
      success: true,
      step: "extras",
      data: counts,
    });
  } catch (error: unknown) {
    console.error("Demo extras error:", error);
    const message = error instanceof Error ? error.message : "Failed to generate extras";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
