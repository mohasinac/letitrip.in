import { storeRepository, type StoreDetail } from "@mohasinac/appkit";
import { StoreAboutClient } from "./StoreAboutClient";

type Props = {
  params: Promise<{ storeSlug: string }>;
};

export default async function Page({ params }: Props) {
  const { storeSlug } = await params;
  const store = await storeRepository.findBySlug(storeSlug).catch(() => undefined);

  if (!store) return null;

  return <StoreAboutClient store={store as unknown as StoreDetail} />;
}
