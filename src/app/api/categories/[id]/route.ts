import { withProviders } from "@/providers.config";
import {
  categoryItemGET,
  categoryItemPATCH,
  categoryItemDELETE,
} from "@mohasinac/appkit";

// audit-route-schema-ok: pending-bespoke-schema
// rbac-public: public read endpoint — Firestore rules + payload schema enforce visibility
export const GET = withProviders(categoryItemGET);
// audit-route-schema-ok: pending-bespoke-schema
// rbac-public: public read endpoint — Firestore rules + payload schema enforce visibility
export const PATCH = withProviders(categoryItemPATCH);
// audit-route-schema-ok: pending-bespoke-schema
// rbac-public: public read endpoint — Firestore rules + payload schema enforce visibility
export const DELETE = withProviders(categoryItemDELETE);
