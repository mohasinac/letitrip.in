import { Suspense } from "react";
import { CouponsIndexListing } from "@mohasinac/appkit";
import { storeRepository } from "@mohasinac/appkit/server";

type Props = {
  params: Promise<{ storeSlug: string }>;
};

export default async function Page({ params }: Props) {
  const { storeSlug } = await params;
  // NOT swallowed: `storeId` is what scopes the listing below, so a failed read
  // used to render every coupon on the platform under this store's heading.
  const store = await storeRepository.findBySlug(storeSlug);
  const storeId = (store as any)?.id ?? undefined;

  return (
    <Suspense>
      <CouponsIndexListing storeId={storeId} />
    </Suspense>
  );
}
