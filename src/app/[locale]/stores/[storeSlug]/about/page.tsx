import { storeRepository, type StoreDetail } from "@mohasinac/appkit";
import { GoogleReviewsSection } from "@mohasinac/appkit/server";
import { StoreAboutClient } from "./StoreAboutClient";

type Props = {
  params: Promise<{ storeSlug: string }>;
};

export default async function Page({ params }: Props) {
  const { storeSlug } = await params;
  const store = await storeRepository.findBySlug(storeSlug).catch(() => undefined);

  if (!store) return null;

  // audit-unknown-ok: TS structural escape
  const gr = (store as unknown as { googleReviews?: { placeId: string; enabled: boolean; maxReviews?: number; minRating?: number; layout?: "grid" | "carousel" } }).googleReviews;
  return (
    <>
      {/* audit-unknown-ok: TS structural escape — StoreDetail */}
      <StoreAboutClient store={store as unknown as StoreDetail} />
      {gr?.enabled && gr.placeId && (
        <GoogleReviewsSection
          placeId={gr.placeId}
          maxReviews={gr.maxReviews}
          minRating={gr.minRating}
          layout={gr.layout}
        />
      )}
    </>
  );
}
