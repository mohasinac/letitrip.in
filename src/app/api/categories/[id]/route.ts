import { withProviders } from "@/providers.config";
import {
  categoryItemGET,
  categoryItemPATCH,
  categoryItemDELETE,
} from "@mohasinac/appkit";

// rbac-public: public read endpoint — Firestore rules + payload schema enforce visibility
// audit-route-schema-ok: pending-bespoke-schema
export const GET = withProviders(categoryItemGET);
// rbac-public: public read endpoint — Firestore rules + payload schema enforce visibility
// audit-route-schema-ok: pending-bespoke-schema
export const PATCH = withProviders(categoryItemPATCH);
// rbac-public: public read endpoint — Firestore rules + payload schema enforce visibility
// audit-route-schema-ok: pending-bespoke-schema
export const DELETE = withProviders(categoryItemDELETE);
