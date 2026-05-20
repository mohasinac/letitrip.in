import type { Metadata } from "next";
import { generateMetadata as _gm } from "@/constants";
import { AdminContentGuideView } from "@mohasinac/appkit";

export const metadata: Metadata = _gm({
  title: "Content & Marketing Guide — Admin | LetItRip",
  description: "Admin guide: blog posts, events, FAQs, carousel, homepage sections, ads, and newsletter on LetItRip.",
  path: "/admin/guide/content",
});

export const revalidate = 3600;

export default function Page() {
  return <AdminContentGuideView />;
}
