import { StoreAboutView, type StoreDetail } from "@mohasinac/appkit";
import { storeRepository } from "@mohasinac/appkit";

type Props = {
  params: Promise<{ storeSlug: string }>;
};

export default async function Page({ params }: Props) {
  const { storeSlug } = await params;
  const store = await storeRepository.findBySlug(storeSlug).catch(() => undefined);

  if (!store) {
    return null;
  }

  return <StoreAboutView store={store as unknown as StoreDetail} />;
}