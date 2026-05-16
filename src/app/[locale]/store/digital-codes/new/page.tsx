import { ROUTES } from "@mohasinac/appkit";
import type { SellerProductDraft } from "@mohasinac/appkit";
import { createSellerProductAction } from "@/actions/seller.actions";
import { redirect } from "next/navigation";
import { StoreCreateProductShell } from "@/components/store/SellerProductFormShell";

export default function Page() {
  async function handleSave(draft: SellerProductDraft) {
    "use server";
    await createSellerProductAction({
      ...draft,
      listingType: "digital-code",
      status: "draft",
    });
    redirect(String(ROUTES.STORE.DIGITAL_CODES));
  }

  async function handlePublish(draft: SellerProductDraft) {
    "use server";
    await createSellerProductAction({
      ...draft,
      listingType: "digital-code",
      status: "published",
    });
    redirect(String(ROUTES.STORE.DIGITAL_CODES));
  }

  return (
    <StoreCreateProductShell
      listingType="digital-code"
      onSave={handleSave}
      onPublish={handlePublish}
    />
  );
}
