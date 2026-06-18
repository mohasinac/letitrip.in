import { withProviders } from "@/providers.config";
import {
  categoryItemGET,
  categoryItemPATCH,
  categoryItemDELETE,
} from "@mohasinac/appkit";

export const GET = withProviders(categoryItemGET);
export const PATCH = withProviders(categoryItemPATCH);
export const DELETE = withProviders(categoryItemDELETE);
