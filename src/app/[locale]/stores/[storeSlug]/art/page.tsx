import { Suspense } from "react";
import { StoreArtStickersPageView } from "@mohasinac/appkit";

type Props = {
  params: Promise<{ storeSlug: string }>;
  searchParams: Promise<Record<string, string | string[]>>;
};

export default async function Page({ params, searchParams }: Props) {
  const { storeSlug } = await params;
  const sp = await searchParams;
  return (
    <Suspense>
      <StoreArtStickersPageView storeSlug={storeSlug} searchParams={sp} />
    </Suspense>
  );
}
