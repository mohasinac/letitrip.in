import { SellerCreateProductView, ROUTES } from "@mohasinac/appkit";
import type { SellerProductDraft } from "@mohasinac/appkit";
import { createSellerProductAction } from "@/actions/seller.actions";
import { redirect } from "next/navigation";

export default function Page() {
  async function handleSave(draft: SellerProductDraft) {
    "use server";
    await createSellerProductAction({ ...draft, isAuction: true, isPreOrder: false, status: "draft" });
    redirect(String(ROUTES.STORE.AUCTIONS));
  }

  async function handlePublish(draft: SellerProductDraft) {
    "use server";
    await createSellerProductAction({ ...draft, isAuction: true, isPreOrder: false, status: "published" });
    redirect(String(ROUTES.STORE.AUCTIONS));
  }

  return (
    <SellerCreateProductView
      listingType="auction"
      onSave={handleSave}
      onPublish={handlePublish}
    />
  );
}
