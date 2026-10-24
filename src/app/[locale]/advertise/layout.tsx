import type { Metadata } from "next";
import { generateMetadata as _gm } from "@/constants/seo.server";

/*
 * Metadata lives in a LAYOUT because the page beside it is a Client
 * Component, and a `"use client"` module cannot export `metadata` or
 * `generateMetadata` — Next forbids it. Without this the route inherited the
 * site default title and competed with every other page that did the same.
 */
export const metadata: Metadata = _gm({
  title: "Advertise on LetItRip — Reach Indian Beyblade Collectors",
  description: "Promote your store or product to Beyblade collectors across India. Sponsored placements, homepage slots and newsletter features on LetItRip.",
  path: "/advertise",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
