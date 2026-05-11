import { CouponsIndexListing } from "@mohasinac/appkit";
import { storeRepository } from "@mohasinac/appkit/server";

type Props = {
  params: Promise<{ storeSlug: string }>;
};

export default async function Page({ params }: Props) {
  const { storeSlug } = await params;
  const store = await storeRepository.findBySlug(storeSlug).catch(() => null);
  const storeId = (store as any)?.id ?? undefined;

  return (
    <CouponsIndexListing
      storeSlug={storeSlug}
      storeId={storeId}
    />
  );
}
