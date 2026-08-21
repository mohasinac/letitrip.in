"use client";
import { Button, Div, Form, Input, SearchView, Text } from "@mohasinac/appkit/client";

const __P = {
  p6: "p-[var(--appkit-space-6)]",
} as const;

type Props = { locale: string; query: string };

export function SearchPageClient({ locale, query }: Props) {
  return (
    <SearchView
      query={query}
      total={0}
      renderSearchInput={() => (
        <Form method="get" action={`/${locale}/search`} align="center" gap="xs" className="flex">
          <Input name="q" defaultValue={query} placeholder="Search products, categories, stores" />
          <Button type="submit">Search</Button>
        </Form>
      )}
      renderResults={() =>
        !query ? (
          <Div className={`${__P.p6} text-center`} rounded="xl" surface="default" border="default">
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
