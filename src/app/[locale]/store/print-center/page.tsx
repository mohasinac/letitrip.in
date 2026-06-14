import { getSellerStoreAction, listSellerMyProductsAction, listSellerOrdersAction } from "@/actions/seller.actions";
import { PrintCenterView } from "@mohasinac/appkit/client";

function unwrap<T>(result: unknown, fallback: T): T {
  if (!result || typeof result !== "object") return fallback;
  if ("ok" in result) {
    const r = result as { ok: boolean; data?: T };
    return r.ok ? (r.data ?? fallback) : fallback;
  }
  return result as T;
}

export default async function Page() {
  const [storeRes, productsRes, ordersRes] = await Promise.all([
    getSellerStoreAction().catch(() => null),
    listSellerMyProductsAction({ pageSize: 50 }).catch(() => null),
    listSellerOrdersAction({ pageSize: 50 }).catch(() => null),
  ]);
  const store = unwrap(storeRes, null) as any;
  const productsResult = unwrap(productsRes, { items: [] as any[] });
  const ordersResult = unwrap(ordersRes, { items: [] as any[] });

  const storeForCard = store
    ? {
        id: (store as any).id ?? "",
        storeName: store.storeName ?? "",
        storeDescription: store.storeDescription,
        storeLogoURL: store.storeLogoURL,
        storeCategory: (store as any).storeCategory,
      }
    : null;

  const products = ((productsResult as any).items ?? []).map((p: any) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    slug: p.slug ?? p.id,
    listingType: p.listingType,
    condition: p.condition,
    stockCount: p.stockCount,
    physicalLocation: p.physicalLocation,
  }));

  const orders = ((ordersResult as any).items ?? []).map((o: any) => ({
    id: o.id,
    createdAt: o.createdAt ?? new Date().toISOString(),
    status: o.status ?? "PENDING",
    buyerDisplayName: o.shippingAddress?.fullName,
    buyerCity: o.shippingAddress?.city,
    items: (o.items ?? []).map((item: any) => ({
      productName: item.productName ?? item.name ?? "Item",
      quantity: item.quantity ?? 1,
      price: item.price ?? 0,
    })),
    physicalLocation: o.physicalLocation,
  }));

  return (
    <PrintCenterView
      store={storeForCard}
      publicBaseUrl={process.env.NEXT_PUBLIC_SITE_URL ?? "https://letitrip.in"}
      initialProducts={products as any}
      initialOrders={orders}
      brandName="LetItRip"
    />
  );
}
