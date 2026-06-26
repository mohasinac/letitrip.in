import { withProviders } from "@/providers.config";
import {
  productItemGET,
  productItemPATCH,
  productItemDELETE,
} from "@mohasinac/appkit";

// rbac-scope-enforced-in-handler: per-verb auth enforced within handler
export const GET = withProviders(productItemGET);
// rbac-scope-enforced-in-handler: per-verb auth enforced within handler
export const PATCH = withProviders(productItemPATCH);
// rbac-scope-enforced-in-handler: per-verb auth enforced within handler
export const DELETE = withProviders(productItemDELETE);