import { StoreReviewsView } from "@mohasinac/appkit/features/stores";
import type { Review } from "@mohasinac/appkit/features/reviews";
import { Div, Text } from "@mohasinac/appkit/ui";

type Props = {
  params: Promise<{ storeSlug: string }>;
};

export default async function Page({ params }: Props) {
  const { storeSlug } = await params;

  return (
    <StoreReviewsView
      storeSlug={storeSlug}
      labels={{ title: "Store Reviews" }}
      items={[] as Review[]}
      total={0}
      renderReviews={() => (
        <Div className="rounded-xl border border-zinc-200 bg-white p-5">
          <Text className="text-zinc-600">No reviews for this store yet.</Text>
        </Div>
      )}
    />
  );
}