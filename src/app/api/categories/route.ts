import { withProviders } from "@/providers.config";
import { GET as categoriesGET, POST as categoriesPOST } from "@mohasinac/appkit/features/categories/api/route";

export const GET = withProviders(categoriesGET);
export const POST = withProviders(categoriesPOST);