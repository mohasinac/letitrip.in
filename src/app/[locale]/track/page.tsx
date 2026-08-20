import type { Metadata } from "next";
import { generateMetadata as _gm } from "@/constants/seo.server";
import { TrackOrderView } from "@mohasinac/appkit";

export const revalidate = 3600;

export const metadata: Metadata = _gm({
  title: "Track Order — LetItRip",
  description: "Track your LetItRip order status in real time. Enter your order ID to see shipping updates, estimated delivery and carrier details.",
  path: "/track",
  keywords: ["track order letitrip", "collectibles order status", "shipment tracking india"],
});

export default function Page() {
  return <TrackOrderView />;
}
