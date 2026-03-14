/**
 * User Wishlist Page
 *
 * Route: /user/wishlist
 * Displays the authenticated user's saved items with tabs.
 */

import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { SITE_CONFIG } from "@/constants";
import { WishlistView } from "@/features/wishlist";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("wishlist");
  return {
    title: `${t("metaTitle")} — ${SITE_CONFIG.brand.name}`,
    description: t("metaDescription"),
    robots: { index: false, follow: false },
  };
}

export default function UserWishlistPage() {
  return <WishlistView />;
}
