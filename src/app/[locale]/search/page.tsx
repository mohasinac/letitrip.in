import { SearchView } from "@mohasinac/appkit/features/search";
import { Button, Div, Input, Text } from "@mohasinac/appkit/ui";

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
        <Div className="rounded-xl border border-zinc-200 bg-white p-5">
          <Text className="text-zinc-600">No search results yet.</Text>
        </Div>
      )}
    />
  );
}