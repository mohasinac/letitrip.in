/**
 * Seller Edit Product Page — thin shell.
 * All logic lives in SellerEditProductView.
 */
import { SellerEditProductView } from "@/features/seller";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SellerEditProductPage({ params }: PageProps) {
  const { id } = await params;
  return <SellerEditProductView id={id} />;
}
