import { Suspense } from "react";
import { StoreBundlesPageView } from "@mohasinac/appkit";
import { buyBundleAction } from "@/actions/bundle.actions";

type Props = {
  params: Promise<{ storeSlug: string }>;
};

export default async function Page({ params }: Props) {
  const { storeSlug } = await params;
  return (
    <Suspense>
      <StoreBundlesPageView storeSlug={storeSlug} onBuyNow={buyBundleAction} />
    </Suspense>
  );
}
