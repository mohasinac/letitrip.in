import { PromotionsView } from "@mohasinac/appkit/features/promotions";
import { Div, Text } from "@mohasinac/appkit/ui";

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
        <Div className="rounded-xl border border-zinc-200 bg-white p-5">
          <Text className="text-zinc-600">No promotional deals yet.</Text>
        </Div>
      )}
    />
  );
}