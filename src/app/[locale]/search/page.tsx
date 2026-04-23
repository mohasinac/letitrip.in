import {
  Button,
  Div,
  Input,
  SearchView,
  Text,
} from "@mohasinac/appkit";
import { redirect } from "next/navigation";

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

  return (
    <SearchView
      query={query}
      total={0}
      isLoading={false}
      renderSearchInput={() => (
        <form method="get" action={`/${locale}/search`} className="flex items-center gap-2">
          <Input name="q" defaultValue={query} placeholder="Search products, categories, stores" />
          <Button type="submit">Search</Button>
        </form>
      )}
      renderResults={() => (
        !query ? (
          <Div className="rounded-xl border border-zinc-200 bg-white p-6 text-center dark:border-slate-700 dark:bg-slate-900">
            <Text className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Search the marketplace</Text>
            <Text className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Enter a keyword above to search products and stores.</Text>
          </Div>
        ) : null
      )}
    />
  );
}