/**
 * Pre-Order Detail Page
 * Route: /pre-orders/[id]
 *
 * Thin orchestration layer — all logic lives in PreOrderDetailView.
 */

import { use } from "react";
import { PreOrderDetailView } from "@/features/products";
import { productRepository } from "@/repositories";
import { SITE_CONFIG } from "@/constants";
import type { Metadata } from "next";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://letitrip.in";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = await productRepository.findById(id);
  if (!product) return {};
  const title = `${product.seoTitle ?? product.title} — ${SITE_CONFIG.brand.name}`;
  const description = (product.seoDescription ?? product.description)?.slice(
    0,
    160,
  );
  const images = product.mainImage
    ? [product.mainImage]
    : product.images?.length
      ? [product.images[0]]
      : [];
  return {
    title,
    description,
    openGraph: { title, description, images, type: "website" },
    alternates: { canonical: `${APP_URL}/pre-orders/${id}` },
  };
}

export default function PreOrderDetailPage({ params }: Props) {
  const { id } = use(params);
  return <PreOrderDetailView id={id} />;
}
