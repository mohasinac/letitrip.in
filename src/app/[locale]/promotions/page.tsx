import { PromotionsView } from "@mohasinac/appkit";

export const revalidate = 120;

export default function Page() {
  return (
    <PromotionsView
      labels={{
        exclusiveOffersBadge: "Exclusive Offers",
        title: "Promotions & Deals",
        subtitle: "Discover amazing deals and exclusive offers on our products",
        emptyDeals: "No deals available right now",
        checkBack: "Check back later for new promotions!",
        couponsTitle: "Available Coupons",
        couponsSubtitle: "Use these coupons at checkout",
        emptyCoupons: "No coupons available",
        dealsTitle: "Hot Deals",
        dealsSubtitle: "Limited time offers",
        featuredTitle: "Featured Products",
        featuredSubtitle: "Handpicked for you",
      }}
      hasContent={true}
    />
  );
}