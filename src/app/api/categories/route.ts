import { withProviders } from "@/providers.config";
import { categoriesGET, POST as categoriesPOST } from "@mohasinac/appkit";

// rbac-public: public endpoint — no authentication required
export const GET = withProviders(categoriesGET);
// rbac-public: public endpoint — no authentication required
export const POST = withProviders(categoriesPOST);