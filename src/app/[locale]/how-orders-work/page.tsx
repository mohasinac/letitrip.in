import type { Metadata } from "next";
import { generateMetadata as _gm } from "@/constants/seo.server";
import { HowOrdersWorkView } from "@mohasinac/appkit";

export const metadata: Metadata = _gm({
  title: "How Orders Work — LetItRip",
  description: "Track and manage your orders on LetItRip. Learn about order statuses, shipping updates, delivery timelines and what to do if something goes wrong.",
  path: "/how-orders-work",
  keywords: ["letitrip orders", "order tracking india marketplace", "collectibles delivery"],
});

export const revalidate = 3600;

export default function Page() {
  return <HowOrdersWorkView />;
}
