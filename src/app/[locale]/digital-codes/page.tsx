import { redirect } from "@/i18n/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

// Digital-code listings folded into the consolidated generic Products tab
// (Workstream 1b) — standard + classified + digital-code + live now live on
// one page with an in-page type filter. This route stays only to redirect
// old links/bookmarks.
export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[]>>;
}) {
  const params = (await searchParams) ?? {};
  const q = Array.isArray(params.q) ? params.q[0] : params.q;
  const query = new URLSearchParams({ listingType: "digital-code" });
  if (q) query.set("q", q);
  redirect(`/products?${query.toString()}`);
}
