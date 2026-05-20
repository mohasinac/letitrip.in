import type { Metadata } from "next";
import { generateMetadata as _gm } from "@/constants";
import { AdminStoresGuideView } from "@mohasinac/appkit";

export const metadata: Metadata = _gm({
  title: "Stores & Sellers Guide — Admin | LetItRip",
  description: "Admin guide: store lifecycle, identity architecture, capabilities, addresses, and suspension on LetItRip.",
  path: "/admin/guide/stores",
});

export const revalidate = 3600;

export default function Page() {
  return <AdminStoresGuideView />;
}
