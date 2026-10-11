import { Suspense } from "react";
import { StoreReviewsPageView } from "@mohasinac/appkit/features/stores/components/StoreReviewsPageView";

type Props = {
  params: Promise<{ storeSlug: string }>;
};

export default async function Page({ params }: Props) {
  const { storeSlug } = await params;
  return (
    <Suspense>
      <StoreReviewsPageView storeSlug={storeSlug} />
    </Suspense>
  );
}