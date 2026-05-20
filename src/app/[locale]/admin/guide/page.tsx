import type { Metadata } from "next";
import { generateMetadata as _gm } from "@/constants";
import { AdminGuideHubView } from "@mohasinac/appkit";
import { getServerSessionUser } from "@/lib/firebase/auth-server";

export const metadata: Metadata = _gm({
  title: "Admin Guide — LetItRip",
  description: "Internal admin and employee guide for managing LetItRip — users, catalog, stores, orders, content, and trust & safety.",
  path: "/admin/guide",
});

export const revalidate = 3600;

export default async function Page() {
  const user = await getServerSessionUser().catch(() => null);
  const isFullAdmin = user?.role === "admin";
  const permissions: string[] = (user as { permissions?: string[] } | null)?.permissions ?? [];
  return <AdminGuideHubView permissions={permissions} isFullAdmin={isFullAdmin} />;
}
