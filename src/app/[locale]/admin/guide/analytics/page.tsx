import type { Metadata } from "next";
import { generateMetadata as _gm } from "@/constants/seo.server";
import { AdminAnalyticsGuideView } from "@mohasinac/appkit";

export const metadata: Metadata = _gm({
  title: "Analytics Guide — Admin | LetItRip",
  description: "Admin guide: revenue dashboard, order funnel, product performance, and store metrics on LetItRip.",
  path: "/admin/guide/analytics",
});

export default function Page() {
  return <AdminAnalyticsGuideView />;
}
