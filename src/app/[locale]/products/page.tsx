import { ProductsIndexPageView } from "@mohasinac/appkit";

export const revalidate = 120;

export default function Page({
  searchParams,
}: {
  searchParams?: Record<string, string | string[]>;
}) {
  return <ProductsIndexPageView searchParams={searchParams} />;
}
