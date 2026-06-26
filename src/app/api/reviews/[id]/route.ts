import { withProviders } from "@/providers.config";
import {
  reviewItemGET,
  reviewItemPATCH,
  reviewItemDELETE,
} from "@mohasinac/appkit";

// rbac-scope-enforced-in-handler: per-verb auth enforced within handler
export const GET = withProviders(reviewItemGET);
// rbac-scope-enforced-in-handler: per-verb auth enforced within handler
export const PATCH = withProviders(reviewItemPATCH);
// rbac-scope-enforced-in-handler: per-verb auth enforced within handler
export const DELETE = withProviders(reviewItemDELETE);