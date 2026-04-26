"use client";
import {
  WishlistView,
  useAuth,
  InteractiveProductCard,
  ROUTES,
} from "@mohasinac/appkit/client";

export default function Page() {
  const { user } = useAuth();

  return (
    <WishlistView
      userId={user?.uid}
      labels={{ title: "My Wishlist" }}
      renderProducts={(items: any[], isLoading: boolean) =>
        isLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-xl border border-neutral-200 dark:border-slate-700 aspect-[3/4] bg-neutral-100 dark:bg-slate-800"
              />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="py-24 text-center text-neutral-500">
            Your wishlist is empty.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {items.map((item) => (
              <InteractiveProductCard
                key={item.productId}
                href={String(ROUTES.PUBLIC.PRODUCT_DETAIL(item.productSlug ?? item.productId))}
                isWishlisted
                product={{
                  id: item.productId,
                  title: item.productTitle ?? "",
                  price: item.productPrice ?? 0,
                  currency: item.productCurrency ?? "INR",
                  mainImage: item.productImage,
                  status: item.productStatus ?? "published",
                  featured: false,
                  isAuction: false,
                  slug: item.productSlug ?? item.productId,
                }}
              />
            ))}
          </div>
        )
      }
    />
  );
}
