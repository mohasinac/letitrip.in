import { Collections } from "@/app/api/lib/firebase/collections";
import { logError } from "@/lib/firebase-error-logger";
import { NextRequest, NextResponse } from "next/server";

// GET /api/products/[slug]/similar - up to 10, diverse shops
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  let slug: string | undefined;
  try {
    const awaitedParams = await params;
    slug = awaitedParams.slug;
    const limit = parseInt(
      new URL(request.url).searchParams.get("limit") || "10",
      10
    );

    const prodSnap = await Collections.products()
      .where("slug", "==", slug)
      .limit(1)
      .get();
    if (prodSnap.empty)
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    const prod: any = { id: prodSnap.docs[0].id, ...prodSnap.docs[0].data() };

    const results: any[] = [];
    const seenShops = new Set<string>();

    // Level 1: same leaf category
    const q1 = await Collections.products()
      .where("category_id", "==", prod.category_id)
      .limit(50)
      .get();
    for (const d of q1.docs) {
      const p = { id: d.id, ...d.data() } as any;
      if (p.slug === slug) continue;
      if (!seenShops.has(p.shop_id)) {
        seenShops.add(p.shop_id);
        results.push(p);
      }
      if (results.length >= limit) break;
    }

    // If needed, widen scope (simple placeholder, assumes category has parent_id)
    if (results.length < limit && prod.category_parent_id) {
      const q2 = await Collections.products()
        .where("category_parent_id", "==", prod.category_parent_id)
        .limit(50)
        .get();
      for (const d of q2.docs) {
        const p = { id: d.id, ...d.data() } as any;
        if (p.slug === slug) continue;
        if (!seenShops.has(p.shop_id)) {
          seenShops.add(p.shop_id);
          results.push(p);
        }
        if (results.length >= limit) break;
      }
    }

    return NextResponse.json({ success: true, data: results.slice(0, limit) });
  } catch (error) {
    logError(error as Error, {
      component: "API.products.slug.similar.GET",
      metadata: { slug },
    });
    return NextResponse.json(
      { success: false, error: "Failed to load similar products" },
      { status: 500 }
    );
  }
}
