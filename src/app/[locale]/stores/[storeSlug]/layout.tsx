import { StoreHeader, StoreNavTabs } from "@/features/stores";

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
      <main className="flex-1 max-w-screen-2xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8">
        {children}
      </main>
    </div>
  );
}
