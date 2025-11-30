import { NextRequest, NextResponse } from "next/server";
import { Collections } from "@/app/api/lib/firebase/collections";

/**
 * POST /api/auctions/batch
 * Fetch multiple auctions by IDs
 * Used by homepage featured sections to display admin-curated auctions
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, error: "Auction IDs array is required" },
        { status: 400 }
      );
    }

    // Limit batch size to prevent abuse
    const limitedIds = ids.slice(0, 50);

    // Fetch auctions by IDs (using slug as document ID pattern)
    const auctions: any[] = [];
    
    // Firestore 'in' query supports max 30 items, so we chunk
    const chunks: string[][] = [];
    for (let i = 0; i < limitedIds.length; i += 30) {
      chunks.push(limitedIds.slice(i, i + 30));
    }

    for (const chunk of chunks) {
      // Try direct document access first (slug as ID)
      const docPromises = chunk.map(async (id) => {
        const doc = await Collections.auctions().doc(id).get();
        if (doc.exists) {
          return { id: doc.id, ...doc.data() };
        }
        return null;
      });
      
      const docs = await Promise.all(docPromises);
      const foundAuctions = docs.filter(Boolean);
      auctions.push(...foundAuctions);

      // For any not found by ID, try legacy query
      const foundIds = foundAuctions.map((a: any) => a.id);
      const missingIds = chunk.filter(id => !foundIds.includes(id));
      
      if (missingIds.length > 0) {
        const legacyQuery = await Collections.auctions()
          .where("slug", "in", missingIds)
          .get();
        
        legacyQuery.docs.forEach((doc) => {
          auctions.push({ id: doc.id, ...doc.data() });
        });
      }
    }

    // Transform and return in order requested
    const orderedAuctions = limitedIds
      .map((id) => auctions.find((a) => a.id === id || a.slug === id))
      .filter(Boolean)
      .map((a: any) => ({
        id: a.id,
        ...a,
        // Add camelCase aliases
        shopId: a.shop_id,
        categoryId: a.category_id,
        currentBid: a.current_bid,
        startingBid: a.starting_bid,
        bidCount: a.bid_count,
        startTime: a.start_time,
        endTime: a.end_time,
        featured: a.is_featured,
        createdAt: a.created_at,
        updatedAt: a.updated_at,
      }));

    return NextResponse.json({
      success: true,
      data: orderedAuctions,
    });
  } catch (error) {
    console.error("Error fetching auctions batch:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch auctions" },
      { status: 500 }
    );
  }
}
