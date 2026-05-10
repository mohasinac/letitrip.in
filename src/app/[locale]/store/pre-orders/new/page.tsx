import { SellerCreateProductView, ROUTES } from "@mohasinac/appkit";
import type { SellerProductDraft } from "@mohasinac/appkit";
import { createSellerProductAction } from "@/actions/seller.actions";
import { redirect } from "next/navigation";

export default function Page() {
  async function handleSave(draft: SellerProductDraft) {
    "use server";
    await createSellerProductAction({ ...draft, isAuction: false, isPreOrder: true, status: "draft" });
    redirect(String(ROUTES.STORE.PRE_ORDERS));
  }

  async function handlePublish(draft: SellerProductDraft) {
    "use server";
    await createSellerProductAction({ ...draft, isAuction: false, isPreOrder: true, status: "published" });
    redirect(String(ROUTES.STORE.PRE_ORDERS));
  }

  return (
    <SellerCreateProductView
      listingType="pre-order"
      onSave={handleSave}
      onPublish={handlePublish}
    />
  );
}
