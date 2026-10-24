import type { Metadata } from "next";
import { generateMetadata as _gm } from "@/constants/seo.server";

/*
 * Metadata lives in a LAYOUT because the page beside it is a Client
 * Component, and a `"use client"` module cannot export `metadata` or
 * `generateMetadata` — Next forbids it. Without this the route inherited the
 * site default title and competed with every other page that did the same.
 */
export const metadata: Metadata = _gm({
  title: "Item Requests — Ask Sellers to Find It | LetItRip",
  description: "Cannot find the Beyblade you want? Post a request and let verified sellers across India tell you when they have it.",
  path: "/item-requests",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
