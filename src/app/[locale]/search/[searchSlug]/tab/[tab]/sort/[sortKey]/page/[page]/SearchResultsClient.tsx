"use client";
import {
  AdSlot,
  Button,
  Div,
  Input,
  InteractiveProductCard,
  ROUTES,
  SearchView,
  Text,
} from "@mohasinac/appkit/client";

const __P = {
  p6: "p-6",
} as const;

type Product = { id: string; slug?: string; [key: string]: unknown };

type Props = {
  locale: string;
  query: string;
  total: number;
  products: Product[];
};

export function SearchResultsClient({ locale, query, total, products }: Props) {
  return (
    <SearchView
      query={query}
      total={total}
      isLoading={false}
      renderSearchInput={() => (
        <Div className="space-y-4">
          <form method="get" action={`/${locale}/search`} className="flex items-center gap-2">
            <Input name="q" defaultValue={query} placeholder="Search products, categories, stores" />
            <Button type="submit">Search</Button>
          </form>
          <AdSlot id="search-inline" />
        </Div>
      )}
      renderResults={() =>
        products.length > 0 ? (
          <Div className="space-y-6">
            <Div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <InteractiveProductCard
                  key={product.id}
                  product={product as never}
                  href={String(ROUTES.PUBLIC.PRODUCT_DETAIL((product as any).slug ?? product.id))}
                />
              ))}
            </Div>
            <AdSlot id="listing-between-rows" />
          </Div>
        ) : (
          <Div className={`rounded-xl border border-zinc-200 bg-white ${__P.p6} text-center dark:border-slate-700 dark:bg-slate-900`}>
            <Text className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              No results for &ldquo;{query}&rdquo;
            </Text>
            <Text className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Try a different keyword or browse categories.
            </Text>
          </Div>
        )
      }
    />
  );
}
