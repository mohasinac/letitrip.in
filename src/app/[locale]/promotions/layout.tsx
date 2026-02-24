import type { Metadata } from "next";
import { generateMetadata as genMetadata } from "@/constants";

export const metadata: Metadata = genMetadata({
  title: "Promotions & Deals - LetItRip",
  description:
    "Discover the latest promotions, coupons, and exclusive deals on LetItRip.",
  keywords: ["promotions", "deals", "coupons", "discounts", "sales"],
  path: "/promotions",
});

export default function PromotionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
