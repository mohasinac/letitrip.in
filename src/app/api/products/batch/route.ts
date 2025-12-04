import { Collections } from "@/app/api/lib/firebase/collections";
import { logError } from "@/lib/firebase-error-logger";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/products/batch
 * Fetch multiple products by IDs
 * Used by homepage featured sections to display admin-curated products
 */
export async function POST(request: NextRequest) {
  let idsLength = 0;
  try {
    const body = await request.json();
    const { ids } = body;
    idsLength = ids?.length || 0;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, error: "Product IDs array is required" },
        { status: 400 }
      );
    }

    // Limit batch size to prevent abuse
    const limitedIds = ids.slice(0, 50);

    // Fetch products by IDs (using slug as document ID pattern)
    const products: any[] = [];

    // Firestore 'in' query supports max 30 items, so we chunk
    const chunks: string[][] = [];
    for (let i = 0; i < limitedIds.length; i += 30) {
      chunks.push(limitedIds.slice(i, i + 30));
    }

    for (const chunk of chunks) {
      // Try direct document access first (slug as ID)
      const docPromises = chunk.map(async (id) => {
        const doc = await Collections.products().doc(id).get();
        if (doc.exists) {
          return { id: doc.id, ...doc.data() };
        }
        return null;
      });

      const docs = await Promise.all(docPromises);
      const foundProducts = docs.filter(Boolean);
      products.push(...foundProducts);

      // For any not found by ID, try legacy query
      const foundIds = foundProducts.map((p: any) => p.id);
      const missingIds = chunk.filter((id) => !foundIds.includes(id));

      if (missingIds.length > 0) {
        // Try to find by id field or slug field
        const legacyQuery = await Collections.products()
          .where("slug", "in", missingIds)
          .get();

        legacyQuery.docs.forEach((doc) => {
          products.push({ id: doc.id, ...doc.data() });
        });
      }
    }

    // Transform and return in order requested
    const orderedProducts = limitedIds
      .map((id) => products.find((p) => p.id === id || p.slug === id))
      .filter(Boolean)
      .map((p: any) => ({
        id: p.id,
        ...p,
        // Add camelCase aliases
        shopId: p.shop_id,
        categoryId: p.category_id,
        stockCount: p.stock_count ?? p.stock_quantity ?? 0,
        featured: p.is_featured,
        originalPrice: p.compare_at_price,
        createdAt: p.created_at,
        updatedAt: p.updated_at,
      }));

    return NextResponse.json({
      success: true,
      data: orderedProducts,
    });
  } catch (error) {
    logError(error as Error, {
      component: "API.products.batch.POST",
      metadata: { idsCount: idsLength },
    });
    return NextResponse.json(
      { success: false, error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
