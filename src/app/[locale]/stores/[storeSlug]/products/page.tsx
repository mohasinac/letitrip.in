import { Suspense } from "react";
import { Spinner } from "@/components";
import { StoreProductsView } from "@/features/stores";

interface Props {
  params: Promise<{ locale: string; storeSlug: string }>;
}

export default async function StoreProductsPage({ params }: Props) {
  const { storeSlug } = await params;
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      }
    >
      <StoreProductsView storeSlug={storeSlug} />
    </Suspense>
  );
}
