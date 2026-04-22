import { SearchView } from "@mohasinac/appkit";
import { Button, Div, Input } from "@mohasinac/appkit";
import { EmptyState } from "@mohasinac/appkit/ui";

type Props = {
  searchParams: Promise<{ q?: string }>;
};

export default async function Page({ searchParams }: Props) {
  const { q } = await searchParams;

  return (
    <SearchView
      query={q}
      total={0}
      isLoading={false}
      renderSearchInput={() => (
        <Div className="flex items-center gap-2">
          <Input defaultValue={q ?? ""} placeholder="Search products, categories, stores" />
          <Button type="button">Search</Button>
        </Div>
      )}
      renderResults={() => (
        <EmptyState
          title={q ? `No results for "${q}"` : "Search the marketplace"}
          description={
            q
              ? "Try a different keyword, or browse categories to discover products."
              : "Enter a keyword above to search across products, stores, and categories."
          }
          icon={
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
          }
          actionLabel={q ? "Browse categories" : undefined}
          actionHref={q ? "/categories" : undefined}
        />
      )}
    />
  );
}