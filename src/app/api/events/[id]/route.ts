import { withProviders } from "@/providers.config";
import { eventIdGET } from "@mohasinac/appkit";

// rbac-public: public read endpoint — Firestore rules + payload schema enforce visibility
// audit-route-schema-ok: pending-bespoke-schema
export const GET = withProviders(eventIdGET);
