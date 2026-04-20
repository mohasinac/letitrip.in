import { StoreProductsRouteClient } from "@/components/routing/StoreProductsRouteClient";

type Props = {
  params: Promise<{ storeSlug: string }>;
};

export default async function Page({ params }: Props) {
  const { storeSlug } = await params;
  return <StoreProductsRouteClient storeSlug={storeSlug} />;
}