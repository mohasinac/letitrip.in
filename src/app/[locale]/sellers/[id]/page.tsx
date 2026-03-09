import { notFound } from "next/navigation";
import { userRepository } from "@/repositories";
import { SellerStorefrontPage } from "@/features/seller";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const seller = await userRepository.findById(id);
  if (!seller) return {};
  return {
    title: seller.displayName ?? seller.email ?? undefined,
    description: seller.publicProfile?.storeDescription?.slice(0, 160),
  };
}

export default async function SellerPage({ params }: PageProps) {
  const { id } = await params;
  const seller = await userRepository.findById(id);

  if (!seller || (seller.role !== "seller" && seller.role !== "admin")) {
    notFound();
  }

  return <SellerStorefrontPage sellerId={id} initialSeller={seller} />;
}
