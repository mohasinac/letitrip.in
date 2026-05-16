import { redirect } from "@/i18n/navigation";
import type { Metadata } from "next";
import type { SearchResourceType } from "@mohasinac/appkit";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

const ROUTE_MAP: Record<SearchResourceType, string> = {
  products:        "/products",
  auctions:        "/auctions",
  "pre-orders":    "/pre-orders",
  "prize-draws":   "/prize-draws",
  bundles:         "/bundles",
  classified:      "/classified",
  "digital-codes": "/digital-codes",
  live:            "/live",
  stores:          "/stores",
  categories:      "/categories",
  brands:          "/brands",
  events:          "/events",
  blog:            "/blog",
  faqs:            "/faqs",
};

const VALID_TYPES = new Set<string>(Object.keys(ROUTE_MAP));

type Props = {
  searchParams: Promise<Record<string, string | string[]>>;
};

export default async function SearchRedirectPage({ searchParams }: Props) {
  const params = await searchParams;
  const q = Array.isArray(params.q) ? (params.q[0] ?? "") : (params.q ?? "");
  const rawType = Array.isArray(params.type) ? (params.type[0] ?? "") : (params.type ?? "");
  const type: SearchResourceType = VALID_TYPES.has(rawType)
    ? (rawType as SearchResourceType)
    : "products";

  const base = ROUTE_MAP[type];
  redirect(q.trim() ? `${base}?q=${encodeURIComponent(q.trim())}` : base);
}
