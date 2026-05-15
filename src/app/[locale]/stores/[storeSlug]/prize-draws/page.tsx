import { Suspense } from "react";
import { StorePrizeDrawsPageView } from "@mohasinac/appkit";

type Props = {
  params: Promise<{ storeSlug: string }>;
};

export default async function Page({ params }: Props) {
  const { storeSlug } = await params;
  return (
    <Suspense>
      <StorePrizeDrawsPageView storeSlug={storeSlug} />
    </Suspense>
  );
}
