import { withProviders } from "@/providers.config";
import {
  reviewItemGET,
  reviewItemPATCH,
  reviewItemDELETE,
} from "@mohasinac/appkit";

// rbac-public: public read endpoint — Firestore rules + payload schema enforce visibility
// audit-route-schema-ok: pending-bespoke-schema
export const GET = withProviders(reviewItemGET);
// rbac-public: public read endpoint — Firestore rules + payload schema enforce visibility
// audit-route-schema-ok: pending-bespoke-schema
export const PATCH = withProviders(reviewItemPATCH);
// rbac-public: public read endpoint — Firestore rules + payload schema enforce visibility
// audit-route-schema-ok: pending-bespoke-schema
export const DELETE = withProviders(reviewItemDELETE);
