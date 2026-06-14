import { SellerStorefrontView } from "@mohasinac/appkit";
import type { StorefrontDraft } from "@mohasinac/appkit";
import { getSellerStoreAction, updateStoreAction } from "@/actions/seller.actions";

export default async function Page() {
  const storeRes = await getSellerStoreAction().catch(() => null);
  const store: any = storeRes && typeof storeRes === "object" && "ok" in storeRes
    ? (storeRes.ok ? (storeRes as { ok: true; data: any }).data : null)
    : storeRes;

  const initialValues: StorefrontDraft = {
    storeName: store?.storeName,
    storeDescription: store?.storeDescription,
    storeCategory: (store as any)?.storeCategory,
    storeLogoURL: store?.storeLogoURL,
    storeBannerURL: store?.storeBannerURL,
    returnPolicy: (store as any)?.returnPolicy,
    shippingPolicy: (store as any)?.shippingPolicy,
    bio: (store as any)?.bio,
    website: (store as any)?.website,
    location: (store as any)?.location,
    socialLinks: (store as any)?.socialLinks,
    isVacationMode: store?.isVacationMode,
    vacationMessage: (store as any)?.vacationMessage,
    isPublic: store?.isPublic ?? store?.status === "active",
  };

  async function handleSave(data: StorefrontDraft) {
    "use server";
    await updateStoreAction({
      storeName: data.storeName,
      storeDescription: data.storeDescription,
      storeCategory: data.storeCategory,
      storeLogoURL: data.storeLogoURL,
      storeBannerURL: data.storeBannerURL,
      returnPolicy: data.returnPolicy,
      shippingPolicy: data.shippingPolicy,
      bio: data.bio,
      website: data.website,
      location: data.location,
      socialLinks: data.socialLinks,
      isVacationMode: data.isVacationMode,
      vacationMessage: data.vacationMessage,
      isPublic: data.isPublic,
    });
  }

  return (
    <SellerStorefrontView
      initialValues={initialValues}
      onSave={handleSave}
    />
  );
}
