import { CategoriesIndexPageView } from "@mohasinac/appkit";

export const revalidate = 300;

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[]>>;
}) {
  const resolvedSearchParams = await searchParams;
  return <CategoriesIndexPageView searchParams={resolvedSearchParams} />;
}
