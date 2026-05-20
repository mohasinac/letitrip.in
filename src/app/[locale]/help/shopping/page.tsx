import type { Metadata } from "next";
import { generateMetadata as _gm } from "@/constants";
import { BuyerShoppingGuideView } from "@mohasinac/appkit";

export const metadata: Metadata = _gm({
  title: "Shopping & Checkout Guide — LetItRip",
  description: "How to browse listings, use filters, add to cart, apply coupons, and complete checkout on LetItRip.",
  path: "/help/shopping",
  keywords: ["letitrip shopping guide", "how to buy collectibles", "checkout guide letitrip"],
});

export const revalidate = 3600;

export default function Page() {
  return <BuyerShoppingGuideView />;
}
