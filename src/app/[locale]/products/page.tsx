import { ProductsIndexPageView } from "@mohasinac/appkit";

export const revalidate = 120;

export default async function Page() {
  return <ProductsIndexPageView />;
}