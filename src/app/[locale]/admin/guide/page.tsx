import type { Metadata } from "next";
import { generateMetadata as _gm } from "@/constants/seo.server";
import { AdminGuideHubView, isAdminUser } from "@mohasinac/appkit";
import { safeRead } from "@mohasinac/appkit/server";
import { getServerSessionUser } from "@/lib/firebase/auth-server";

export const metadata: Metadata = _gm({
  title: "Admin Guide — LetItRip",
  description: "Internal admin and employee guide for managing LetItRip — users, catalog, stores, orders, content, and trust & safety.",
  path: "/admin/guide",
});

export default async function Page() {
  // The RoleGuard layout has already authorised the reader; this read only
  // decides which sections of the guide are shown, so it degrades to the
  // narrowest view rather than erroring — visibly, so an admin who suddenly
  // sees a cut-down guide has something to point at.
  const user = await safeRead(() => getServerSessionUser(), {
    route: "/admin/guide",
    key: "session.getServerSessionUser",
    fallback: null,
  });
  const isFullAdmin = isAdminUser(user);
  const permissions: string[] = (user as { permissions?: string[] } | null)?.permissions ?? [];
  return <AdminGuideHubView permissions={permissions} isFullAdmin={isFullAdmin} />;
}
