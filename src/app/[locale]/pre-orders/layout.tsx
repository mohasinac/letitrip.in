import type { Metadata } from "next";
import { generateMetadata as genMetadata, SEO_CONFIG } from "@/constants";

export const metadata: Metadata = genMetadata({
  title: SEO_CONFIG.pages.preOrders.title,
  description: SEO_CONFIG.pages.preOrders.description,
  keywords: [...SEO_CONFIG.pages.preOrders.keywords],
  path: "/pre-orders",
});

export default function PreOrdersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
