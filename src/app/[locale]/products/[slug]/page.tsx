import { notFound } from "next/navigation";
import { productRepository } from "@/repositories";
import { ProductDetailView } from "@/features/products";
import type { Metadata } from "next";

interface ProductDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await productRepository.findByIdOrSlug(slug);
  if (!product) return {};
  return {
    title: product.title,
    description: product.description?.slice(0, 160),
    openGraph: {
      images: product.images?.length ? [product.images[0]] : [],
    },
  };
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { slug } = await params;
  const product = await productRepository.findByIdOrSlug(slug);
  if (!product) notFound();

  return <ProductDetailView slug={slug} initialData={product} />;
}
