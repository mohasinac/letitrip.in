import { StoreAuctionsView } from "@mohasinac/appkit/features/stores";
import { Div, Text } from "@mohasinac/appkit/ui";

type Props = {
  params: Promise<{ storeSlug: string }>;
};

export default async function Page({ params }: Props) {
  const { storeSlug } = await params;

  return (
    <StoreAuctionsView
      storeSlug={storeSlug}
      labels={{ title: "Store Auctions" }}
      renderAuctions={() => (
        <Div className="rounded-xl border border-zinc-200 bg-white p-5">
          <Text className="text-zinc-600">No store auctions found.</Text>
        </Div>
      )}
    />
  );
}