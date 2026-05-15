import { Suspense } from "react";
import {
  StoreProductsPageView,
  loadProductFeaturesForStore,
} from "@mohasinac/appkit";
import { ProductFeaturesProvider } from "@mohasinac/appkit/client";

type Props = {
  params: Promise<{ storeSlug: string }>;
};

export default async function Page({ params }: Props) {
  const { storeSlug } = await params;
  const features = await loadProductFeaturesForStore(storeSlug).catch(() => []);
  return (
    <Suspense>
      <ProductFeaturesProvider features={features}>
        <StoreProductsPageView storeSlug={storeSlug} />
      </ProductFeaturesProvider>
    </Suspense>
  );
}