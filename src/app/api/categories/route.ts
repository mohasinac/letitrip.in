import { withProviders } from "@/providers.config";
import { categoriesGET, POST as categoriesPOST } from "@mohasinac/appkit";

export const GET = withProviders(categoriesGET);
export const POST = withProviders(categoriesPOST);
