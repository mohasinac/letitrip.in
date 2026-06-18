import { withProviders } from "@/providers.config";
import {
  productItemGET,
  productItemPATCH,
  productItemDELETE,
} from "@mohasinac/appkit";

export const GET = withProviders(productItemGET);
export const PATCH = withProviders(productItemPATCH);
export const DELETE = withProviders(productItemDELETE);
