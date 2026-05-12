import { SellerEditProductView, ROUTES } from "@mohasinac/appkit";
import type { SellerProductDraft } from "@mohasinac/appkit";
import { sellerUpdateProductAction } from "@/actions/seller.actions";
import { redirect } from "next/navigation";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: Props) {
  const { id } = await params;

  async function handleSave(draft: SellerProductDraft) {
    "use server";
    await sellerUpdateProductAction(id, { ...draft, listingType: "auction", status: "draft" });
    redirect(String(ROUTES.STORE.AUCTIONS));
  }

  async function handlePublish(draft: SellerProductDraft) {
    "use server";
    await sellerUpdateProductAction(id, { ...draft, listingType: "auction", status: "published" });
    redirect(String(ROUTES.STORE.AUCTIONS));
  }

  return (
    <SellerEditProductView
      listingType="auction"
      productId={id}
      onSave={handleSave}
      onPublish={handlePublish}
    />
  );
}
