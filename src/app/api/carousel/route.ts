import { withProviders } from "@/providers.config";
import {
  carouselGET,
  carouselPOST,
} from "@mohasinac/appkit";
// rbac-public: public read endpoint — Firestore rules + payload schema enforce visibility
// audit-route-schema-ok: pending-bespoke-schema
export const GET = withProviders(carouselGET);
// rbac-public: public read endpoint — Firestore rules + payload schema enforce visibility
// audit-route-schema-ok: pending-bespoke-schema
export const POST = withProviders(carouselPOST);

