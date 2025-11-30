import { NextRequest, NextResponse } from "next/server";
import { Collections } from "@/app/api/lib/firebase/collections";

/**
 * POST /api/shops/batch
 * Fetch multiple shops by IDs/slugs
 * Used by homepage featured sections to display admin-curated shops
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, error: "Shop IDs array is required" },
        { status: 400 }
      );
    }

    // Limit batch size to prevent abuse
    const limitedIds = ids.slice(0, 50);

    // Fetch shops by IDs (using slug as document ID pattern)
    const shops: any[] = [];
    
    // Firestore 'in' query supports max 30 items, so we chunk
    const chunks: string[][] = [];
    for (let i = 0; i < limitedIds.length; i += 30) {
      chunks.push(limitedIds.slice(i, i + 30));
    }

    for (const chunk of chunks) {
      // Try direct document access first (slug as ID)
      const docPromises = chunk.map(async (id) => {
        const doc = await Collections.shops().doc(id).get();
        if (doc.exists) {
          return { id: doc.id, ...doc.data() };
        }
        return null;
      });
      
      const docs = await Promise.all(docPromises);
      const foundShops = docs.filter(Boolean);
      shops.push(...foundShops);

      // For any not found by ID, try legacy query
      const foundIds = foundShops.map((s: any) => s.id);
      const missingIds = chunk.filter(id => !foundIds.includes(id));
      
      if (missingIds.length > 0) {
        const legacyQuery = await Collections.shops()
          .where("slug", "in", missingIds)
          .get();
        
        legacyQuery.docs.forEach((doc) => {
          shops.push({ id: doc.id, ...doc.data() });
        });
      }
    }

    // Transform and return in order requested
    const orderedShops = limitedIds
      .map((id) => shops.find((s) => s.id === id || s.slug === id))
      .filter(Boolean)
      .map((s: any) => ({
        id: s.id,
        ...s,
        // Add camelCase aliases
        ownerId: s.owner_id,
        productCount: s.product_count || 0,
        auctionCount: s.auction_count || 0,
        isVerified: s.is_verified,
        isActive: s.is_active,
        createdAt: s.created_at,
        updatedAt: s.updated_at,
      }));

    return NextResponse.json({
      success: true,
      data: orderedShops,
    });
  } catch (error) {
    console.error("Error fetching shops batch:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch shops" },
      { status: 500 }
    );
  }
}
