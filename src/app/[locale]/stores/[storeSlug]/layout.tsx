import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { getStoreBySlug } from "@mohasinac/appkit";

type Props = {
  children: ReactNode;
  params: Promise<{ storeSlug: string }>;
};

export default async function Layout({ children, params }: Props) {
  const { storeSlug } = await params;
  const store = await getStoreBySlug(storeSlug).catch(() => null);
  if (!store) notFound();
  return children;
}
