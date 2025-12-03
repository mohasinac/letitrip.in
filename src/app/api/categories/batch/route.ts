import { NextRequest, NextResponse } from "next/server";
import { Collections } from "@/app/api/lib/firebase/collections";

/**
 * POST /api/categories/batch
 * Fetch multiple categories by IDs/slugs
 * Used by homepage featured sections to display admin-curated categories
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, error: "Category IDs array is required" },
        { status: 400 },
      );
    }

    // Limit batch size to prevent abuse
    const limitedIds = ids.slice(0, 50);

    // Fetch categories by IDs (using slug as document ID pattern)
    const categories: any[] = [];

    // Firestore 'in' query supports max 30 items, so we chunk
    const chunks: string[][] = [];
    for (let i = 0; i < limitedIds.length; i += 30) {
      chunks.push(limitedIds.slice(i, i + 30));
    }

    for (const chunk of chunks) {
      // Try direct document access first (slug as ID)
      const docPromises = chunk.map(async (id) => {
        const doc = await Collections.categories().doc(id).get();
        if (doc.exists) {
          return { id: doc.id, ...doc.data() };
        }
        return null;
      });

      const docs = await Promise.all(docPromises);
      const foundCategories = docs.filter(Boolean);
      categories.push(...foundCategories);

      // For any not found by ID, try legacy query
      const foundIds = foundCategories.map((c: any) => c.id);
      const missingIds = chunk.filter((id) => !foundIds.includes(id));

      if (missingIds.length > 0) {
        const legacyQuery = await Collections.categories()
          .where("slug", "in", missingIds)
          .get();

        legacyQuery.docs.forEach((doc) => {
          categories.push({ id: doc.id, ...doc.data() });
        });
      }
    }

    // Transform and return in order requested
    const orderedCategories = limitedIds
      .map((id) => categories.find((c) => c.id === id || c.slug === id))
      .filter(Boolean)
      .map((c: any) => ({
        id: c.id,
        ...c,
        // Add camelCase aliases
        parentId: c.parent_id,
        parentIds: c.parent_ids || [],
        childrenIds: c.children_ids || [],
        productCount: c.product_count || 0,
        isActive: c.is_active,
        isFeatured: c.is_featured,
        showOnHomepage: c.show_on_homepage,
        createdAt: c.created_at,
        updatedAt: c.updated_at,
      }));

    return NextResponse.json({
      success: true,
      data: orderedCategories,
    });
  } catch (error) {
    console.error("Error fetching categories batch:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch categories" },
      { status: 500 },
    );
  }
}
