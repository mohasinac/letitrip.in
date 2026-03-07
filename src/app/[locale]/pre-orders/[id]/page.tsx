/**
 * Pre-Order Detail Page
 * Route: /pre-orders/[id]
 *
 * Thin orchestration layer — all logic lives in PreOrderDetailView.
 */

import { use } from "react";
import { PreOrderDetailView } from "@/features/products";

interface Props {
  params: Promise<{ id: string }>;
}

export default function PreOrderDetailPage({ params }: Props) {
  const { id } = use(params);
  return <PreOrderDetailView id={id} />;
}
