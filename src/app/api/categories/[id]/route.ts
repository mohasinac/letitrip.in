import { withProviders } from "@/providers.config";
import { categoryItemPATCH, categoryItemDELETE } from "@mohasinac/appkit/features/categories/api/[id]/route";
import { categoryItemGET } from "@mohasinac/appkit";

export const GET = withProviders(categoryItemGET);
export const PATCH = withProviders(categoryItemPATCH);
export const DELETE = withProviders(categoryItemDELETE);