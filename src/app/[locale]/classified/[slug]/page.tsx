import type { Metadata } from "next";
import { getClassifiedForDetail, ClassifiedDetailPageView } from "@mohasinac/appkit";
import { MakeOfferButton, PageViewTracker } from "@mohasinac/appkit/client";
import { buildClassifiedMetadata } from "@mohasinac/appkit/server";
import { submitProductOffer } from "@/actions/offer.actions";
import { SEO_CONFIG } from "@/constants";
import { notFound } from "next/navigation";

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
  // A record that does not exist must render the 404 view - that is what gets it
  // marked noindex. The HTTP STATUS stays 200, and that is Next's documented
  // behaviour rather than a bug: the response is streamed, so headers are already
  // sent by the time notFound() runs and the status can no longer change. Next
  // injects <meta name="robots" content="noindex"> into the streamed HTML
  // instead, and that is what actually keeps the URL out of the index.
  // Before this, the page rendered its OWN "not found" body with no noindex at
  // all - a genuine soft 404 that stayed indexable forever.
  if (!product) notFound();

  return (
    <>
      <PageViewTracker entityType="classified" entityId={slug} url={`/classified/${slug}`} />
      <ClassifiedDetailPageView
        slug={slug}
        initialProduct={product}
        // Same snippet as /products/[slug] — both detail views expose the same
        // renderOfferAction contract precisely so this can't drift. `bounds` is
        // resolved by the view from the one shared rule, so the button never
        // computes a floor the server would disagree with.
        renderOfferAction={({ productId, price, bounds }) => (
          <MakeOfferButton
            productId={productId}
            listedPrice={price}
            bounds={bounds}
            onMakeOffer={submitProductOffer}
          />
        )}
      />
    </>
  );
}
