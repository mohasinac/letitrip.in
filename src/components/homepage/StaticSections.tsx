"use client";

import dynamic from "next/dynamic";

const FAQSection = dynamic(() => import("@/components/faq/FAQSection"), {
  ssr: true,
  loading: () => <FAQSkeleton />,
});

const ShopsNav = dynamic(() => import("@/components/layout/ShopsNav"), {
  ssr: true,
  loading: () => <ShopsSkeleton />,
});

interface StaticSectionsProps {
  isMobile: boolean;
}

export function StaticSections({ isMobile }: StaticSectionsProps) {
  return (
    <>
      {/* Shops Navigation */}
      <ShopsNav />

      {/* FAQ Section */}
      <section id="faq-section" className="py-6 md:py-8">
        <FAQSection
          title="Frequently Asked Questions"
          description="Quick answers about authentic collectibles, shipping, and more"
          maxItemsToShow={isMobile ? 4 : 6}
          defaultCategory="getting-started"
        />
      </section>
    </>
  );
}

function FAQSkeleton() {
  return (
    <div className="py-8">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
        Frequently Asked Questions
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Quick answers about authentic collectibles, shipping, and more
      </p>
      <div className="space-y-3 md:space-y-4">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="h-14 md:h-16 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}

function ShopsSkeleton() {
  return (
    <div className="py-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        Featured Shops
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-40 md:h-48 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}
