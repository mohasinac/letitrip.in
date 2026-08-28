"use client";
import { PromotionsViewProductSection, InteractiveProductCard, Div, Grid, Stack, AdSlot, pluginFor, type AdSlotId } from "@mohasinac/appkit/client";

type Product = { id: string; slug?: string; listingType?: string; [key: string]: unknown };
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
          <Grid cols="cards" gap="md">
            {products.map((product) => (
              <InteractiveProductCard
                key={product.id}
                product={product as never}
                href={pluginFor((product.listingType as never) ?? "standard").detailRoute(
                  product.slug ?? product.id,
                )}
              />
            ))}
          </Grid>
          <AdSlot id={adSlotId} />
        </Stack>
      )}
    />
  );
}
