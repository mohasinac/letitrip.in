import { withProviders } from "@/providers.config";
import { GET as productItemGET, PATCH as productItemPATCH, DELETE as productItemDELETE } from "@mohasinac/appkit/features/products/api/[id]/route";

export const GET = withProviders(productItemGET);
export const PATCH = withProviders(productItemPATCH);
export const DELETE = withProviders(productItemDELETE);