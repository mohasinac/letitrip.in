import { withProviders } from "@/providers.config";
import { categoriesGET, POST as categoriesPOST } from "@mohasinac/appkit";

// rbac-public: public read endpoint — Firestore rules + payload schema enforce visibility
// audit-route-schema-ok: pending-bespoke-schema
export const GET = withProviders(categoriesGET);
// rbac-public: public read endpoint — Firestore rules + payload schema enforce visibility
// audit-route-schema-ok: pending-bespoke-schema
export const POST = withProviders(categoriesPOST);
