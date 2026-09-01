import type { Metadata } from "next";
import { generateMetadata as _gm } from "@/constants/seo.server";
import { AdminGuideHubView, isAdminUser } from "@mohasinac/appkit";
import { safeRead } from "@mohasinac/appkit/server";
import { getServerSessionUser } from "@/lib/firebase/auth-server";

/*
 * Auth-gated dashboard page behind RoleGuard — it needs the session on every
 * request, so there is nothing meaningful to prerender. Static export also
 * throws on any client tree reaching useSearchParams() without a Suspense
 * boundary (Root Cause #17), and static generation runs 15 parallel workers,
 * so WHICH page trips it varies between builds — a latent class rather than
 * one bad page. Dynamic is both the correct semantics and the fix.
 */
export const dynamic = "force-dynamic";


export const metadata: Metadata = _gm({
  title: "Admin Guide — LetItRip",
  description: "Internal admin and employee guide for managing LetItRip — users, catalog, stores, orders, content, and trust & safety.",
  path: "/admin/guide",
});

export const revalidate = 3600;

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
