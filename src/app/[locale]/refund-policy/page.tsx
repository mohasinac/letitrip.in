import type { Metadata } from "next";
import { PolicyPageView } from "@mohasinac/appkit";
import { generateMetadata as _gm } from "@/constants/seo.server";

export const revalidate = 3600;

export const metadata: Metadata = _gm({
  title: "Refund Policy — LetItRip",
  description:
    "LetItRip's refund, return, and exchange policy — eligibility, timelines, and how to initiate a return.",
  path: "/refund-policy",
  keywords: ["letitrip refund policy", "returns", "exchange policy"],
});

export default function Page() {
  return <PolicyPageView policy="refund" />;
}
