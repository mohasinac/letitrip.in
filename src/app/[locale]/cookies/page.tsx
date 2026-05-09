import type { Metadata } from "next";
import { PolicyPageView } from "@mohasinac/appkit";
import { generateMetadata as _gm } from "@/constants/seo.server";

export const revalidate = 3600;

export const metadata: Metadata = _gm({
  title: "Cookie Policy — LetItRip",
  description:
    "Learn how LetItRip uses cookies and tracking technologies to improve your experience on our platform.",
  path: "/cookies",
  keywords: ["letitrip cookie policy", "cookies", "tracking"],
});

export default function Page() {
  return <PolicyPageView policy="cookies" />;
}
