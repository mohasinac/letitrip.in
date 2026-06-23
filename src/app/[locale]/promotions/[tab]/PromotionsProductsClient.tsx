"use client";
// audit-unnecessary-use-client-ok: passes JSX render-prop callback to PromotionsViewProductSection (client component); functions cannot cross RSC→client boundary
import {
  PromotionsViewProductSection,
  InteractiveProductCard,
  Div,
  Stack,
  AdSlot,
  ROUTES,
  type AdSlotId,
} from "@mohasinac/appkit/client";

type Product = { id: string; slug?: string; [key: string]: unknown };
type Props = {
  title: string;
  subtitle: string;
  products: Product[];
  adSlotId: AdSlotId;
};

export function PromotionsProductsClient({ title, subtitle, products, adSlotId }: Props) {
  return (
    <PromotionsViewProductSection
      title={title}
      subtitle={subtitle}
      hasProducts={products.length > 0}
      renderProducts={() => (
        <Stack gap="lg">
          <Div layout="grid" gap="4" className="grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <InteractiveProductCard
                key={product.id}
                product={product as never}
                href={String(
                  ROUTES.PUBLIC.PRODUCT_DETAIL((product as any).slug ?? product.id),
                )}
              />
            ))}
          </Div>
          <AdSlot id={adSlotId} />
        </Stack>
      )}
    />
  );
}
