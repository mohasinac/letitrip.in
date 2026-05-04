import { CouponsIndexListing } from "@mohasinac/appkit";
import { storeRepository } from "@mohasinac/appkit/server";

type Props = {
  params: Promise<{ storeSlug: string }>;
};

export default async function Page({ params }: Props) {
  const { storeSlug } = await params;
  const store = await storeRepository.findBySlug(storeSlug).catch(() => null);
  const sellerId = (store as any)?.ownerId ?? (store as any)?.sellerId ?? undefined;

  return (
    <CouponsIndexListing
      storeSlug={storeSlug}
      sellerId={sellerId}
    />
  );
}
