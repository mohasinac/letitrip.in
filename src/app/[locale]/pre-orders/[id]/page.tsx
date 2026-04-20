import { PreOrderDetailView } from "@mohasinac/appkit/features/products";
import { Div, Heading, Text } from "@mohasinac/appkit/ui";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: Props) {
  const { id } = await params;

  return (
    <PreOrderDetailView
      renderGallery={() => (
        <Div className="rounded-xl border border-zinc-200 bg-white p-5">
          <Text className="text-zinc-600">Pre-order gallery will render here.</Text>
        </Div>
      )}
      renderInfo={() => (
        <Div className="rounded-xl border border-zinc-200 bg-white p-5">
          <Heading level={2} className="mb-2 text-lg font-semibold text-zinc-900">
            Pre-Order Details
          </Heading>
          <Text className="text-zinc-600">Availability timeline and details pending.</Text>
        </Div>
      )}
      renderBuyBar={() => (
        <Div className="rounded-xl border border-zinc-200 bg-white p-5">
          <Text className="text-sm text-zinc-600">Reserve now actions will appear here.</Text>
        </Div>
      )}
    />
  );
}