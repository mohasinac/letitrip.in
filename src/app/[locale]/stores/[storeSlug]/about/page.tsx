import { storeRepository } from "@mohasinac/appkit";
import { GoogleReviewsSection, toStoreDetail } from "@mohasinac/appkit/server";
import { StoreAboutClient } from "./StoreAboutClient";

type Props = {
  params: Promise<{ storeSlug: string }>;
};

export default async function Page({ params }: Props) {
  const { storeSlug } = await params;
  const store = await storeRepository.findBySlug(storeSlug).catch(() => undefined);

  if (!store) return null;

  // `gr` is read off the raw document and consumed by a Server Component only —
  // it never crosses the client boundary. Everything that DOES cross it goes
  // through toStoreDetail(), the single public allow-list: passing the raw
  // StoreDocument here used to serialise the store's Meta WhatsApp access
  // token, adminNotes and customCommissionRate into this page's public HTML.
  const gr = store.googleReviews;
  return (
    <>
      <StoreAboutClient store={toStoreDetail(store)} />
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
