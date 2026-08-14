import { withFeatureGuard } from "@/lib/features";
import { withProviders } from "@/providers.config";
import { eventIdGET } from "@mohasinac/appkit";

// Leaderboard is included in the event detail response from eventIdGET.
// This route re-exposes the same handler so EVENT_ENDPOINTS.LEADERBOARD resolves.
const __GET__g = withProviders(eventIdGET);

export const GET = withFeatureGuard("EVENTS", __GET__g);
