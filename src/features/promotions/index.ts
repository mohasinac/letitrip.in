export * from "./components";

// Types and hook from @mohasinac/feat-promotions (source of truth for portable code)
export type {
  CouponType,
  CouponScope,
  CouponItem,
  PromotionsListResponse,
  PromotionsListParams,
} from "@mohasinac/feat-promotions";
export { usePromotions } from "@mohasinac/feat-promotions";
