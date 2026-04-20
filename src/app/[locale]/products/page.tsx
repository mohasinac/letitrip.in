import { ProductsIndexPageView } from "@mohasinac/appkit/features/products";

export const revalidate = 120;

export default async function Page() {
  return <ProductsIndexPageView />;
}