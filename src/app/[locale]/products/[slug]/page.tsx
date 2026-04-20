import { ProductDetailView } from "@mohasinac/appkit";
import { Div, Heading, Text } from "@mohasinac/appkit";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function Page({ params }: Props) {
  const { slug } = await params;

  return (
    <ProductDetailView
      renderGallery={() => (
        <Div className="rounded-xl border border-zinc-200 bg-white p-5">
          <Text className="text-zinc-600">Product media gallery will render here.</Text>
        </Div>
      )}
      renderInfo={() => (
        <Div className="rounded-xl border border-zinc-200 bg-white p-5">
          <Heading level={2} className="mb-2 text-lg font-semibold text-zinc-900">
            Product Information
          </Heading>
          <Text className="text-zinc-600">Detailed product content is being wired.</Text>
        </Div>
      )}
      renderActions={() => (
        <Div className="rounded-xl border border-zinc-200 bg-white p-5">
          <Text className="text-sm text-zinc-600">Buy/add-to-cart actions will appear here.</Text>
        </Div>
      )}
    />
  );
}