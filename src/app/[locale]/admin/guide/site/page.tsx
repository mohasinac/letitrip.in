import type { Metadata } from "next";
import { generateMetadata as _gm } from "@/constants/seo.server";
import { AdminSiteConfigGuideView } from "@mohasinac/appkit";

export const metadata: Metadata = _gm({
  title: "Site Configuration Guide — Admin | LetItRip",
  description: "Admin guide: site settings groups, feature flags, API integrations, and platform limits on LetItRip.",
  path: "/admin/guide/site",
});

export default function Page() {
  return <AdminSiteConfigGuideView />;
}
