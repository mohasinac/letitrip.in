import { withProviders } from "@/providers.config";
import { GET as categoryPriceGuidanceGET } from "@mohasinac/appkit/features/categories/api/[id]/price-guidance/route";

export const GET = withProviders(categoryPriceGuidanceGET);
