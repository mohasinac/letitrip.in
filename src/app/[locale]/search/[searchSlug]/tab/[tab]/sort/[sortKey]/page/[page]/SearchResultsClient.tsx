"use client";
import {
  AdSlot,
  Button,
  Div,
  Form,
  Input,
  InteractiveProductCard,
  ROUTES,
  SearchView,
  Stack,
  Text,
} from "@mohasinac/appkit/client";

const __P = {
  p6: "p-[var(--appkit-space-6)]",
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
      renderSearchInput={() => (
        <Stack gap="md">
          <Form method="get" action={`/${locale}/search`} align="center" gap="xs" className="flex">
            <Input name="q" defaultValue={query} placeholder="Search products, categories, stores" />
            <Button type="submit">Search</Button>
          </Form>
          <AdSlot id="search-inline" />
        </Stack>
      )}
      renderResults={() =>
        products.length > 0 ? (
          <Stack gap="lg">
            <Div layout="grid" gap="4" className="grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <InteractiveProductCard
                  key={product.id}
                  product={product as never}
                  href={String(ROUTES.PUBLIC.PRODUCT_DETAIL((product as any).slug ?? product.id))}
                />
              ))}
            </Div>
            <AdSlot id="listing-between-rows" />
          </Stack>
        ) : (
          <Div className={`${__P.p6} text-center`} rounded="xl" surface="default" border="default">
            <Text size="base" weight="semibold" color="primary">
              No results for &ldquo;{query}&rdquo;
            </Text>
            <Text className="mt-1" color="muted" size="sm">
              Try a different keyword or browse categories.
            </Text>
          </Div>
        )
      }
    />
  );
}
