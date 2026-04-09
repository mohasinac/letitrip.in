import { withProviders } from "@/providers.config";
import { storeAuctionsGET } from "@mohasinac/appkit/features/stores/server";
export const GET = withProviders(storeAuctionsGET);
