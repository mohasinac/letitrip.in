import type { Metadata } from "next";
import { generateMetadata as _gm } from "@/constants";
import { BuyerOrdersGuideView } from "@mohasinac/appkit";

export const metadata: Metadata = _gm({
  title: "Orders, Returns & Support Guide — LetItRip",
  description: "Understand the order lifecycle, track your delivery, request returns, and escalate disputes on LetItRip.",
  path: "/help/orders",
  keywords: ["letitrip orders guide", "how to return on letitrip", "order tracking letitrip"],
});

export const revalidate = 3600;

export default function Page() {
  return <BuyerOrdersGuideView />;
}
