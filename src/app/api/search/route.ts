import { Collections } from "@/app/api/lib/firebase/collections";
import { apiRateLimiter } from "@/app/api/lib/utils/rate-limiter";
import { logError } from "@/lib/firebase-error-logger";
import { NextRequest, NextResponse } from "next/server";

// Utility: safely get number from query
function toNumber(value: string | null, fallback: number): number {
  if (!value) return fallback;
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

// Resolve category slug to ID
async function resolveCategorySlug(
  categorySlug?: string | null,
): Promise<string | null> {
  if (!categorySlug) return null;
  const snap = await Collections.categories()
    .where("slug", "==", categorySlug)
    .limit(1)
    .get();
  if (snap.empty) return null;
  return snap.docs[0].id;
}

export async function GET(req: NextRequest) {
  // Rate limiting
  const identifier =
    req.headers.get("x-forwarded-for") ||
    req.headers.get("x-real-ip") ||
    "unknown";
  if (!apiRateLimiter.check(identifier)) {
    return NextResponse.json(
      { success: false, error: "Too many requests. Please try again later." },
      { status: 429 },
    );
  }

  try {
    const { searchParams } = new URL(req.url);

    const type = (searchParams.get("type") || "products").toLowerCase(); // products | auctions
    const q = (searchParams.get("q") || "").trim().toLowerCase();
    const page = Math.max(1, toNumber(searchParams.get("page"), 1));
    const limit = Math.min(
      100,
      Math.max(1, toNumber(searchParams.get("limit"), 20)),
    );

    const shopSlug = searchParams.get("shop_slug");
    const categorySlug = searchParams.get("category_slug");
    const minPrice = searchParams.get("min_price");
    const maxPrice = searchParams.get("max_price");
    const inStock =
      (searchParams.get("in_stock") || "").toLowerCase() === "true";
    const sort = (
      searchParams.get("sort") ||
      (type === "auctions" ? "endingSoon" : "latest")
    ).toLowerCase();

    // Resolve optional slugs
    let shopId: string | null = null;
    if (shopSlug) {
      const shopSnap = await Collections.shops()
        .where("slug", "==", shopSlug)
        .limit(1)
        .get();
      if (!shopSnap.empty) shopId = shopSnap.docs[0].id;
      else
        return NextResponse.json(
          { success: false, error: "Shop not found" },
          { status: 404 },
        );
    }
    const categoryId = await resolveCategorySlug(categorySlug);
    if (categorySlug && !categoryId) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 },
      );
    }

    // Build base query
    const ref =
      type === "auctions" ? Collections.auctions() : Collections.products();
    let query: any = ref as any;

    // Common filters
    if (type === "products") {
      query = query
        .where("is_deleted", "==", false)
        .where("status", "==", "published");
      if (inStock) query = query.where("stock", ">", 0);
      if (shopId) query = query.where("shop_id", "==", shopId);
      if (categoryId) query = query.where("category_id", "==", categoryId);
      if (minPrice) query = query.where("price", ">=", Number(minPrice));
      if (maxPrice) query = query.where("price", "<=", Number(maxPrice));
    } else {
      // auctions
      query = query.where("status", "in", ["active", "live"]);
      if (shopId) query = query.where("shop_id", "==", shopId);
      if (categoryId) query = query.where("category_id", "==", categoryId);
      if (minPrice) query = query.where("current_bid", ">=", Number(minPrice));
      if (maxPrice) query = query.where("current_bid", "<=", Number(maxPrice));
    }

    // Fetch size: grab a chunk then rank/paginate in memory when q present
    const needsRelevance = q.length > 0 && sort === "relevance";

    // Safe Firestore ordering (avoid conflicting with range filters)
    if (!needsRelevance) {
      if (type === "products") {
        if (sort === "latest") query = query.orderBy("created_at", "desc");
        else if (sort === "price-asc") query = query.orderBy("price", "asc");
        else if (sort === "price-desc") query = query.orderBy("price", "desc");
        else query = query.orderBy("created_at", "desc");
      } else {
        if (sort === "endingsoon" || sort === "ending-soon")
          query = query.orderBy("end_time", "asc");
        else if (sort === "price-asc")
          query = query.orderBy("current_bid", "asc");
        else if (sort === "price-desc")
          query = query.orderBy("current_bid", "desc");
        else query = query.orderBy("end_time", "asc");
      }
    }

    const fetchLimit = needsRelevance ? Math.min(200, limit * page * 3) : limit;
    query = query.limit(fetchLimit);

    const snap = await query.get();
    let items = snap.docs.map((d: any) => ({
      id: d.id,
      ...(d.data() as any),
    }));

    const qWords = q.split(/\s+/).filter(Boolean);

    // Compute basic relevance if requested
    if (needsRelevance && qWords.length) {
      const primitives = (val: any): string =>
        (typeof val === "string"
          ? val
          : Array.isArray(val)
            ? val.join(" ")
            : ""
        )
          .toString()
          .toLowerCase();

      const scoreFor = (item: any): number => {
        const name = primitives(item.name || item.title || "");
        const desc = primitives(item.description || "");
        const tags = primitives(item.tags || item.keywords || []);
        let score = 0;
        for (const w of qWords) {
          if (!w) continue;
          if (name.startsWith(w)) score += 50;
          else if (name.includes(w)) score += 30;
          if (tags.includes(w)) score += 20;
          if (desc.includes(w)) score += 10;
        }
        // Minor boost for featured
        if (item.is_featured) score += 5;
        return score;
      };

      items = items
        .map((it: any) => ({ ...it, __score: scoreFor(it) }))
        .filter((it: any) => it.__score > 0)
        .sort((a: any, b: any) => {
          if (b.__score !== a.__score) return b.__score - a.__score;
          // tiebreaker
          const aTime = itDate(a.created_at) || itDate(a.createdAt) || 0;
          const bTime = itDate(b.created_at) || itDate(b.createdAt) || 0;
          return bTime - aTime;
        })
        .map(({ __score, ...rest }: any) => rest);
    }

    // Secondary in-memory sort for non-relevance if needed and field missing
    if (!needsRelevance) {
      if (type === "products") {
        if (sort === "latest")
          items.sort(
            (a: any, b: any) =>
              (itDate(b.created_at) || itDate(b.createdAt) || 0) -
              (itDate(a.created_at) || itDate(a.createdAt) || 0),
          );
        else if (sort === "price-asc")
          items.sort((a: any, b: any) => (a.price || 0) - (b.price || 0));
        else if (sort === "price-desc")
          items.sort((a: any, b: any) => (b.price || 0) - (a.price || 0));
      } else {
        if (sort === "endingsoon" || sort === "ending-soon")
          items.sort(
            (a: any, b: any) =>
              (itDate(a.end_time) || 0) - (itDate(b.end_time) || 0),
          );
        else if (sort === "price-asc")
          items.sort(
            (a: any, b: any) => (a.current_bid || 0) - (b.current_bid || 0),
          );
        else if (sort === "price-desc")
          items.sort(
            (a: any, b: any) => (b.current_bid || 0) - (a.current_bid || 0),
          );
      }
    }

    const total = items.length;
    const start = (page - 1) * limit;
    const paged = items.slice(start, start + limit);

    return NextResponse.json({
      success: true,
      type,
      data: paged,
      pagination: { page, limit, total, hasMore: start + limit < total },
    });
  } catch (error) {
    logError(error as Error, { component: "API.search" });
    return NextResponse.json(
      { success: false, error: "Search failed" },
      { status: 500 },
    );
  }
}

function itDate(v: any): number | null {
  if (!v) return null;
  try {
    // Firestore Timestamp support
    // @ts-ignore
    if (v.toDate) return v.toDate().getTime();
    const d = new Date(v);
    const t = d.getTime();
    return Number.isFinite(t) ? t : null;
  } catch {
    return null;
  }
}
