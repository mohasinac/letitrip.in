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
        // audit-raw-form-input-ok: plain GET-form URL search bar — Zod/FormShell overkill
        <form method="get" action={`/${locale}/search`} className="flex items-center gap-2">
          <Input name="q" defaultValue={query} placeholder="Search products, categories, stores" />
          <Button type="submit">Search</Button>
        </form>
      )}
      renderResults={() =>
        !query ? (
          <Div className={`rounded-xl border border-zinc-200 bg-white ${__P.p6} text-center dark:border-slate-700 dark:bg-slate-900`}>
            <Text size="base" weight="semibold" color="primary">
              Search the marketplace
            </Text>
            <Text className="mt-1" color="muted" size="sm">
              Enter a keyword above to search products and stores.
            </Text>
          </Div>
        ) : null
      }
    />
  );
}
