import type { Metadata } from "next";
import { generateMetadata as _gm } from "@/constants/seo.server";
import { AdminPaymentsGuideView } from "@mohasinac/appkit";

export const metadata: Metadata = _gm({
  title: "Payments Guide — Admin | LetItRip",
  description: "Admin guide: enabling and configuring Razorpay — API keys, webhooks, and going live from test mode.",
  path: "/admin/guide/payments",
});

export default function Page() {
  return <AdminPaymentsGuideView />;
}
