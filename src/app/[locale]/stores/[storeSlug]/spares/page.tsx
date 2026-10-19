import { Suspense } from "react";
import { StoreSparesPageView } from "@mohasinac/appkit";

type Props = {
  params: Promise<{ storeSlug: string }>;
  searchParams: Promise<Record<string, string | string[]>>;
};

/*
 * 🛑 This folder is NOT optional. `STORE_PAGE_TABS` derives from the listing-type
 * plugin registry, so the Spares tab renders on every store page as soon as the
 * plugin exists — and no audit covers a derived tab whose folder is missing. It
 * would simply be a clickable 404.
 */
export default async function Page({ params, searchParams }: Props) {
  const { storeSlug } = await params;
  // Forwarded so the URL's sort/filter/page reach the SSR fetch — without it
  // the first paint always renders page 1 in the default order no matter what
  // the toolbar shows as selected.
  const sp = await searchParams;
  return (
    <Suspense>
      <StoreSparesPageView storeSlug={storeSlug} searchParams={sp} />
    </Suspense>
  );
}
