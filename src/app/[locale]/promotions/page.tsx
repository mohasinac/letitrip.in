import { PromotionsView } from "@mohasinac/appkit";
import { EmptyState } from "@mohasinac/appkit/ui";

export default function Page() {
  return (
    <PromotionsView
      hasContent={false}
      labels={{
        exclusiveOffersBadge: "Exclusive Offers",
        title: "Promotions",
        subtitle: "Latest offers and campaigns",
        emptyDeals: "No active promotions",
        checkBack: "Please check back soon.",
        couponsTitle: "Coupons",
        couponsSubtitle: "Available discounts",
        emptyCoupons: "No coupons available",
        dealsTitle: "Deals",
        dealsSubtitle: "Top deals",
        featuredTitle: "Featured",
        featuredSubtitle: "Featured promotions",
      }}
      renderDealsSection={() => (
        <EmptyState
          title="No active deals"
          description="Check back soon for exclusive offers and limited-time deals."
          icon={
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M7 7h.01M3 3l4.95 4.95m0 0A7 7 0 1021 12a7 7 0 00-7-7 7 7 0 00-4.95 2.05L3 3" />
            </svg>
          }
        />
      )}
    />
  );
}