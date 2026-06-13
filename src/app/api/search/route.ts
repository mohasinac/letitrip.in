import { withProviders } from "@/providers.config";
import { searchGET } from "@mohasinac/appkit";

// rbac-public: public read endpoint — Firestore rules + payload schema enforce visibility
export const GET = withProviders(searchGET);
