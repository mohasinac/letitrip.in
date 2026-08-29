import type { ReactNode } from "react";
import { StoreDetailLayoutView } from "@mohasinac/appkit";

type Props = {
  children: ReactNode;
  params: Promise<unknown>;
};

/**
 * `activeTab="art"` matches the combined Art & Stickers tab's `tabSlug` — the
 * two listing types share one store tab and one browse page.
 *
 * This layout was missing entirely until 2026-08-24: every other store tab
 * directory had one, so the Art & Stickers tab was the only store tab that
 * rendered with no store header and no tab bar (Root Cause #37's shape — a
 * route that exists but is only half wired).
 */
export default async function Layout({ children, params }: Props) {
  const { storeSlug } = (await params) as { storeSlug: string };
  return (
    <StoreDetailLayoutView storeSlug={storeSlug} activeTab="art" scamRegistryEnabled>
      {children}
    </StoreDetailLayoutView>
  );
}
