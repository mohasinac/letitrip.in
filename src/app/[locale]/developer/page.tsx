import type { Metadata } from "next";
import { DeveloperView } from "@mohasinac/appkit";
import { generateMetadata as _gm } from "@/constants/seo.server";

export const revalidate = 3600;

export const metadata: Metadata = _gm({
  title: "Developer — LetItRip",
  description: "Meet the developer building LetItRip, India's marketplace for collectibles.",
  path: "/developer",
  keywords: ["letitrip developer", "about the developer", "letitrip team"],
});

export default function Page() {
  return <DeveloperView />;
}
