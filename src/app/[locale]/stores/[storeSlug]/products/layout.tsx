import type { ReactNode } from "react";
import { StoreDetailLayoutView } from "@mohasinac/appkit";

type Props = {
  children: ReactNode;
  params: Promise<{ storeSlug: string }>;
};

export default async function Layout({ children, params }: Props) {
  const { storeSlug } = await params;
  return (
    <StoreDetailLayoutView storeSlug={storeSlug} activeTab="products">
      {children}
    </StoreDetailLayoutView>
  );
}
