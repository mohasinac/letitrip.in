import { StoreAboutView, type StoreDetail } from "@mohasinac/appkit/features/stores";

type Props = {
  params: Promise<{ storeSlug: string }>;
};

export default async function Page({ params }: Props) {
  const { storeSlug } = await params;
  const store: StoreDetail = {
    id: storeSlug,
    storeSlug,
    ownerId: "",
    storeName: storeSlug,
    status: "active",
    isPublic: true,
    storeDescription: "Store about route wired to appkit.",
  };

  return <StoreAboutView store={store} />;
}