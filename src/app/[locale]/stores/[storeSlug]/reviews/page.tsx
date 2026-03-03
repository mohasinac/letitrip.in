import { Suspense } from "react";
import { Spinner } from "@/components";
import { StoreReviewsView } from "@/features/stores";
import { THEME_CONSTANTS } from "@/constants";

const { flex, page } = THEME_CONSTANTS;

interface Props {
  params: Promise<{ locale: string; storeSlug: string }>;
}

export default async function StoreReviewsPage({ params }: Props) {
  const { storeSlug } = await params;
  return (
    <Suspense
      fallback={
        <div className={`${flex.hCenter} ${page.empty}`}>
          <Spinner />
        </div>
      }
    >
      <StoreReviewsView storeSlug={storeSlug} />
    </Suspense>
  );
}
