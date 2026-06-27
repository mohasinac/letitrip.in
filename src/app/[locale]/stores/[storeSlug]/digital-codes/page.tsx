import { Suspense } from "react";
import { StoreDigitalCodesPageView } from "@mohasinac/appkit";

type Props = {
  params: Promise<{ storeSlug: string }>;
};

export default async function Page({ params }: Props) {
  const { storeSlug } = await params;
  return (
    <Suspense>
      <StoreDigitalCodesPageView storeSlug={storeSlug} />
    </Suspense>
  );
}
