import { withFeatureGuard } from "@/lib/features";
import { withProviders } from "@/providers.config";
import { eventIdGET } from "@mohasinac/appkit";

const __GET__g = withProviders(eventIdGET);

export const GET = withFeatureGuard("EVENTS", __GET__g);
