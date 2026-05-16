import type { Metadata } from "next";
import { generateMetadata as _gm } from "@/constants";
import { SecurityPrivacyView } from "@mohasinac/appkit";

export const metadata: Metadata = _gm({
  title: "Security & Privacy — LetItRip",
  description: "How LetItRip protects your data, payments and personal information. Secure transactions, encrypted storage and buyer protection on every order.",
  path: "/security",
  keywords: ["letitrip security", "secure collectibles marketplace", "buyer protection india"],
});

export const revalidate = 3600;

export default function Page() {
  return <SecurityPrivacyView />;
}
