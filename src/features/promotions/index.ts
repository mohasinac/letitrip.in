export * from "./components";

// Types and hook from @mohasinac/feat-promotions (source of truth for portable code)
export type {
  CouponType,
  CouponScope,
  CouponItem,
  PromotionsListResponse,
  PromotionsListParams,
} from "@mohasinac/appkit/features/promotions";
export { usePromotions } from "@mohasinac/appkit/features/promotions";
