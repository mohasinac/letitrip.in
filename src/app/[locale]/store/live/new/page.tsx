import { SellerCreateProductView, ROUTES } from "@mohasinac/appkit";
import type { SellerProductDraft } from "@mohasinac/appkit";
import { createSellerProductAction } from "@/actions/seller.actions";
import { redirect } from "next/navigation";

export default function Page() {
  async function handleSave(draft: SellerProductDraft) {
    "use server";
    await createSellerProductAction({
      ...draft,
      listingType: "live",
      status: "draft",
    });
    redirect(String(ROUTES.STORE.LIVE_ITEMS));
  }

  async function handlePublish(draft: SellerProductDraft) {
    "use server";
    await createSellerProductAction({
      ...draft,
      listingType: "live",
      status: "published",
    });
    redirect(String(ROUTES.STORE.LIVE_ITEMS));
  }

  return (
    <SellerCreateProductView
      listingType="live"
      onSave={handleSave}
      onPublish={handlePublish}
    />
  );
}
