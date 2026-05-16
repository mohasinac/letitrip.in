import { ROUTES } from "@mohasinac/appkit";
import type { SellerProductDraft } from "@mohasinac/appkit";
import { createSellerProductAction } from "@/actions/seller.actions";
import { redirect } from "next/navigation";
import { StoreCreateProductShell } from "@/components/store/SellerProductFormShell";

export default function Page() {
  async function handleSave(draft: SellerProductDraft) {
    "use server";
    await createSellerProductAction({ ...draft, status: "draft" });
    redirect(String(ROUTES.STORE.PRODUCTS));
  }

  async function handlePublish(draft: SellerProductDraft) {
    "use server";
    await createSellerProductAction({ ...draft, status: "published" });
    redirect(String(ROUTES.STORE.PRODUCTS));
  }

  return (
    <StoreCreateProductShell
      listingType="standard"
      onSave={handleSave}
      onPublish={handlePublish}
    />
  );
}
