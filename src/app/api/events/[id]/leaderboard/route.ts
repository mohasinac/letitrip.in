import { withProviders } from "@/providers.config";
import { GET as eventIdGET } from "@mohasinac/appkit/features/events/api/[id]/route";

// Leaderboard is included in the event detail response from eventIdGET.
// This route re-exposes the same handler so EVENT_ENDPOINTS.LEADERBOARD resolves.
const __GET__g = withProviders(eventIdGET);

export const GET = __GET__g;
