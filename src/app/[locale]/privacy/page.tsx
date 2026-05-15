import type { Metadata } from "next";
import { PolicyPageView } from "@mohasinac/appkit";
import { generateMetadata as _gm } from "@/constants/seo.server";

export const revalidate = 3600;

export const metadata: Metadata = _gm({
  title: "Privacy Policy — LetItRip",
  description:
    "Learn how LetItRip collects, uses, and protects your personal information when you use our marketplace.",
  path: "/privacy",
  keywords: ["letitrip privacy policy", "data protection", "personal information"],
});

export default function Page() {
  return <PolicyPageView policy="privacy" />;
}
