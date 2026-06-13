import { withProviders } from "@/providers.config";
import {
  categoryItemGET,
  categoryItemPATCH,
  categoryItemDELETE,
} from "@mohasinac/appkit";

// rbac-public: public read endpoint — Firestore rules + payload schema enforce visibility
export const GET = withProviders(categoryItemGET);
// rbac-public: public read endpoint — Firestore rules + payload schema enforce visibility
export const PATCH = withProviders(categoryItemPATCH);
// rbac-public: public read endpoint — Firestore rules + payload schema enforce visibility
export const DELETE = withProviders(categoryItemDELETE);
