import type { Metadata } from "next";
import { generateMetadata as _gm } from "@/constants";
import { AdminTrustGuideView } from "@mohasinac/appkit";

export const metadata: Metadata = _gm({
  title: "Trust & Safety Guide — Admin | LetItRip",
  description: "Admin guide: bans, scam registry, support tickets, moderation, and reports on LetItRip.",
  path: "/admin/guide/trust",
});

export const revalidate = 3600;

export default function Page() {
  return <AdminTrustGuideView />;
}
