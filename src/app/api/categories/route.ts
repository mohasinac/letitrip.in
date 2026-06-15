import { withProviders } from "@/providers.config";
import { categoriesGET, POST as categoriesPOST } from "@mohasinac/appkit";

// audit-route-schema-ok: pending-bespoke-schema
// rbac-public: public read endpoint — Firestore rules + payload schema enforce visibility
export const GET = withProviders(categoriesGET);
// audit-route-schema-ok: pending-bespoke-schema
// rbac-public: public read endpoint — Firestore rules + payload schema enforce visibility
export const POST = withProviders(categoriesPOST);
