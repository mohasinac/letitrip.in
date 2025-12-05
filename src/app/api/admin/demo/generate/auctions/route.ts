/**
 * @fileoverview TypeScript Module
 * @module src/app/api/admin/demo/generate/auctions/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

import { NextRequest, NextResponse } from "next/server";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { COLLECTIONS } from "@/constants/database";

/**
 * DEMO_PREFIX constant
 * 
 * @constant
 * @type {any}
 * @description Configuration constant for demo prefix
 */
const DEMO_PREFIX = "DEMO_";

// Beyblade product images
const PRODUCT_IMAGES = [
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=800&fit=crop",
  "https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=800&h=800&fit=crop",
  "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&h=800&fit=crop",
  "https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=800&h=800&fit=crop",
  "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&h=800&fit=crop",
  "https://images.unsplash.com/photo-1560343776-97e7d202ff0e?w=800&h=800&fit=crop",
  "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&h=800&fit=crop",
  "https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=800&h=800&fit=crop",
  "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&h=800&fit=crop",
  "https://images.unsplash.com/photo-1614680376739-414d95ff43df?w=800&h=800&fit=crop",
  "https://images.unsplash.com/photo-1608889825205-eebdb9fc5806?w=800&h=800&fit=crop",
  "https:///**
 * AUCTION_VIDEOS constant
 * 
 * @constant
 * @type {any}
 * @description Configuration constant for auction videos
 */
images.unsplash.com/photo-1585386959984-a4155224a1ad?w=800&h=800&fit=crop",
];

// Sample videos for auction demos
const AUCTION_VIDEOS = [
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
];

// Rare/collectible Beyblade items for auctions
const AUCTION_ITEMS = [
  // Rare vintage items
  {
    /** Name */
    name: "Original Dragoon S - Mint Condition",
    /** Category */
    category: "Vintage Beyblades",
    /** Base Price */
    basePrice: 15000,
  },
  {
    /** Name */
    name: "First Edition Dranzer S - Sealed",
    /** Category */
    category: "Vintage Beyblades",
    /** Base Price */
    basePrice: 18000,
  },
  {
    /** Name */
    name: "Classic Driger S - Complete Set",
    /** Category */
    category: "Vintage Beyblades",
    /** Base Price */
    basePrice: 12000,
  },
  {
    /** Name */
    name: "Rare Draciel S - Original Box",
    /** Category */
    category: "Vintage Beyblades",
    /** Base Price */
    basePrice: 14000,
  },
  {
    /** Name */
    name: "HMS Dragoon MS - Near Mint",
    /** Category */
    category: "HMS (Heavy Metal System)",
    /** Base Price */
    basePrice: 22000,
  },
  {
    /** Name */
    name: "HMS Dranzer MS - Collector Grade",
    /** Category */
    category: "HMS (Heavy Metal System)",
    /** Base Price */
    basePrice: 25000,
  },

  // Tournament exclusives
  {
    /** Name */
    name: "World Championship Valkyrie 2023",
    /** Category */
    category: "Tournament Exclusives",
    /** Base Price */
    basePrice: 35000,
  },
  {
    /** Name */
    name: "Japan Tournament Gold Spriggan",
    /** Category */
    category: "Tournament Exclusives",
    /** Base Price */
    basePrice: 28000,
  },
  {
    /** Name */
    name: "Pro League Champion Fafnir",
    /** Category */
    category: "Tournament Exclusives",
    /** Base Price */
    basePrice: 32000,
  },
  {
    /** Name */
    name: "Asia Championship Longinus",
    /** Category */
    category: "Tournament Exclusives",
    /** Base Price */
    basePrice: 30000,
  },

  // Gold series
  {
    /** Name */
    name: "24K Gold Plated Valkyrie",
    /** Category */
    category: "Gold Series",
    /** Base Price */
    basePrice: 45000,
  },
  {
    /** Name */
    name: "Gold Edition Spriggan Requiem",
    /** Category */
    category: "Gold Series",
    /** Base Price */
    basePrice: 40000,
  },
  {
    /** Name */
    name: "Anniversary Gold Dragoon",
    /** Category */
    category: "Gold Series",
    /** Base Price */
    basePrice: 50000,
  },
  { name: "Limited Gold L-Drago", category: "Gold Series", basePrice: 38000 },

  // Store exclusives
  {
    /** Name */
    name: "Japan Import Limited Achilles",
    /** Category */
    category: "Store Exclusives",
    /** Base Price */
    basePrice: 8000,
  },
  {
    /** Name */
    name: "Korea Exclusive Belial",
    /** Category */
    category: "Store Exclusives",
    /** Base Price */
    basePrice: 9500,
  },
  {
    /** Name */
    name: "US Convention Exclusive Set",
    /** Category */
    category: "Store Exclusives",
    /** Base Price */
    basePrice: 12000,
  },

  // Anniversary editions
  {
    /** Name */
    name: "20th Anniversary Dragoon Set",
    /** Category */
    category: "Anniversary Editions",
    /** Base Price */
    basePrice: 55000,
  },
  {
    /** Name */
    name: "15th Anniversary Dranzer",
    /** Category */
    category: "Anniversary Editions",
    /** Base Price */
    basePrice: 42000,
  },
  {
    /** Name */
    name: "10th Anniversary Metal Series",
    /** Category */
    category: "Anniversary Editions",
    /** Base Price */
    basePrice: 38000,
  },

  // Rare finds
  {
    /** Name */
    name: "Prototype Valkyrie - Test Version",
    /** Category */
    category: "Rare Finds",
    /** Base Price */
    basePrice: 75000,
  },
  { name: "Factory Sample Spriggan", category: "Rare Finds", basePrice: 60000 },
  { name: "Pre-Production Fafnir", category: "Rare Finds", basePrice: 65000 },
  {
    /** Name */
    name: "Limited Color Variant Longinus",
    /** Category */
    category: "Rare Finds",
    /** Base Price */
    basePrice: 25000,
  },

  // Collector items
  {
    /** Name */
    name: "Complete Metal Fusion Set - Sealed",
    /** Category */
    category: "Collector Items",
    /** Base Price */
    basePrice: 85000,
  },
  {
    /** Name */
    name: "Full HMS Collection - 12 Beyblades",
    /** Category */
    category: "Collector Items",
    /** Base Price */
    basePrice: 120000,
  },
  {
    /** Name */
    name: "Original Series Complete Box",
    /** Category */
    category: "Collector Items",
    /** Base Price */
    basePrice: 95000,
  },
  {
    /** Name */
    name: "Burst Series Master Collection",
    /** Category */
    category: "Collector Items",
    /** Base Price */
    basePrice: 70000,
  },

  // Beyblade X rare
  { name: "First Edition Dran Sword", category: "X Attack", basePrice: 5000 },
  { name: "Limited Cobalt Drake", category: "X Defense", basePrice: 6000 },
  { name: "Exclusive Wizard Rod", category: "X Stamina", basePrice: 5500 },

  // Metal series rare
  {
    /** Name */
    name: "Lightning L-Drago - Mint",
    /** Category */
    category: "Metal Fusion",
    /** Base Price */
    basePrice: 8000,
  },
  {
    /** Name */
    name: "Galaxy Pegasus - Sealed",
    /** Category */
    category: "Metal Masters",
    /** Base Price */
    basePrice: 9000,
  },
  {
    /** Name */
    name: "Diablo Nemesis - Complete",
    /** Category */
    category: "Metal Fury",
    /** Base Price */
    basePrice: 12000,
  },
];

/**
 * Function: P O S T
 */
/**
 * Performs p o s t operation
 *
 * @param {NextRequest} request - The request
 *
 * @returns {Promise<any>} Promise resolving to post result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * POST(request);
 */

/**
 * Performs p o s t operation
 *
 * @param {NextRequest} request - The request
 *
 * @returns {Promise<any>} Promise resolving to post result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * POST(request);
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { shops, productsByShop, categoryMap, scale = 10 } = body;

    if (!shops || !Array.isArray(shops) || shops.length === 0) {
      return NextResponse.json(
        { success: false, error: "Shops data required" },
        { status: 400 },
      );
    }

    if (!productsByShop || Object.keys(productsByShop).length === 0) {
      return NextResponse.json(
        { success: false, error: "Products by shop data required" },
        { status: 400 },
      );
    }

    const db = getFirestoreAdmin();
    const timestamp = new Date();
    const createdAuctions: string[] = [];

    // Track auction counts per category: { categoryId: { live, ended } }
    const auctionStats: Record<string, { live: number; ended: number }> = {};

    // Create auctions based on scale (scale × 25)
    const auctionsPerShop = Math.ceil((scale * 25) / shops.length);
    const totalAuctions = scale * 25;

    for (let i = 0; i < totalAuctions; i++) {
      const shopIndex = Math.floor(i / auctionsPerShop);
      if (shopIndex >= shops.length) break;

      const currentShop = shops[shopIndex];
      const shopProducts = productsByShop[currentShop.id] || [];
      const productId =
        shopProducts[i % Math.max(shopProducts.length, 1)] || "";

      // Get auction item details
      const auctionItem = AUCTION_ITEMS[i % AUCTION_ITEMS.length];

      // Find category ID for this auction item
      let categoryId = "";
      if (categoryMap) {
        categoryId = categoryMap[auctionItem.category] || "";
      }

      const auctionRef = db.collection(COLLECTIONS.AUCTIONS).doc();

      // All auctions are LIVE with end dates 3-7 days in the future
      // Auctions can run max 7 days and demo should show active auctions
      const now = Date.now();
      const startDate = new Date(
        now - Math.floor(Math.random() * 2) * 24 * 60 * 60 * 1000,
      ); // Started 0-2 days ago
      const daysUntilEnd = 3 + Math.floor(Math.random() * 5); // 3-7 days from now
      const endDate = new Date(now + daysUntilEnd * 24 * 60 * 60 * 1000);

      const startingBid = auctionItem.basePrice * (0.3 + Math.random() * 0.4); // 30-70% of base price
      const currentBid = startingBid * (1 + Math.random() * 0.5); // Live auctions with some bids

      const title = `${DEMO_PREFIX}${auctionItem.name}`;

      // Generate 4-6 images per auction - use shuffled selection for variety
      const imageCount = 4 + Math.floor(Math.random() * 3);
      // Shuffle and pick unique images for this auction
      /**
 * Performs shuffled images operation
 *
 * @param {any} ( - The (
 *
 * @returns {any} The shuffledimages result
 *
 */
const shuffledImages = [...PRODUCT_IMAGES].sort(
        () => Math.random() - 0.5,
      );
      const auctionImages = shuffledImages.slice(0, imageCount);

      // 35% of auctions have videos
      const hasVideo = Math.random() < 0.35;
      const auctionVideos = hasVideo
        ? [AUCTION_VIDEOS[i % AUCTION_VIDEOS.length]]
        : [];

      // Determine condition for auction items
      const conditions = ["Mint", "Near Mint", "Excellent", "Good", "Fair"];
      const condition =
        conditions[Math.floor(Math.random() * conditions.length)];

      const status = "active"; // All demo auctions are live
      const totalBids = 1 + Math.floor(Math.random() * 15); // 1-15 bids on live auctions

      await auctionRef.set({
        product_id: productId,
        shop_id: currentShop.id,
        seller_id: currentShop.ownerId,
        category_id: categoryId,
        title,
        /** Slug */
        slug: title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .slice(0, 100),
        /** Description */
        description: `Rare ${auctionItem.name} up for auction! ${condition} condition. Perfect for serious collectors. Certificate of authenticity included.`,
        /** Images */
        images: auctionImages,
        /** Videos */
        videos: auctionVideos,
        starting_bid: Math.round(startingBid),
        current_bid: Math.round(currentBid),
        bid_increment: [100, 200, 500, 1000][i % 4],
        reserve_price: Math.round(auctionItem.basePrice * 0.8),
        buy_now_price: Math.round(auctionItem.basePrice * 1.5),
        start_time: startDate,
        end_time: endDate,
        status,
        condition,
        is_featured: i % 5 < 2,
        bid_count: totalBids,
        total_bids: totalBids,
        unique_bidders: Math.floor(totalBids * 0.6) + 1,
        /** Watchers */
        watchers: Math.floor(Math.random() * 50) + 5,
        view_count: Math.floor(Math.random() * 500) + 50,
        /** Tags */
        tags: ["beyblade", "rare", "collectible", condition.toLowerCase()],
        created_at: timestamp,
        updated_at: timestamp,
      });

      createdAuctions.push(auctionRef.id);

      // Track auction stats per category - all are live
      if (categoryId) {
        if (!auctionStats[categoryId]) {
          auctionStats[categoryId] = { live: 0, ended: 0 };
        }
        auctionStats[categoryId].live++; // All demo auctions are live
      }
    }

    // Update category auction counts
    for (const [catId, stats] of Object.entries(auctionStats)) {
      await db.collection(COLLECTIONS.CATEGORIES).doc(catId).update({
        live_auction_count: stats.live,
        ended_auction_count: stats.ended,
      });
    }

    return NextResponse.json({
      /** Success */
      success: true,
      /** Step */
      step: "auctions",
      /** Data */
      data: {
        /** Count */
        count: createdAuctions.length,
        /** Auctions */
        auctions: createdAuctions,
        auctionStats,
      },
    });
  } catch (error: unknown) {
    console.error("Demo auctions error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to generate auctions";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
