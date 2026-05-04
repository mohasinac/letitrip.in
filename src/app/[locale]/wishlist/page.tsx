"use client";
import {
  useWishlistWithGuest,
  useSession,
  InteractiveProductCard,
  ROUTES,
  Main,
  Section,
  Container,
  Heading,
} from "@mohasinac/appkit/client";

export default function Page() {
  const { user, loading: sessionLoading } = useSession();
  const wl = useWishlistWithGuest(sessionLoading ? undefined : user?.uid ?? null);

  return (
    <Main>
      <Section className="py-10">
        <Container size="xl">
          <Heading level={1} className="mb-8 text-3xl font-semibold text-zinc-900">
            My Wishlist
          </Heading>

          {sessionLoading || wl.isLoading ? (
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
        </Container>
      </Section>
    </Main>
  );
}
