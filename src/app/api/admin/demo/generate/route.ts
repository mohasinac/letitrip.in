import { NextRequest, NextResponse } from "next/server";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { nanoid } from "nanoid";

/**
 * Demo Data Generator API
 * Creates comprehensive demo data for TCG, Beyblades, and Figurines
 * POST /api/admin/demo/generate
 *
 * Uses DEMO_ prefix for all resources instead of session-based tracking
 * This allows easy identification and cleanup of demo data
 */

const DEMO_PREFIX = "DEMO_";

// TCG, Beyblade, and Figurine Categories with multi-parent structure
const CATEGORY_TREE = {
  // Root categories
  "Trading Card Games": {
    children: {
      "Pokemon TCG": {
        children: {
          "Base Set": { isLeaf: true },
          "Expansion Sets": { isLeaf: true },
          "Booster Packs": { isLeaf: true },
          "Starter Decks": { isLeaf: true },
          "Elite Trainer Boxes": { isLeaf: true },
        },
      },
      "Yu-Gi-Oh!": {
        children: {
          "Structure Decks": { isLeaf: true },
          "Booster Boxes": { isLeaf: true },
          "Legendary Collections": { isLeaf: true },
          "Duel Decks": { isLeaf: true },
        },
      },
      "Magic: The Gathering": {
        children: {
          "Commander Decks": { isLeaf: true },
          "Draft Boosters": { isLeaf: true },
          "Set Boosters": { isLeaf: true },
          "Collector Boosters": { isLeaf: true },
        },
      },
    },
  },
  Beyblades: {
    children: {
      "Beyblade Burst": {
        children: {
          "Attack Types": { isLeaf: true },
          "Defense Types": { isLeaf: true },
          "Stamina Types": { isLeaf: true },
          "Balance Types": { isLeaf: true },
          "Starter Sets": { isLeaf: true },
          Launchers: { isLeaf: true },
        },
      },
      "Beyblade Metal Series": {
        children: {
          "Metal Fusion": { isLeaf: true },
          "Metal Masters": { isLeaf: true },
          "Metal Fury": { isLeaf: true },
        },
      },
    },
  },
  Figurines: {
    children: {
      "Anime Figures": {
        children: {
          Nendoroid: { isLeaf: true },
          Figma: { isLeaf: true },
          "Scale Figures": { isLeaf: true },
          "Prize Figures": { isLeaf: true },
        },
      },
      "Gaming Figures": {
        children: {
          "Action RPG": { isLeaf: true },
          "Fighting Games": { isLeaf: true },
          "Strategy Games": { isLeaf: true },
        },
      },
      "Collectible Statues": {
        children: {
          "Limited Edition": { isLeaf: true },
          "Exclusive Variants": { isLeaf: true },
          "Artist Series": { isLeaf: true },
        },
      },
    },
  },
  Accessories: {
    children: {
      "Card Sleeves": { isLeaf: true },
      "Deck Boxes": { isLeaf: true },
      Playmats: { isLeaf: true },
      "Storage Solutions": { isLeaf: true },
      "Display Cases": { isLeaf: true },
    },
  },
};

// Product templates for each category
const PRODUCT_TEMPLATES = {
  "Pokemon TCG": [
    {
      name: "Charizard VMAX",
      rarity: "Secret Rare",
      minPrice: 15000,
      maxPrice: 50000,
    },
    {
      name: "Pikachu VMAX",
      rarity: "Ultra Rare",
      minPrice: 8000,
      maxPrice: 25000,
    },
    { name: "Mewtwo GX", rarity: "Full Art", minPrice: 5000, maxPrice: 15000 },
    {
      name: "Rayquaza VMAX",
      rarity: "Rainbow Rare",
      minPrice: 12000,
      maxPrice: 35000,
    },
  ],
  "Yu-Gi-Oh!": [
    {
      name: "Blue-Eyes White Dragon",
      rarity: "Ghost Rare",
      minPrice: 20000,
      maxPrice: 60000,
    },
    {
      name: "Dark Magician",
      rarity: "Starlight Rare",
      minPrice: 18000,
      maxPrice: 45000,
    },
    {
      name: "Red-Eyes Black Dragon",
      rarity: "Ultimate Rare",
      minPrice: 10000,
      maxPrice: 30000,
    },
  ],
  "Beyblade Burst": [
    {
      name: "Valkyrie Evolution",
      type: "Attack",
      minPrice: 1500,
      maxPrice: 3500,
    },
    {
      name: "Spriggan Requiem",
      type: "Balance",
      minPrice: 2000,
      maxPrice: 4500,
    },
    { name: "Drain Fafnir", type: "Stamina", minPrice: 1800, maxPrice: 4000 },
  ],
  Nendoroid: [
    {
      name: "Naruto Uzumaki",
      series: "Naruto",
      minPrice: 3500,
      maxPrice: 6000,
    },
    { name: "Goku", series: "Dragon Ball", minPrice: 4000, maxPrice: 7000 },
    {
      name: "Sailor Moon",
      series: "Sailor Moon",
      minPrice: 3800,
      maxPrice: 6500,
    },
  ],
};

// User templates
const USER_TEMPLATES = [
  { name: "Alex Chen", email: "alex.chen@demo.justforview.in", role: "seller" },
  {
    name: "Priya Sharma",
    email: "priya.sharma@demo.justforview.in",
    role: "user",
  },
  { name: "John Smith", email: "john.smith@demo.justforview.in", role: "user" },
  {
    name: "Maria Garcia",
    email: "maria.garcia@demo.justforview.in",
    role: "user",
  },
  {
    name: "Kenji Tanaka",
    email: "kenji.tanaka@demo.justforview.in",
    role: "user",
  },
];

// Address templates
const ADDRESS_TEMPLATES = [
  { city: "Mumbai", state: "Maharashtra", pincode: "400001" },
  { city: "Delhi", state: "Delhi", pincode: "110001" },
  { city: "Bangalore", state: "Karnataka", pincode: "560001" },
  { city: "Chennai", state: "Tamil Nadu", pincode: "600001" },
  { city: "Kolkata", state: "West Bengal", pincode: "700001" },
];

export async function POST(request: NextRequest) {
  try {
    const db = getFirestoreAdmin();
    const timestamp = new Date();

    // Step 1: Create categories with multi-parent support
    const categoryMap = new Map<string, string>();
    let categoryCount = 0;

    async function createCategories(
      tree: any,
      parentId: string | null = null,
      parentIds: string[] = []
    ): Promise<void> {
      for (const [name, data] of Object.entries(tree)) {
        const catData = data as any;
        const categoryRef = db.collection("categories").doc();
        const categoryId = categoryRef.id;
        const categoryName = `${DEMO_PREFIX}${name}`;

        await categoryRef.set({
          name: categoryName,
          slug: categoryName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          description: `Demo category for ${name}`,
          parent_id: parentId,
          parent_ids: [...parentIds, ...(parentId ? [parentId] : [])],
          is_leaf: catData.isLeaf || false,
          is_active: true,
          is_featured: Math.random() > 0.7,
          product_count: 0,
          image: `https://picsum.photos/seed/cat-${categoryId}/400/300`,
          icon: null,
          created_at: timestamp,
          updated_at: timestamp,
        });

        categoryMap.set(name, categoryId);
        categoryCount++;

        if (catData.children) {
          await createCategories(catData.children, categoryId, [
            ...parentIds,
            ...(parentId ? [parentId] : []),
            categoryId,
          ]);
        }
      }
    }

    await createCategories(CATEGORY_TREE);

    // Step 2: Create users
    const userIds: { id: string; role: string; name: string }[] = [];

    for (const userTemplate of USER_TEMPLATES) {
      const userRef = db.collection("users").doc();
      const userId = userRef.id;

      await userRef.set({
        name: `${DEMO_PREFIX}${userTemplate.name}`,
        email: userTemplate.email,
        role: userTemplate.role,
        isActive: true,
        createdAt: timestamp,
        updatedAt: timestamp,
        // Demo password: "Demo@123"
        passwordHash: "$2a$10$demoHashForTestingOnly",
      });

      userIds.push({
        id: userId,
        role: userTemplate.role,
        name: userTemplate.name,
      });
    }

    const seller = userIds.find((u) => u.role === "seller")!;
    const buyers = userIds.filter((u) => u.role === "user");

    // Step 3: Create shop
    const shopRef = db.collection("shops").doc();
    const shopId = shopRef.id;

    await shopRef.set({
      name: `${DEMO_PREFIX}CollectorsHub - TCG & Collectibles`,
      slug: `${DEMO_PREFIX.toLowerCase()}collectorshub-tcg`,
      description:
        "Your one-stop shop for Trading Card Games, Beyblades, and Premium Figurines",
      owner_id: seller.id,
      email: "shop@collectorshub.demo.justforview.in",
      phone: "+91-9876543210",
      address: "123 Collector Street, Mumbai, Maharashtra 400001",
      is_active: true,
      status: "active",
      verified: true,
      featured: true,
      logo: `https://picsum.photos/seed/shop-${shopId}/200/200`,
      banner: `https://picsum.photos/seed/shop-banner-${shopId}/1200/400`,
      rating: 4.8,
      review_count: 0,
      total_products: 0,
      created_at: timestamp,
      updated_at: timestamp,
    });

    // Step 4: Create products (100 products with variants)
    const productIds: string[] = [];
    let productCount = 0;

    // Get leaf categories only
    const leafCategories = Array.from(categoryMap.entries()).filter(
      ([name]) => {
        // Find in tree if it's a leaf
        return (
          name.includes("Set") ||
          name.includes("Type") ||
          name.includes("Figure") ||
          name.includes("Booster")
        );
      }
    );

    for (let i = 0; i < 100; i++) {
      const [categoryName, categoryId] =
        leafCategories[i % leafCategories.length];
      const template = PRODUCT_TEMPLATES["Pokemon TCG"][i % 4]; // Use templates cyclically

      const productRef = db.collection("products").doc();
      const productId = productRef.id;

      const basePrice =
        template.minPrice +
        Math.random() * (template.maxPrice - template.minPrice);

      const stockCount = Math.floor(Math.random() * 50) + 10;

      // Generate 3-5 images for 60% of products, 1 image for others
      const imageCount =
        Math.random() < 0.6 ? 3 + Math.floor(Math.random() * 3) : 1;
      const productImages = Array.from(
        { length: imageCount },
        (_, idx) => `https://picsum.photos/seed/${productId}-img-${idx}/800/800`
      );

      // Add video to 60% of products
      const productVideos =
        Math.random() < 0.6
          ? [
              `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4`,
            ]
          : [];

      await productRef.set({
        name: `${DEMO_PREFIX}${template.name} #${i + 1}`,
        slug: `${DEMO_PREFIX.toLowerCase()}${template.name
          .toLowerCase()
          .replace(/\s+/g, "-")}-${i + 1}`,
        sku: `${DEMO_PREFIX}SKU-${String(i + 1).padStart(4, "0")}`,
        description: `Premium ${template.name} from ${categoryName} collection. Authentic and in mint condition.`,
        price: Math.round(basePrice),
        compare_at_price: Math.round(basePrice * 1.2),
        stock_count: stockCount,
        low_stock_threshold: 5,
        category_id: categoryId,
        shop_id: shopId,
        seller_id: seller.id,
        status: "published",
        is_active: true,
        is_featured: i < 20,
        brand: "Official",
        condition: "New",
        // Images and videos
        images: productImages,
        videos: productVideos,
        // Variants
        has_variants: true,
        variants: [
          {
            id: `${productId}-v1`,
            name: "Standard Edition",
            sku: `${productId}-STD`,
            price: Math.round(basePrice),
            stock_count: Math.floor(stockCount * 0.6),
          },
          {
            id: `${productId}-v2`,
            name: "Deluxe Edition",
            sku: `${productId}-DLX`,
            price: Math.round(basePrice * 1.3),
            stock_count: Math.floor(stockCount * 0.4),
          },
        ],
        created_at: timestamp,
        updated_at: timestamp,
      });

      productIds.push(productId);
      productCount++;
    }

    // Step 5: Create auctions (5 auctions from random products)
    const auctionIds: string[] = [];
    const auctionProductIds = productIds.slice(0, 5); // First 5 products

    for (let i = 0; i < 5; i++) {
      const productId = auctionProductIds[i];
      const auctionRef = db.collection("auctions").doc();
      const auctionId = auctionRef.id;

      const startDate = new Date(timestamp.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
      const endDate = new Date(timestamp.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

      const startingBid = 5000 + Math.random() * 15000;
      const title = `${DEMO_PREFIX}Auction #${i + 1} - Premium Collectible`;
      const auctionSlug = `${DEMO_PREFIX.toLowerCase()}${title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")}-${i}`;

      // Generate 3-5 images for 60% of auctions, 3 images for others
      const auctionImageCount =
        Math.random() < 0.6 ? 3 + Math.floor(Math.random() * 3) : 3;
      const auctionImages = Array.from(
        { length: auctionImageCount },
        (_, idx) =>
          `https://picsum.photos/seed/auction-${auctionId}-${idx}/800/800`
      );

      // Add video to 60% of auctions
      const auctionVideos =
        Math.random() < 0.6
          ? [
              `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4`,
            ]
          : [];

      await auctionRef.set({
        product_id: productId,
        shop_id: shopId,
        seller_id: seller.id,
        title,
        slug: auctionSlug,
        description: "Rare item up for auction. Don't miss this opportunity!",
        images: auctionImages,
        videos: auctionVideos,
        starting_bid: Math.round(startingBid),
        current_bid: Math.round(startingBid),
        bid_increment: 500,
        reserve_price: Math.round(startingBid * 1.5),
        start_time: startDate,
        end_time: endDate,
        status: "active",
        total_bids: 0,
        unique_bidders: 0,
        created_at: timestamp,
        updated_at: timestamp,
      });

      auctionIds.push(auctionId);
    }

    // Step 6: Create bids (4 buyers competing on all 5 auctions)
    let bidCount = 0;

    for (const auctionId of auctionIds) {
      const auctionDoc = await db.collection("auctions").doc(auctionId).get();
      const auctionData = auctionDoc.data();
      let currentBid = auctionData?.startingBid || 5000;

      // Each buyer places 3-5 bids on each auction
      for (const buyer of buyers) {
        const numBids = 3 + Math.floor(Math.random() * 3);

        for (let i = 0; i < numBids; i++) {
          currentBid += 500 + Math.floor(Math.random() * 1000);

          const bidRef = db.collection("bids").doc();
          await bidRef.set({
            auctionId,
            bidderId: buyer.id,
            bidderName: buyer.name,
            amount: currentBid,
            timestamp: new Date(timestamp.getTime() + bidCount * 60000), // Space out bids
            isAutoBid: false,
            status: "active",
            createdAt: timestamp,
          });

          bidCount++;
        }
      }

      // Update auction with final bid amount
      await db.collection("auctions").doc(auctionId).update({
        currentBid,
        totalBids: bidCount,
        uniqueBidders: buyers.length,
        updatedAt: timestamp,
      });
    }

    // Step 7: Create orders (buyers purchase products)
    let orderCount = 0;
    let orderItemCount = 0;

    for (let buyerIndex = 0; buyerIndex < buyers.length; buyerIndex++) {
      const buyer = buyers[buyerIndex];
      const numOrders = 2 + Math.floor(Math.random() * 3); // 2-4 orders per buyer

      for (let i = 0; i < numOrders; i++) {
        const orderRef = db.collection("orders").doc();
        const orderId = orderRef.id;

        const address =
          ADDRESS_TEMPLATES[buyerIndex % ADDRESS_TEMPLATES.length];
        const paymentMethods = ["card", "upi", "netbanking", "cod"];
        const paymentMethod =
          paymentMethods[Math.floor(Math.random() * paymentMethods.length)];

        const numItems = 1 + Math.floor(Math.random() * 3); // 1-3 items per order
        const orderProducts = productIds
          .slice(orderCount * 3, orderCount * 3 + numItems)
          .map((pid) => pid);

        let subtotal = 0;
        const items: any[] = [];

        for (const productId of orderProducts) {
          const price = 2000 + Math.random() * 8000;
          const quantity = 1;

          items.push({
            productId,
            variantId: `${productId}-v1`,
            quantity,
            price: Math.round(price),
            subtotal: Math.round(price * quantity),
          });

          subtotal += price * quantity;
          orderItemCount++;
        }

        const shippingFee = 200;
        const tax = subtotal * 0.18;
        const total = subtotal + shippingFee + tax;

        await orderRef.set({
          orderNumber: `${DEMO_PREFIX}ORD-${String(orderCount + 1).padStart(
            4,
            "0"
          )}`,
          buyerId: buyer.id,
          buyerName: buyer.name,
          shopId,
          sellerId: seller.id,
          items,
          subtotal: Math.round(subtotal),
          shippingFee,
          tax: Math.round(tax),
          total: Math.round(total),
          status: ["pending", "confirmed", "shipped", "delivered"][
            Math.floor(Math.random() * 4)
          ],
          paymentMethod,
          paymentStatus: paymentMethod === "cod" ? "pending" : "completed",
          shippingAddress: {
            street: `${Math.floor(Math.random() * 999) + 1}, Demo Street`,
            ...address,
          },
          createdAt: timestamp,
          updatedAt: timestamp,
        });

        // Create payment record
        if (paymentMethod !== "cod") {
          const paymentRef = db.collection("payments").doc();
          await paymentRef.set({
            orderId,
            amount: Math.round(total),
            method: paymentMethod,
            status: "completed",
            transactionId: `${DEMO_PREFIX}TXN-${nanoid(16)}`,
            createdAt: timestamp,
          });
        }

        // Create shipment record for shipped/delivered orders
        if (Math.random() > 0.5) {
          const shipmentRef = db.collection("shipments").doc();
          await shipmentRef.set({
            orderId,
            trackingNumber: `${DEMO_PREFIX}TRACK-${nanoid(12)}`,
            courier: ["Delhivery", "Blue Dart", "DTDC", "India Post"][
              Math.floor(Math.random() * 4)
            ],
            status: ["in_transit", "delivered"][Math.floor(Math.random() * 2)],
            createdAt: timestamp,
            updatedAt: timestamp,
          });
        }

        orderCount++;
      }
    }

    // Response
    return NextResponse.json({
      success: true,
      message: `Demo data created with ${DEMO_PREFIX} prefix`,
      summary: {
        prefix: DEMO_PREFIX,
        categories: categoryCount,
        users: userIds.length,
        shops: 1,
        products: productCount,
        auctions: auctionIds.length,
        bids: bidCount,
        orders: orderCount,
        orderItems: orderItemCount,
        payments: orderCount,
        shipments: Math.floor(orderCount * 0.5),
        reviews: 0,
        createdAt: timestamp.toISOString(),
      },
    });
  } catch (error: any) {
    console.error("Demo generation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate demo data" },
      { status: 500 }
    );
  }
}
