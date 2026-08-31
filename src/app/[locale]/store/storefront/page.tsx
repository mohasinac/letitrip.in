import { SellerStorefrontView } from "@mohasinac/appkit";
import type { StorefrontDraft } from "@mohasinac/appkit";
import { PageTabs, STOREFRONT_TABS } from "@mohasinac/appkit/client";
import { getSellerStoreAction, updateStoreAction } from "@/actions/seller.actions";
import { StoreSlugPanel } from "@/components/store/StoreSlugPanel";

export default async function Page() {
  // NOT swallowed: `initialValues` below seeds the storefront EDITOR, and
  // `handleSave` writes every one of those fields back. A failed read used to
  // present the form entirely blank, so the next Save wiped the storefront.
  const storeRes = await getSellerStoreAction();
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
    return updateStoreAction({
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

  /*
   * The shop's identity: how it looks, and the address buyers reach it at.
   * `/store/slug` is now a redirect onto `?tab=slug`.
   */
  return (
    <PageTabs
      tabs={STOREFRONT_TABS}
      panels={{
        profile: (
          <SellerStorefrontView
            initialValues={initialValues}
            onSave={handleSave}
          />
        ),
        slug: <StoreSlugPanel />,
      }}
    />
  );
}
