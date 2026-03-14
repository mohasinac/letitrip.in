import type { Metadata } from "next";
import { AlgoliaDashboardView } from "@/features/admin";

export const metadata: Metadata = {
  title: "Algolia Dashboard — LetItRip",
  robots: { index: false, follow: false },
};

export default function DemoAlgoliaPage() {
  return <AlgoliaDashboardView />;
}
