import { notFound } from "next/navigation";
import { getDashboardHubData } from "@mohasinac/appkit/_internal/server/features/dashboard/data";
import { DashboardHubView } from "@mohasinac/appkit/features/dashboard/components/DashboardHubView";
import { ROUTES } from "@mohasinac/appkit/next/routing/route-map";
import { USER_NAV_GROUPS } from "@/constants/navigation";

/**
 * One buyer-dashboard section's screens.
 *
 * ## 🛑 This page reads NO session, on purpose
 *
 * `user/layout.tsx` reads nothing server-side — `RoleGuard` is a client
 * component — so `/user/*` prerenders to a signed-out shell and hydrates the
 * session client-side (CLAUDE.md § "a dynamic API in a DASHBOARD layout"). A
 * `getServerSessionUser()` here would be a dynamic API and would make this one
 * route per-request.
 *
 * It would also buy nothing. No `userItem(...)` carries a `requiredPermission`
 * (the buyer owns their own dashboard), and the attention registry has no
 * `nav-user-*` key, so there is nothing about this page that varies by viewer.
 * Reading the session to render identical output for everyone is a billed
 * invocation for no information.
 *
 * `permissions: undefined` rather than `null` — `null` means ADMIN to
 * `filterNavGroups`, and an admin bypasses the navConfig permission gate.
 */
export default async function Page({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section: slug } = await params;

  const { sections, counts } = await getDashboardHubData(USER_NAV_GROUPS, undefined);
  const section = sections.find((s) => s.slug === slug);
  if (!section) notFound();

  return (
    <DashboardHubView
      title={section.title}
      description="Everything in this part of your account, and what each page does."
      mode="screens"
      sections={[section]}
      sectionHrefs={{ [section.slug]: String(ROUTES.USER.SECTION(section.slug)) }}
      counts={counts}
    />
  );
}
