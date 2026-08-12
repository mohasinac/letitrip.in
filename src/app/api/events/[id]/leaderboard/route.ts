import { withFeatureGuard } from "@/lib/features";
import { withProviders } from "@/providers.config";
import { eventIdGET } from "@mohasinac/appkit";

// Leaderboard is included in the event detail response from eventIdGET.
// This route re-exposes the same handler so EVENT_ENDPOINTS.LEADERBOARD resolves.
// rbac-scope-enforced-in-handler: per-verb auth enforced within handler
const __GET__g = withProviders(eventIdGET);

// rbac-scope-enforced-in-handler: feature-guarded — returns 404 when FEATURE_* disabled
export const GET = withFeatureGuard("EVENTS", __GET__g);
