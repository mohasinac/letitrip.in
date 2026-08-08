import type { Metadata } from "next";
import { generateMetadata as _gm } from "@/constants";
import { HowEmiWorksView } from "@mohasinac/appkit";

export const metadata: Metadata = _gm({
  title: "How EMI Works — LetItRip",
  description: "Pay for high-value collectibles in monthly installments on LetItRip. Learn eligibility, the token payment, and the installment schedule.",
  path: "/how-emi-works",
  keywords: ["emi collectibles india", "pay in installments letitrip", "buy now pay later marketplace"],
});

export const revalidate = 3600;

export default function Page() {
  return <HowEmiWorksView />;
}
