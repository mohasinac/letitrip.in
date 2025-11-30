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

const PRODUCT_NAMES = [
  "Charizard VMAX", "Pikachu VMAX", "Mewtwo GX", "Rayquaza VMAX", "Umbreon VMAX",
  "Blue-Eyes White Dragon", "Dark Magician", "Red-Eyes Black Dragon", "Exodia",
  "Valkyrie Evolution", "Spriggan Requiem", "Drain Fafnir", "Achilles",
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { shops, productsByShop } = body;

    if (!shops || !Array.isArray(shops) || shops.length === 0) {
      return NextResponse.json({ success: false, error: "Shops data required" }, { status: 400 });
    }

    if (!productsByShop || Object.keys(productsByShop).length === 0) {
      return NextResponse.json({ success: false, error: "Products by shop data required" }, { status: 400 });
    }

    const db = getFirestoreAdmin();
    const timestamp = new Date();
    const createdAuctions: string[] = [];

    // Create 250 auctions (5 per shop for 50 shops)
    const auctionsPerShop = 5;
    const totalAuctions = Math.min(shops.length * auctionsPerShop, 250);

    for (let i = 0; i < totalAuctions; i++) {
      const shopIndex = Math.floor(i / auctionsPerShop);
      if (shopIndex >= shops.length) break;
      
      const currentShop = shops[shopIndex];
      const shopProducts = productsByShop[currentShop.id] || [];
      const productId = shopProducts[i % Math.max(shopProducts.length, 1)] || "";

      const auctionRef = db.collection(COLLECTIONS.AUCTIONS).doc();
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 3 + (i % 14));

      const startingBid = 1000 + Math.random() * 20000;
      const title = `${DEMO_PREFIX}Auction #${i + 1} - ${PRODUCT_NAMES[i % PRODUCT_NAMES.length]}`;
      const auctionImages = Array.from({ length: 3 }, (_, idx) => 
        `${PRODUCT_IMAGES[(i * 2 + idx) % PRODUCT_IMAGES.length]}?w=800&h=800&fit=crop`
      );

      await auctionRef.set({
        product_id: productId,
        shop_id: currentShop.id,
        seller_id: currentShop.ownerId,
        title,
        slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 100),
        description: "Rare collectible up for auction!",
        images: auctionImages,
        starting_bid: Math.round(startingBid),
        current_bid: Math.round(startingBid),
        bid_increment: [100, 200, 500][i % 3],
        reserve_price: Math.round(startingBid * 1.5),
        start_time: startDate,
        end_time: endDate,
        status: "active",
        is_featured: i % 5 < 2,
        total_bids: 0,
        unique_bidders: 0,
        created_at: timestamp,
        updated_at: timestamp,
      });

      createdAuctions.push(auctionRef.id);
    }

    return NextResponse.json({
      success: true,
      step: "auctions",
      data: {
        count: createdAuctions.length,
        auctions: createdAuctions,
      },
    });
  } catch (error: unknown) {
    console.error("Demo auctions error:", error);
    const message = error instanceof Error ? error.message : "Failed to generate auctions";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
