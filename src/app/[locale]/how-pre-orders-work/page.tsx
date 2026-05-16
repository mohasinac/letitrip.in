import type { Metadata } from "next";
import { generateMetadata as _gm } from "@/constants";
import { HowPreOrdersWorkView } from "@mohasinac/appkit";

export const metadata: Metadata = _gm({
  title: "How Pre-Orders Work — LetItRip",
  description: "Reserve upcoming collectibles before they ship on LetItRip. Learn about deposits, production status, delivery dates and cancellation policies.",
  path: "/how-pre-orders-work",
  keywords: ["pre-order collectibles india", "reserve pokemon figures", "letitrip pre-order"],
});

export const revalidate = 3600;

export default function Page() {
  return <HowPreOrdersWorkView />;
}
