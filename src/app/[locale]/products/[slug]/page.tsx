"use client";

import { use } from "react";
import { ProductDetailView } from "@/features/products";

interface ProductDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = use(params);
  return <ProductDetailView slug={slug} />;
}
