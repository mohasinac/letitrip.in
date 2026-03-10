/**
 * Auction Detail Page
 * Route: /auctions/[id]
 *
 * Thin orchestration layer — all logic lives in AuctionDetailView.
 */

import { use } from "react";
import { AuctionDetailView } from "@/features/products";
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
    alternates: { canonical: `${APP_URL}/auctions/${id}` },
  };
}

export default function AuctionDetailPage({ params }: Props) {
  const { id } = use(params);
  return <AuctionDetailView id={id} />;
}
