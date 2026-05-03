"use client";
import {
  useWishlistWithGuest,
  useSession,
  InteractiveProductCard,
  ROUTES,
} from "@mohasinac/appkit/client";

export default function Page() {
  const { user } = useSession();
  const wl = useWishlistWithGuest(user?.uid ?? null);

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      <h1 className="text-2xl font-semibold">My Wishlist</h1>

      {wl.isLoading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-xl border border-neutral-200 dark:border-slate-700 aspect-[3/4] bg-neutral-100 dark:bg-slate-800"
            />
          ))}
        </div>
      ) : wl.items.length === 0 ? (
        <div className="py-24 text-center text-neutral-500">
          Your wishlist is empty.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {wl.items.map((item) => (
            <InteractiveProductCard
              key={item.id}
              href={String(ROUTES.PUBLIC.PRODUCT_DETAIL(item.productSlug ?? item.productId))}
              isWishlisted
              product={{
                id: item.productId,
                title: item.productTitle ?? "",
                price: item.productPrice ?? 0,
                currency: "productCurrency" in item ? (item as any).productCurrency ?? "INR" : "INR",
                mainImage: item.productImage,
                status: "productStatus" in item ? (item as any).productStatus ?? "published" : "published",
                featured: false,
                isAuction: false,
                slug: item.productSlug ?? item.productId,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
