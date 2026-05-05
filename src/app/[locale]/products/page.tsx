import { ProductsIndexPageView } from "@mohasinac/appkit";

export const revalidate = 120;

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[]>>;
}) {
  const resolvedSearchParams = await searchParams;
  return <ProductsIndexPageView searchParams={resolvedSearchParams} />;
}
