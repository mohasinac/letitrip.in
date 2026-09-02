import type { Metadata } from "next";
import { generateMetadata as _gm } from "@/constants/seo.server";
import { AdminTeamGuideView } from "@mohasinac/appkit";

export const metadata: Metadata = _gm({
  title: "Team & Permissions Guide — Admin | LetItRip",
  description: "Admin guide: permission groups, employee invite flow, role vs permission model on LetItRip.",
  path: "/admin/guide/team",
});

export default function Page() {
  return <AdminTeamGuideView />;
}
