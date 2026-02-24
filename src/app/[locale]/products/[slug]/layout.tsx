import type { Metadata } from "next";
import { generateProductMetadata } from "@/constants";
import { productRepository } from "@/repositories";
import { serverLogger } from "@/lib/server-logger";

interface ProductLayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  try {
    const { slug } = await params;
    const product = await productRepository.findByIdOrSlug(slug);
    if (!product) return {};

    return generateProductMetadata({
      title: product.seoTitle ?? product.title,
      description:
        product.seoDescription ?? product.description?.slice(0, 160) ?? "",
      seoKeywords: product.seoKeywords,
      slug: product.slug ?? product.id,
      mainImage: product.mainImage ?? product.images?.[0],
      category: product.category,
    });
  } catch (err) {
    serverLogger.warn("products/[slug]/layout: generateMetadata failed", {
      error: err,
    });
    return {};
  }
}

export default function ProductDetailLayout({ children }: ProductLayoutProps) {
  return <>{children}</>;
}
