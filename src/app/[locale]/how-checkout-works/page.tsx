import type { Metadata } from "next";
import { generateMetadata as _gm } from "@/constants";
import { HowCheckoutWorksView } from "@mohasinac/appkit";

export const metadata: Metadata = _gm({
  title: "How Checkout Works — LetItRip",
  description: "Step-by-step guide to completing your purchase on LetItRip. Secure checkout with UPI, cards and wallets for collectibles across India.",
  path: "/how-checkout-works",
  keywords: ["checkout letitrip", "buy collectibles india", "secure payment marketplace"],
});

export const revalidate = 3600;

export default function Page() {
  return <HowCheckoutWorksView />;
}
