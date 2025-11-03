import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/database/admin";

/**
 * POST /api/admin/migrate-products
 * Migrates products from seller_products to products collection
 * Admin only endpoint
 */
export async function POST(request: NextRequest) {
  try {
    // TODO: Add admin authentication check here
    const db = getAdminDb();

    console.log("?? Starting migration: seller_products ? products");

    // Get all seller_products
    const sellerProductsSnapshot = await db.collection("seller_products").get();

    if (sellerProductsSnapshot.empty) {
      return NextResponse.json({
        success: false,
        message: "No products found in seller_products collection",
      });
    }

    console.log(`?? Found ${sellerProductsSnapshot.size} products in seller_products`);

    const batch = db.batch();
    let migratedCount = 0;
    let skippedCount = 0;
    const errors = [];

    for (const doc of sellerProductsSnapshot.docs) {
      const data = doc.data() as any;
      const productId = doc.id;

      try {
        // Check if product already exists
        const existingProduct = await db.collection("products").doc(productId).get();

        if (existingProduct.exists) {
          console.log(`??  Skipping ${data.name} - already exists`);
          skippedCount++;
          continue;
        }

        // Transform the data structure
        const productData = {
          // Basic Info
          name: data.name || "",
          slug: data.seo?.slug || data.slug || "",
          description: data.description || "",

          // Seller Info
          sellerId: data.sellerId || "",
          sellerName: data.sellerName || "",

          // Category (use 'category' as primary field)
          category: data.categoryId || data.category || "",
          categoryId: data.categoryId || data.category || "",

          // Pricing
          price: data.pricing?.price || data.price || 0,
          compareAtPrice: data.pricing?.compareAtPrice || data.compareAtPrice || null,
          costPerItem: data.pricing?.costPerItem || null,
          taxable: data.pricing?.taxable || false,

          // Inventory
          quantity: data.inventory?.quantity || data.quantity || 0,
          sku: data.inventory?.sku || data.sku || "",
          barcode: data.inventory?.barcode || "",
          trackQuantity: data.inventory?.trackQuantity !== false,

          // Images
          images: data.images || [],

          // Status & Visibility
          status: data.status || "draft",
          featured: data.featured || false,

          // SEO
          seo: {
            title: data.seo?.title || data.name,
            description: data.seo?.description || data.description,
            keywords: data.seo?.keywords || [],
            slug: data.seo?.slug || data.slug,
          },

          // Metadata
          tags: data.tags || [],
          rating: data.rating || 0,
          reviewCount: data.reviewCount || 0,

          // Timestamps
          createdAt: data.createdAt || new Date(),
          updatedAt: new Date(),
        };

        // Add to batch
        const productRef = db.collection("products").doc(productId);
        batch.set(productRef, productData);

        console.log(`? Queued: ${data.name}`);
        migratedCount++;

        // Commit batch every 450 operations (Firestore limit is 500)
        if (migratedCount % 450 === 0) {
          await batch.commit();
          console.log(`?? Committed batch of ${migratedCount} products`);
        }
      } catch (error: any) {
        console.error(`? Error processing ${data.name}:`, error.message);
        errors.push({ product: data.name, error: error.message });
      }
    }

    // Commit remaining items
    if (migratedCount % 450 !== 0) {
      await batch.commit();
      console.log(`?? Committed final batch`);
    }

    return NextResponse.json({
      success: true,
      message: "Migration completed",
      stats: {
        migrated: migratedCount,
        skipped: skippedCount,
        errors: errors.length,
      },
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error("Migration failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Migration failed",
      },
      { status: 500 }
    );
  }
}
