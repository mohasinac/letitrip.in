import type { Metadata } from "next";
import { getDigitalCodeForDetail, DigitalCodeDetailPageView } from "@mohasinac/appkit";
import { buildDigitalCodeMetadata } from "@mohasinac/appkit/server";
import { ProductDetailActions, PageViewTracker } from "@mohasinac/appkit/client";
import { SEO_CONFIG } from "@/constants";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getDigitalCodeForDetail(slug);
  // `siteUrl` is required for a canonical — without it the builder returns
  // `alternates: undefined` and the page ships none. See classified/[slug].
  return buildDigitalCodeMetadata(product, {
    siteName: SEO_CONFIG.siteName ?? "LetItRip",
    siteUrl: SEO_CONFIG.siteUrl,
  });
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const product = await getDigitalCodeForDetail(slug);

  return (
    <>
      <PageViewTracker entityType="digital-code" entityId={slug} url={`/digital-codes/${slug}`} />
      <DigitalCodeDetailPageView
        slug={slug}
        initialProduct={product}
        renderPrimaryActions={(ctx) => (
          <ProductDetailActions
            productId={ctx.productId}
            productTitle={ctx.productTitle}
            productImage={ctx.productImage}
            price={ctx.price ?? undefined}
            currency={ctx.currency}
            storeId={ctx.storeId}
            storeName={ctx.storeName}
            inStock={ctx.inStock}
          />
        )}
      />
    </>
  );
}
