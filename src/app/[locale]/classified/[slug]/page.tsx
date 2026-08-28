import type { Metadata } from "next";
import { getClassifiedForDetail, ClassifiedDetailPageView } from "@mohasinac/appkit";
import { MakeOfferButton, PageViewTracker } from "@mohasinac/appkit/client";
import { buildClassifiedMetadata } from "@mohasinac/appkit/server";
import { submitProductOffer } from "@/actions/offer.actions";
import { SEO_CONFIG } from "@/constants";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getClassifiedForDetail(slug);
  // `siteUrl` is required for a canonical: the builder returns
  // `alternates: undefined` without it, so omitting it meant these pages shipped
  // NO canonical at all — verified live before this fix.
  return buildClassifiedMetadata(product, {
    siteName: SEO_CONFIG.siteName ?? "LetItRip",
    siteUrl: SEO_CONFIG.siteUrl,
  });
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const product = await getClassifiedForDetail(slug);

  return (
    <>
      <PageViewTracker entityType="classified" entityId={slug} url={`/classified/${slug}`} />
      <ClassifiedDetailPageView
        slug={slug}
        initialProduct={product}
        // Same snippet as /products/[slug] — both detail views expose the same
        // renderOfferAction contract precisely so this can't drift.
        renderOfferAction={({ productId, price, minOfferPercent }) => (
          <MakeOfferButton
            productId={productId}
            listedPrice={price}
            minOfferPercent={minOfferPercent}
            onMakeOffer={submitProductOffer}
          />
        )}
      />
    </>
  );
}
