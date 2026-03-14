import type { Metadata } from "next";
import { SITE_CONFIG } from "@/constants";
import { AlgoliaDashboardView } from "@/features/admin";

export const metadata: Metadata = {
  title: `Algolia Dashboard — ${SITE_CONFIG.brand.name}`,
  robots: { index: false, follow: false },
};

export default function DemoAlgoliaPage() {
  return <AlgoliaDashboardView />;
}
