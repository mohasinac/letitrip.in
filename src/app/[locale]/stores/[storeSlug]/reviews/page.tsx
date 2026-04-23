import { StoreReviewsPageView } from "@mohasinac/appkit";

type Props = {
  params: Promise<{ storeSlug: string }>;
};

export default async function Page({ params }: Props) {
  const { storeSlug } = await params;
  return <StoreReviewsPageView storeSlug={storeSlug} />;
}