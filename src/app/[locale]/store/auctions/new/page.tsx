import { ROUTES } from "@mohasinac/appkit";
import type { SellerProductDraft } from "@mohasinac/appkit";
import { createSellerProductAction } from "@/actions/seller.actions";
import { redirect } from "next/navigation";
import { StoreCreateProductShell } from "@/components/store/SellerProductFormShell";

export default function Page() {
  async function handleSave(draft: SellerProductDraft) {
    "use server";
    await createSellerProductAction({ ...draft, listingType: "auction", status: "draft" });
    redirect(String(ROUTES.STORE.AUCTIONS));
  }

  async function handlePublish(draft: SellerProductDraft) {
    "use server";
    await createSellerProductAction({ ...draft, listingType: "auction", status: "published" });
    redirect(String(ROUTES.STORE.AUCTIONS));
  }

  return (
    <StoreCreateProductShell
      listingType="auction"
      onSave={handleSave}
      onPublish={handlePublish}
    />
  );
}
