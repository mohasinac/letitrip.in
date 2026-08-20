import type { Metadata } from "next";
import { ShippingPolicyView } from "@mohasinac/appkit";
import { generateMetadata as _gm } from "@/constants/seo.server";

export const revalidate = 3600;

export const metadata: Metadata = _gm({
  title: "Shipping Policy — LetItRip",
  description:
    "Learn about LetItRip's shipping timelines, carriers, free shipping thresholds, and how to track your order.",
  path: "/shipping-policy",
  keywords: ["letitrip shipping policy", "delivery timelines", "order tracking"],
});

export default function Page() {
  return <ShippingPolicyView />;
}
