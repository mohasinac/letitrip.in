import { withProviders } from "@/providers.config";
import { eventIdGET } from "@mohasinac/appkit";

// Leaderboard is included in the event detail response from eventIdGET.
// This route re-exposes the same handler so EVENT_ENDPOINTS.LEADERBOARD resolves.
// rbac-scope-enforced-in-handler: per-verb auth enforced within handler
export const GET = withProviders(eventIdGET);