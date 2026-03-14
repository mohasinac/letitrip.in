import type { Metadata } from "next";
import { DemoSeedView } from "@/features/admin";

export const metadata: Metadata = {
  title: "Seed Data — LetItRip",
  robots: { index: false, follow: false },
};

export default function DemoSeedPage() {
  return <DemoSeedView />;
}
