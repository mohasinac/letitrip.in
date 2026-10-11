import { withProviders } from "@/providers.config";
import { GET as searchGET } from "@mohasinac/appkit/features/search/api/route";

export const GET = withProviders(searchGET);