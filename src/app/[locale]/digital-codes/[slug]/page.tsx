import type { Metadata } from "next";
import { getDigitalCodeForDetail, DigitalCodeDetailPageView } from "@mohasinac/appkit";
import { buildDigitalCodeMetadata } from "@mohasinac/appkit/server";
import { ProductDetailActions, PageViewTracker } from "@mohasinac/appkit/client";
import { SEO_CONFIG } from "@/constants";
import { notFound } from "next/navigation";

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
  // A record that does not exist must answer 404, not 200. Rendering a
  // "not found" body under a 200 is a soft 404: the URL stays indexable
  // forever and every stale or mistyped link keeps accumulating.
  if (!product) notFound();

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
