import { withProviders } from "@/providers.config";
import {
  productItemGET,
  productItemPATCH,
  productItemDELETE,
} from "@mohasinac/appkit";

// rbac-public: public read endpoint — Firestore rules + payload schema enforce visibility
export const GET = withProviders(productItemGET);
// rbac-public: public read endpoint — Firestore rules + payload schema enforce visibility
export const PATCH = withProviders(productItemPATCH);
// rbac-public: public read endpoint — Firestore rules + payload schema enforce visibility
export const DELETE = withProviders(productItemDELETE);
