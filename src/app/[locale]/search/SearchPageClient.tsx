"use client";
import { Button, Div, Input, SearchView, Text } from "@mohasinac/appkit/client";

const __P = {
  p6: "p-6",
} as const;

type Props = { locale: string; query: string };

export function SearchPageClient({ locale, query }: Props) {
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
      renderResults={() =>
        !query ? (
          <Div className={`rounded-xl border border-zinc-200 bg-white ${__P.p6} text-center dark:border-slate-700 dark:bg-slate-900`}>
            <Text className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              Search the marketplace
            </Text>
            <Text className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Enter a keyword above to search products and stores.
            </Text>
          </Div>
        ) : null
      }
    />
  );
}
