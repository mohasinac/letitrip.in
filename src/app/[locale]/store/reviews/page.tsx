import { SellerReviewsView } from "@mohasinac/appkit/client";
import { API_ROUTES } from "@/constants";

export default function Page() {
  return (
    <SellerReviewsView
      reviewsApiBase={API_ROUTES.STORE.REVIEWS}
      replyApiBase={API_ROUTES.STORE.REVIEWS}
    />
  );
}
