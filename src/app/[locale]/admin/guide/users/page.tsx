import type { Metadata } from "next";
import { generateMetadata as _gm } from "@/constants/seo.server";
import { AdminUsersGuideView } from "@mohasinac/appkit";

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
  title: "Users & Accounts Guide — Admin | LetItRip",
  description: "Admin guide: user roles, search, editor, sessions management, employee accounts, and PII handling on LetItRip.",
  path: "/admin/guide/users",
});

export const revalidate = 3600;

export default function Page() {
  return <AdminUsersGuideView />;
}
