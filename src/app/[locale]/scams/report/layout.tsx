import type { Metadata } from "next";
import { generateMetadata as _gm } from "@/constants/seo.server";

/*
 * Metadata lives in a LAYOUT because the page beside it is a Client
 * Component, and a `"use client"` module cannot export `metadata` or
 * `generateMetadata` — Next forbids it. Without this the route inherited the
 * site default title and competed with every other page that did the same.
 */
export const metadata: Metadata = _gm({
  title: "Report a Scam — LetItRip Scam Registry",
  description: "Report a fraudulent seller or buyer to the LetItRip scam registry. Every report is reviewed before it is published.",
  path: "/scams/report",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
