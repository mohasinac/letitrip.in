import type { Metadata } from "next";
import { FAQPageView } from "@mohasinac/appkit";
import { generateMetadata as _gm } from "@/constants/seo.server";

export const metadata: Metadata = _gm({
  title: "FAQ — LetiTrip Help Centre",
  description:
    "Answers to common questions about shipping, returns, payments, auctions and pre-orders on LetiTrip.",
  path: "/faqs",
  keywords: ["letitrip faq", "collectibles marketplace help", "auction help india"],
});

export const revalidate = 3600;

export default function Page() {
  return <FAQPageView />;
}
