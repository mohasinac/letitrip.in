/**
 * Seller Edit Product Page — thin shell.
 * All logic lives in SellerEditProductView.
 */
"use client";

import { use } from "react";
import { SellerEditProductView } from "@/features/seller";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function SellerEditProductPage({ params }: PageProps) {
  const { id } = use(params);
  return <SellerEditProductView id={id} />;
}
