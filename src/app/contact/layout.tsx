import type { Metadata } from "next";
import { generateMetadata as genMetadata, SEO_CONFIG } from "@/constants";

export const metadata: Metadata = genMetadata({
  title: SEO_CONFIG.pages.contact.title,
  description: SEO_CONFIG.pages.contact.description,
  keywords: [...SEO_CONFIG.pages.contact.keywords],
  path: "/contact",
});

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
