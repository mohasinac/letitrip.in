import { withProviders } from "@/providers.config";
import { eventIdGET } from "@mohasinac/appkit";

// Leaderboard is included in the event detail response from eventIdGET.
// This route re-exposes the same handler so EVENT_ENDPOINTS.LEADERBOARD resolves.
// rbac-public: public read endpoint — Firestore rules + payload schema enforce visibility
export const GET = withProviders(eventIdGET);
