import { withProviders } from "@/providers.config";
import {
  reviewItemGET,
  reviewItemPATCH,
  reviewItemDELETE,
} from "@mohasinac/appkit";

// audit-route-schema-ok: pending-bespoke-schema
// rbac-public: public read endpoint — Firestore rules + payload schema enforce visibility
export const GET = withProviders(reviewItemGET);
// audit-route-schema-ok: pending-bespoke-schema
// rbac-public: public read endpoint — Firestore rules + payload schema enforce visibility
export const PATCH = withProviders(reviewItemPATCH);
// audit-route-schema-ok: pending-bespoke-schema
// rbac-public: public read endpoint — Firestore rules + payload schema enforce visibility
export const DELETE = withProviders(reviewItemDELETE);
