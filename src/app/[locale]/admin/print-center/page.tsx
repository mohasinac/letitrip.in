import { listAdminProductsAction } from "@/actions/admin-read.actions";
import { getSellerStoreAction } from "@/actions/seller.actions";
import { PrintCenterView } from "@mohasinac/appkit/client";
import { safeRead } from "@mohasinac/appkit/server";

/*
 * 🛑 THIS PAGE PASSED NO PRODUCTS, so it rendered "No products available."
 * to every admin — which is correct behaviour for a component handed nothing,
 * and reads as an empty catalogue.
 *
 * `PrintCenterView` takes `initialProducts` as a prop and fetches nothing
 * itself. `PrintCenterPanel` (the seller side, now a tab on
 * /store/fulfillment) assembles that prop from three reads; this page
 * assembled only the store one. Root Cause #8's slot-shell shape: a view
 * rendered without the data it needs renders its own empty state, and an
 * empty state is indistinguishable from an empty database.
 *
 * ADMIN-SCOPED, not store-scoped. The seller panel uses
 * `listSellerMyProductsAction`, which is bounded to the caller's own store —
 * and an admin need not own one, which is why `store={null}` is the normal
 * case here. `listAdminProductsAction` spans the catalogue, which is what an
 * admin printing labels actually wants.
 *
 * Orders are deliberately NOT fetched. The seller panel passes them because
 * packing slips are its job; an admin printing from here wants product
 * labels, and a cross-store order list on this page would be a second,
 * unasked-for surface over every buyer's shipping address.
 */
export default async function Page() {
  // Two independent reads — the page is useful with either, so each degrades
  // on its own. Recorded via safeRead, because an empty product list here
  // looks exactly like a catalogue with nothing in it.
  const [storeRes, productsRes] = await Promise.all([
    safeRead(() => getSellerStoreAction(), {
      route: "/admin/print-center",
      key: "stores.getSellerStoreAction",
      fallback: null,
    }),
    safeRead(() => listAdminProductsAction({ pageSize: 50 }), {
      route: "/admin/print-center",
      key: "products.listAdminProductsAction",
      fallback: null,
    }),
  ]);

  const store = storeRes && "ok" in storeRes && storeRes.ok ? storeRes.data : null;
  const productItems =
    productsRes && "ok" in productsRes && productsRes.ok
      ? ((productsRes.data as { items?: unknown[] } | null)?.items ?? [])
      : [];

  const storeForCard = store
    ? {
        id: (store as any).id ?? "",
        storeName: store.storeName ?? "",
        storeDescription: store.storeDescription,
        storeLogoURL: store.storeLogoURL,
        storeCategory: (store as any).storeCategory,
      }
    : null;

  /*
   * The same mapping `PrintCenterPanel` applies, and for the same reason: the
   * view's `PrintCenterProduct` is a narrow label shape (`name`, not `title`),
   * so a raw document would render a blank label rather than fail loudly.
   *
   * `physicalLocation` is carried through as the OBJECT it is — see the 🛑 on
   * `PrintCenterOrder.physicalLocation`, where declaring it a string put an
   * object into JSX.
   */
  const products = (productItems as any[]).map((p) => ({
    id: p.id,
    name: p.title ?? p.name,
    price: p.price,
    slug: p.slug ?? p.id,
    listingType: p.listingType,
    condition: p.condition,
    stockCount: p.stockCount,
    physicalLocation: p.physicalLocation,
    barcodeId: p.barcodeId,
  }));

  return (
    <PrintCenterView
      store={storeForCard}
      publicBaseUrl={process.env.NEXT_PUBLIC_SITE_URL ?? "https://letitrip.in"}
      initialProducts={products as any}
      isAdmin
      brandName="LetItRip"
    />
  );
}
