"use client";

import { useRouter } from "@/i18n/navigation";
import { BundleDetailPageView, ROUTES } from "@mohasinac/appkit";
import type { BundleDocument } from "@mohasinac/appkit";

export default function BundleDetailClient({
  bundle,
}: {
  bundle: BundleDocument;
}) {
  const router = useRouter();
  const onBuy = async (b: BundleDocument) => {
    // Hand off to checkout with the bundle id — checkout reads it from the
    // query string and creates a bundle order.
    router.push(`${String(ROUTES.USER.CART)}?bundleId=${b.id}`);
  };
  return <BundleDetailPageView bundle={bundle} onBuy={onBuy} />;
}
