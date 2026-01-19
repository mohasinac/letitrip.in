import { Collections } from "@/app/api/lib/firebase/collections";
import { userOwnsShop } from "@/app/api/lib/firebase/queries";
import { logError } from "@/lib/firebase-error-logger";
import { safeToISOString } from "@letitrip/react-library";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "../../../lib/session";

// GET /api/shops/[slug]/stats - seller/admin analytics
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const user = await getCurrentUser(request);
    if (!user?.email)
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    const role = user.role;

    const shopSnap = await Collections.shops()
      .where("slug", "==", slug)
      .limit(1)
      .get();
    if (shopSnap.empty)
      return NextResponse.json(
        { success: false, error: "Shop not found" },
        { status: 404 },
      );
    const shopDoc = shopSnap.docs[0];
    const shop: any = { id: shopDoc.id, ...shopDoc.data() };

    if (role === "seller") {
      const owns = await userOwnsShop(shop.id, user.id);
      if (!owns)
        return NextResponse.json(
          { success: false, error: "Forbidden" },
          { status: 403 },
        );
    }

    // Products count (exclude deleted products)
    const productsSnap = await Collections.products()
      .where("shop_id", "==", shop.id)
      .get();
    const allProducts = productsSnap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));
    // Filter out deleted products (is_deleted !== true to include undefined)
    const products = allProducts.filter((p: any) => p.is_deleted !== true);
    const productCount = products.length;

    // Orders and revenue (delivered / confirmed)
    const ordersSnap = await Collections.orders()
      .where("shop_id", "==", shop.id)
      .get();
    const orders = ordersSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
    const orderCount = orders.length;
    const revenue = orders
      .filter((o: any) =>
        ["delivered", "confirmed", "processing", "shipped"].includes(o.status),
      )
      .reduce((sum: number, o: any) => sum + (o.amount || 0), 0);

    // Reviews
    const reviewsSnap = await Collections.reviews()
      .where("shop_id", "==", shop.id)
      .get();
    const reviewCount = reviewsSnap.size;
    const avgRating = reviewCount
      ? reviewsSnap.docs.reduce((s, d) => s + (d.data().rating || 0), 0) /
        reviewCount
      : 0;

    // Returns
    const returnsSnap = await Collections.returns()
      .where("shop_id", "==", shop.id)
      .get();
    const returnsCount = returnsSnap.size;

    // Low stock products
    const lowStock = products.filter(
      (p: any) =>
        (p.stock_quantity ?? p.stockCount ?? 0) <=
        (p.low_stock_threshold ?? p.lowStockThreshold ?? 5),
    );

    // Daily sales last 14 days
    const startDate = new Date(Date.now() - 13 * 86400000);
    const startIso = safeToISOString(startDate) ?? new Date().toISOString();
    const recentOrdersSnap = await Collections.orders()
      .where("shop_id", "==", shop.id)
      .where("created_at", ">=", startIso)
      .get();
    const dailyMap: Record<string, number> = {};
    for (const d of recentOrdersSnap.docs) {
      const o: any = d.data();
      const day = (o.created_at || "").slice(0, 10);
      if (!day) continue;
      if (!dailyMap[day]) dailyMap[day] = 0;
      dailyMap[day] += o.amount || 0;
    }
    const dailySales = Array.from({ length: 14 }).map((_, i) => {
      const dt = new Date(Date.now() - (13 - i) * 86400000);
      const key = safeToISOString(dt)?.slice(0, 10) ?? "";
      return { date: key, revenue: dailyMap[key] || 0 };
    });

    return NextResponse.json({
      success: true,
      data: {
        shop: { id: shop.id, name: shop.name, slug: shop.slug },
        metrics: {
          productCount,
          orderCount,
          revenue,
          reviewCount,
          avgRating: Number(avgRating.toFixed(2)),
          returnsCount,
          lowStockCount: lowStock.length,
        },
        lowStock: lowStock.slice(0, 10).map((p) => ({
          id: p.id,
          name: p.name,
          stock: p.stock_quantity ?? p.stockCount ?? 0,
        })),
        dailySales,
      },
    });
  } catch (error) {
    logError(error as Error, {
      component: "API.shops.stats",
      metadata: { slug: await params.then((p) => p.slug) },
    });
    return NextResponse.json(
      { success: false, error: "Failed to load stats" },
      { status: 500 },
    );
  }
}
