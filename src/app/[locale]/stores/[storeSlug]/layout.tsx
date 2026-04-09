import { StoreHeader, StoreNavTabs } from "@/features/stores/components";
import { THEME_CONSTANTS } from "@/constants";
import { Main } from "@/components";

const { page } = THEME_CONSTANTS;

interface StoreLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string; storeSlug: string }>;
}

export default async function StoreLayout({
  children,
  params,
}: StoreLayoutProps) {
  const { storeSlug } = await params;

  return (
    <div className="min-h-screen flex flex-col">
      <StoreHeader storeSlug={storeSlug} />
      <StoreNavTabs storeSlug={storeSlug} />
      <Main className={`flex-1 ${page.container.wide} w-full py-6 sm:py-8`}>
        {children}
      </Main>
    </div>
  );
}
