import type { ReactNode } from "react";
import { StoreDetailLayoutView } from "@mohasinac/appkit";

type Props = {
  children: ReactNode;
  params: Promise<unknown>;
};

export default async function Layout({ children, params }: Props) {
  const { storeSlug } = (await params) as { storeSlug: string };
  return (
    <StoreDetailLayoutView storeSlug={storeSlug} activeTab="reviews">
      {children}
    </StoreDetailLayoutView>
  );
}
