import { Suspense } from "react";
import { Spinner } from "@/components";
import { StoreAboutView } from "@/features/stores";

interface Props {
  params: Promise<{ locale: string; storeSlug: string }>;
}

export default async function StoreAboutPage({ params }: Props) {
  const { storeSlug } = await params;
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      }
    >
      <StoreAboutView storeSlug={storeSlug} />
    </Suspense>
  );
}
