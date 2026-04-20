import { StoreAboutView, type StoreDetail } from "@mohasinac/appkit";

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
    storeDescription: "Store profile route wired to appkit.",
  };

  return <StoreAboutView store={store} />;
}