import { notFound } from "next/navigation";
import { productRepository } from "@/repositories";
import { ProductDetailView, ProductJsonLd } from "@/features/products";
import { SITE_CONFIG } from "@/constants";
import type { Metadata } from "next";
import type { ProductItem } from "@mohasinac/feat-products";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://letitrip.in";

interface ProductDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await productRepository.findByIdOrSlug(slug);
  if (!product) return {};
  const title = `${product.title} — ${SITE_CONFIG.brand.name}`;
  const description = product.description?.slice(0, 160);
  const images = product.mainImage
    ? [product.mainImage]
    : product.images?.length
      ? [product.images[0]]
      : [];
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images,
      type: "website",
    },
    alternates: {
      canonical: `${APP_URL}/products/${product.slug ?? slug}`,
    },
  };
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { slug } = await params;
  const product = await productRepository.findByIdOrSlug(slug);
  if (!product) notFound();

  return (
    <>
      <ProductJsonLd product={product} slug={slug} />
      <ProductDetailView
        slug={slug}
        initialData={product as unknown as ProductItem}
      />
    </>
  );
}
