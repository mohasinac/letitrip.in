import type { Metadata } from "next";
import {
  PreOrderDetailPageView,
  getPreOrderForDetail,
  getProductFeaturesForPreOrder,
} from "@mohasinac/appkit";
import { PageViewTracker } from "@mohasinac/appkit/client";
import { reservePreOrderAction } from "@/actions/pre-order.actions";
import { generateMetadata as _gm } from "@/constants/seo.server";
import { notFound } from "next/navigation";

export const revalidate = 60;

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = await getPreOrderForDetail(id);
  if (!product) return { title: "Pre-Order Not Found" };
  return _gm({
    title: `Pre-Order: ${product.title}`,
    description:
      product.seoDescription ||
      (product.description ? product.description.slice(0, 155) : `Reserve ${product.title} on LetItRip.`),
    image: product.mainImage || product.images?.[0],
    path: `/pre-orders/${product.slug ?? id}`,
    type: "website",
    keywords: product.seoKeywords,
  });
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  const product = await getPreOrderForDetail(id);
  // A record that does not exist must render the 404 view - that is what gets it
  // marked noindex. The HTTP STATUS stays 200, and that is Next's documented
  // behaviour rather than a bug: the response is streamed, so headers are already
  // sent by the time notFound() runs and the status can no longer change. Next
  // injects <meta name="robots" content="noindex"> into the streamed HTML
  // instead, and that is what actually keeps the URL out of the index.
  // Before this, the page rendered its OWN "not found" body with no noindex at
  // all - a genuine soft 404 that stayed indexable forever.
  if (!product) notFound();
  const productFeatures = await getProductFeaturesForPreOrder(product?.storeId ?? null);
  return (
    <>
      <PageViewTracker entityType="pre-order" entityId={id} url={`/pre-orders/${id}`} />
      <PreOrderDetailPageView
        id={id}
        initialPreOrder={product}
        productFeatures={productFeatures}
        onReserveNow={reservePreOrderAction}
      />
    </>
  );
}
