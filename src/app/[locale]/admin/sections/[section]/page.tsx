import { notFound } from "next/navigation";
import { getServerSessionUser } from "@/lib/firebase/auth-server";
import { getServerPermissions } from "@mohasinac/appkit/server";
import { getDashboardHubData } from "@mohasinac/appkit/_internal/server/features/dashboard/data";
import { DashboardHubView } from "@mohasinac/appkit/features/dashboard/components/DashboardHubView";
import { ROUTES } from "@mohasinac/appkit/next/routing/route-map";
import { ADMIN_NAV_GROUPS } from "@/constants/navigation";

/**
 * One admin section's screens.
 *
 * 🛑 The section is looked up in the viewer's FILTERED sections, not in
 * `ADMIN_NAV_GROUPS` — so a section whose every screen the viewer lacks
 * permission for is a 404 rather than an empty page with a real heading. An
 * empty hub would tell an employee the section exists and is broken, when the
 * truth is that it is not theirs.
 */
export default async function Page({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section: slug } = await params;

  const user = await getServerSessionUser();
  if (!user) notFound();
  const resolved = await getServerPermissions(user.uid);
  const permissions = resolved.isAdmin ? null : resolved.permissions;

  const { sections, counts } = await getDashboardHubData(ADMIN_NAV_GROUPS, permissions);
  const section = sections.find((s) => s.slug === slug);
  if (!section) notFound();

  return (
    <DashboardHubView
      title={section.title}
      description="Every screen in this section, and what each one is for."
      mode="screens"
      sections={[section]}
      sectionHrefs={{ [section.slug]: String(ROUTES.ADMIN.SECTION(section.slug)) }}
      counts={counts}
    />
  );
}
