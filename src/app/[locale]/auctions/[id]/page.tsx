import { AuctionDetailView } from "@mohasinac/appkit/features/products";
import { Div, Heading, Text } from "@mohasinac/appkit/ui";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: Props) {
  const { id } = await params;

  return (
    <AuctionDetailView
      renderGallery={() => (
        <Div className="rounded-xl border border-zinc-200 bg-white p-5">
          <Text className="text-zinc-600">Auction media content will render here.</Text>
        </Div>
      )}
      renderInfo={() => (
        <Div className="rounded-xl border border-zinc-200 bg-white p-5">
          <Heading level={2} className="mb-2 text-lg font-semibold text-zinc-900">
            Auction Details
          </Heading>
          <Text className="text-zinc-600">Bidding metadata is being connected.</Text>
        </Div>
      )}
      renderBidForm={() => (
        <Div className="rounded-xl border border-zinc-200 bg-white p-5">
          <Text className="text-sm text-zinc-600">Bid form will render here.</Text>
        </Div>
      )}
      renderMobileBidForm={() => (
        <Div className="rounded-xl border border-zinc-200 bg-white p-5 lg:hidden">
          <Text className="text-sm text-zinc-600">Mobile bid panel.</Text>
        </Div>
      )}
    />
  );
}