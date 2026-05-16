import { ROUTES } from "@mohasinac/appkit";
import type { SellerProductDraft } from "@mohasinac/appkit";
import { sellerUpdateProductAction } from "@/actions/seller.actions";
import { redirect } from "next/navigation";
import { StoreEditProductShell } from "@/components/store/SellerProductFormShell";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: Props) {
  const { id } = await params;

  async function handleSave(draft: SellerProductDraft) {
    "use server";
    await sellerUpdateProductAction(id, { ...draft, status: "draft" });
    redirect(String(ROUTES.STORE.PRODUCTS));
  }

  async function handlePublish(draft: SellerProductDraft) {
    "use server";
    await sellerUpdateProductAction(id, { ...draft, status: "published" });
    redirect(String(ROUTES.STORE.PRODUCTS));
  }

  return (
    <StoreEditProductShell
      listingType="standard"
      productId={id}
      onSave={handleSave}
      onPublish={handlePublish}
    />
  );
}
