import type { Metadata } from "next";
import { generateMetadata as _gm } from "@/constants";
import { HowPayoutsWorkView } from "@mohasinac/appkit";

export const metadata: Metadata = _gm({
  title: "How Payouts Work — LetItRip",
  description: "Understand seller payouts on LetItRip. Learn about payout schedules, UPI transfers, minimum amounts and how earnings are calculated.",
  path: "/how-payouts-work",
  keywords: ["seller payout india", "letitrip earnings", "marketplace seller payment"],
});

export const revalidate = 3600;

export default function Page() {
  return <HowPayoutsWorkView />;
}
