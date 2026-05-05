import { redirect } from "next/navigation";
import { SearchPageClient } from "./SearchPageClient";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; page?: string }>;
};

function normalizePage(page: string | undefined): number {
  const parsed = Number(page ?? "1");
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function buildCanonicalSearchPath(locale: string, query: string, page: number): string {
  const encodedQuery = encodeURIComponent(query);
  return `/${locale}/search/${encodedQuery}/tab/all/sort/relevance/page/${page}`;
}

export default async function Page({ params, searchParams }: Props) {
  const { locale } = await params;
  const { q, page } = await searchParams;
  const query = (q ?? "").trim();

  if (query) {
    redirect(buildCanonicalSearchPath(locale, query, normalizePage(page)));
  }

  return <SearchPageClient locale={locale} query={query} />;
}
