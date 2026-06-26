import { withProviders } from "@/providers.config";
import { searchGET } from "@mohasinac/appkit";

// rbac-public: public endpoint — no authentication required
export const GET = withProviders(searchGET);