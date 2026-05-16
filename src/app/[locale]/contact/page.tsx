import type { Metadata } from "next";
import { ContactPageView } from "@mohasinac/appkit";
import { generateMetadata as _gm } from "@/constants";

export const metadata: Metadata = _gm({
  title: "Contact Us — LetItRip",
  description: "Get in touch with the LetItRip team. We're here to help with orders, listings, disputes and general enquiries.",
  path: "/contact",
  keywords: ["letitrip contact", "collectibles marketplace support", "contact letitrip india"],
});

export const revalidate = 3600;

export default function Page() {
  return <ContactPageView />;
}
