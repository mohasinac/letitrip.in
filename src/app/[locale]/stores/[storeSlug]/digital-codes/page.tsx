import { Suspense } from "react";
import { StoreDigitalCodesPageView } from "@mohasinac/appkit";

type Props = {
  params: Promise<{ storeSlug: string }>;
  searchParams: Promise<Record<string, string | string[]>>;
};

export default async function Page({ params, searchParams }: Props) {
  const { storeSlug } = await params;
  // Forwarded so the URL's sort/filter/page reach the SSR fetch. Without this
  // the first paint always rendered page 1 in the default order, no matter what
  // the toolbar showed as selected.
  const sp = await searchParams;
  return (
    <Suspense>
      <StoreDigitalCodesPageView storeSlug={storeSlug} searchParams={sp} />
    </Suspense>
  );
}
