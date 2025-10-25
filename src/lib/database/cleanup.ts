/**
 * Firebase Data Cleanup Script
 * Run this to remove seeded sample data from the database
 */

import { 
  collection, 
  getDocs, 
  deleteDoc,
  doc,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { db } from './config';
import { getAdminDb } from './admin';

export async function cleanupSeededData() {
  try {
    console.log("Starting cleanup of seeded data...");

    // List of product slugs for seeded products (from initialize.ts)
    const seededProductSlugs = [
      "thunder-strike-battle-axe",
      "thunder-strike-battle-axe-silver", 
      "crimson-blade-sword",
      "dragon-scale-armor-set-medium",
      "dragon-scale-armor-set-large",
      "shadow-guard-shield",
      "mystic-crystal-cards-booster",
      "mystic-crystal-starter-deck",
      "elemental-warriors-elite-box",
      "legendary-hero-azurion-figurine",
      "dragon-lord-malachar-deluxe",
      "battle-strategy-master-game",
      "quick-clash-card-game",
      "soundwave-pro-gaming-headset-black",
      "soundwave-pro-gaming-headset-white",
      "mechmaster-pro-gaming-keyboard",
      "thunder-strike-battle-axe-gold",
      "phantom-cloak-stealth-gear",
      "warriors-quest-digital-deluxe"
    ];

    // List of category slugs for seeded categories (from initialize.ts)
    const seededCategorySlugs = [
      "battle-gear-equipment", 
      "collectibles-memorabilia", 
      "gaming-entertainment", 
      "accessories-parts",
      "weapons-armaments",
      "protective-gear", 
      "trading-cards",
      "figurines-models",
      "board-games",
      "digital-games"
    ];

    // List of seller IDs for seeded sellers (from initialize.ts)
    const seededSellerIds = [
      "seller-warcraft-armory",
      "seller-dragonforge", 
      "seller-crystal-games",
      "seller-epic-collectibles",
      "seller-strategic-gaming",
      "seller-audiotech",
      "seller-digital-realm"
    ];

    // List of auction IDs for seeded auctions (from initialize.ts)
    const seededAuctionIds = [
      "auction-001",
      "auction-002", 
      "auction-003",
      "auction-004"
    ];

    let deletedCount = {
      products: 0,
      categories: 0,
      auctions: 0,
      sellers: 0
    };

    // Use admin database for server-side operations
    const adminDb = getAdminDb();

    // Delete seeded auctions first (by specific IDs)
    console.log("Removing seeded auctions...");
    for (const auctionId of seededAuctionIds) {
      try {
        await adminDb.collection('auctions').doc(auctionId).delete();
        deletedCount.auctions++;
        console.log(`Deleted auction: ${auctionId}`);
      } catch (error) {
        console.log(`Auction ${auctionId} not found or already deleted`);
      }
    }

    // Delete seeded products (by slugs)
    console.log("Removing seeded products...");
    for (const slug of seededProductSlugs) {
      try {
        await adminDb.collection('products').doc(slug).delete();
        deletedCount.products++;
        console.log(`Deleted product: ${slug}`);
      } catch (error) {
        console.log(`Product ${slug} not found or already deleted`);
      }
    }

    // Delete seeded sellers
    console.log("Removing seeded sellers...");
    for (const sellerId of seededSellerIds) {
      try {
        await adminDb.collection('sellers').doc(sellerId).delete();
        deletedCount.sellers++;
        console.log(`Deleted seller: ${sellerId}`);
      } catch (error) {
        console.log(`Seller ${sellerId} not found or already deleted`);
      }
    }

    // Delete seeded categories (children first, then parents)
    console.log("Removing seeded categories...");
    
    // Child categories first
    const childCategorySlugs = [
      "weapons-armaments", "protective-gear", "trading-cards", 
      "figurines-models", "board-games", "digital-games"
    ];
    
    for (const slug of childCategorySlugs) {
      try {
        await adminDb.collection('categories').doc(slug).delete();
        deletedCount.categories++;
        console.log(`Deleted child category: ${slug}`);
      } catch (error) {
        console.log(`Category ${slug} not found or already deleted`);
      }
    }

    // Parent categories last
    const parentCategorySlugs = [
      "battle-gear-equipment", "collectibles-memorabilia", 
      "gaming-entertainment", "accessories-parts"
    ];
    
    for (const slug of parentCategorySlugs) {
      try {
        await adminDb.collection('categories').doc(slug).delete();
        deletedCount.categories++;
        console.log(`Deleted parent category: ${slug}`);
      } catch (error) {
        console.log(`Category ${slug} not found or already deleted`);
      }
    }

    console.log("Cleanup completed successfully!");
    console.log(`Deleted ${deletedCount.products} products`);
    console.log(`Deleted ${deletedCount.sellers} sellers`);
    console.log(`Deleted ${deletedCount.categories} categories`);
    console.log(`Deleted ${deletedCount.auctions} auctions`);

    return {
      success: true,
      message: "Seeded data cleanup completed successfully",
      deletedCount
    };

  } catch (error) {
    console.error("Error during cleanup:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      message: "Failed to cleanup seeded data"
    };
  }
}

export async function cleanupAllData() {
  try {
    console.log("WARNING: This will delete ALL data from the database!");
    console.log("Starting complete database cleanup...");

    let deletedCount = {
      products: 0,
      categories: 0,
      auctions: 0,
      sellers: 0
    };

    // Use admin database for server-side operations
    const adminDb = getAdminDb();

    // Delete all auctions
    console.log("Deleting all auctions...");
    const auctionsSnapshot = await adminDb.collection('auctions').get();
    for (const auctionDoc of auctionsSnapshot.docs) {
      await auctionDoc.ref.delete();
      deletedCount.auctions++;
    }

    // Delete all products
    console.log("Deleting all products...");
    const productsSnapshot = await adminDb.collection('products').get();
    for (const productDoc of productsSnapshot.docs) {
      await productDoc.ref.delete();
      deletedCount.products++;
    }

    // Delete all sellers
    console.log("Deleting all sellers...");
    const sellersSnapshot = await adminDb.collection('sellers').get();
    for (const sellerDoc of sellersSnapshot.docs) {
      await sellerDoc.ref.delete();
      deletedCount.sellers++;
    }

    // Delete all categories (children first)
    console.log("Deleting all categories...");
    const categoriesSnapshot = await adminDb.collection('categories').get();
    const allCategories = categoriesSnapshot.docs.map(doc => ({
      id: doc.id,
      data: doc.data(),
      ref: doc.ref
    }));

    // Sort to delete children first
    const childCategories = allCategories.filter(cat => cat.data.parentId);
    const parentCategories = allCategories.filter(cat => !cat.data.parentId);

    for (const category of [...childCategories, ...parentCategories]) {
      await category.ref.delete();
      deletedCount.categories++;
    }

    console.log("Complete cleanup finished!");
    console.log(`Deleted ${deletedCount.products} products`);
    console.log(`Deleted ${deletedCount.sellers} sellers`);
    console.log(`Deleted ${deletedCount.categories} categories`);
    console.log(`Deleted ${deletedCount.auctions} auctions`);

    return {
      success: true,
      message: "Complete database cleanup finished",
      deletedCount
    };

  } catch (error) {
    console.error("Error during complete cleanup:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      message: "Failed to complete database cleanup"
    };
  }
}
