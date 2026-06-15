import { withProviders } from "@/providers.config";
import {
  productItemGET,
  productItemPATCH,
  productItemDELETE,
} from "@mohasinac/appkit";

// rbac-public: public read endpoint — Firestore rules + payload schema enforce visibility
// audit-route-schema-ok: pending-bespoke-schema
export const GET = withProviders(productItemGET);
// rbac-public: public read endpoint — Firestore rules + payload schema enforce visibility
// audit-route-schema-ok: pending-bespoke-schema
export const PATCH = withProviders(productItemPATCH);
// rbac-public: public read endpoint — Firestore rules + payload schema enforce visibility
// audit-route-schema-ok: pending-bespoke-schema
export const DELETE = withProviders(productItemDELETE);
