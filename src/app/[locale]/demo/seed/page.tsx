import type { Metadata } from "next";
import { SITE_CONFIG } from "@/constants";
import { DemoSeedView } from "@/features/admin";

export const metadata: Metadata = {
  title: `Seed Data — ${SITE_CONFIG.brand.name}`,
  robots: { index: false, follow: false },
};

export default function DemoSeedPage() {
  return <DemoSeedView />;
}
