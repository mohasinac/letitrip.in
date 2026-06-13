import { withProviders } from "@/providers.config";
import { eventIdGET } from "@mohasinac/appkit";

// rbac-public: public read endpoint — Firestore rules + payload schema enforce visibility
export const GET = withProviders(eventIdGET);
