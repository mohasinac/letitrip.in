import { withProviders } from "@/providers.config";
import {
  categoryItemGET,
  categoryItemPATCH,
  categoryItemDELETE,
} from "@mohasinac/appkit";

// rbac-scope-enforced-in-handler: per-verb auth enforced within handler
export const GET = withProviders(categoryItemGET);
// rbac-scope-enforced-in-handler: per-verb auth enforced within handler
export const PATCH = withProviders(categoryItemPATCH);
// rbac-scope-enforced-in-handler: per-verb auth enforced within handler
export const DELETE = withProviders(categoryItemDELETE);