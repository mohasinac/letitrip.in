import type { Metadata } from "next";
import { PolicyPageView } from "@mohasinac/appkit/features/about/components/PolicyPageView";
import { generateMetadata as _gm } from "@/constants/seo.server";

export const revalidate = 3600;

export const metadata: Metadata = _gm({
  title: "Cancellation Policy — LetItRip",
  description:
    "When a LetItRip order can be cancelled, who can cancel it, and what happens to a payment already made.",
  path: "/cancellation-policy",
  keywords: ["letitrip cancellation policy", "cancel order", "order cancellation"],
});

export default function Page() {
  return <PolicyPageView policy="cancellation" />;
}
