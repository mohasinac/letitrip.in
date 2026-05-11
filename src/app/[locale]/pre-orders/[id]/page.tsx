import type { Metadata } from "next";
import {
  PreOrderDetailPageView,
  getPreOrderForDetail,
  getProductFeaturesForPreOrder,
} from "@mohasinac/appkit";
import { reservePreOrderAction } from "@/actions/pre-order.actions";
import { generateMetadata as _gm } from "@/constants/seo.server";

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
  const productFeatures = await getProductFeaturesForPreOrder(product?.storeId ?? null);
  return (
    <PreOrderDetailPageView
      id={id}
      productFeatures={productFeatures}
      onReserveNow={reservePreOrderAction}
    />
  );
}
