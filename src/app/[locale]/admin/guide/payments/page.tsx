import type { Metadata } from "next";
import { generateMetadata as _gm } from "@/constants";
import { AdminPaymentsGuideView } from "@mohasinac/appkit";

export const metadata: Metadata = _gm({
  title: "Payments Guide — Admin | LetItRip",
  description: "Admin guide: enabling and configuring Razorpay — API keys, webhooks, and going live from test mode.",
  path: "/admin/guide/payments",
});

export const revalidate = 3600;

export default function Page() {
  return <AdminPaymentsGuideView />;
}
