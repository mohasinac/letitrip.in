import type { Metadata } from "next";
import { PolicyPageView } from "@mohasinac/appkit";
import { generateMetadata as _gm } from "@/constants/seo.server";

export const revalidate = 3600;

export const metadata: Metadata = _gm({
  title: "Terms & Conditions — LetItRip",
  description:
    "Read the terms and conditions governing use of the LetItRip collectibles marketplace platform.",
  path: "/terms",
  keywords: ["letitrip terms", "terms of service", "platform rules"],
});

export default function Page() {
  return <PolicyPageView policy="terms" />;
}
