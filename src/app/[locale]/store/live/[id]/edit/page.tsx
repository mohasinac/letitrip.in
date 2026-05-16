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
    await sellerUpdateProductAction(id, {
      ...draft,
      listingType: "live",
      status: "draft",
    });
    redirect(String(ROUTES.STORE.LIVE_ITEMS));
  }

  async function handlePublish(draft: SellerProductDraft) {
    "use server";
    await sellerUpdateProductAction(id, {
      ...draft,
      listingType: "live",
      status: "published",
    });
    redirect(String(ROUTES.STORE.LIVE_ITEMS));
  }

  return (
    <SellerEditProductView
      listingType="live"
      productId={id}
      onSave={handleSave}
      onPublish={handlePublish}
    />
  );
}
