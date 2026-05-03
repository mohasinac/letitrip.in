import { CategoriesIndexPageView } from "@mohasinac/appkit";

export const revalidate = 300;

export default function Page({
  searchParams,
}: {
  searchParams?: Record<string, string | string[]>;
}) {
  return <CategoriesIndexPageView searchParams={searchParams} />;
}
