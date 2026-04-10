import { withProviders } from "@/providers.config";
import {
  reviewItemGET,
  reviewItemPATCH,
  reviewItemDELETE,
} from "@mohasinac/appkit/features/reviews/server";

export const GET = withProviders(reviewItemGET);
export const PATCH = withProviders(reviewItemPATCH);
export const DELETE = withProviders(reviewItemDELETE);
