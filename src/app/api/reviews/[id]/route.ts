import { withProviders } from "@/providers.config";
import {
  reviewItemGET,
  reviewItemPATCH,
  reviewItemDELETE,
} from "@mohasinac/appkit";

// rbac-public: public read endpoint — Firestore rules + payload schema enforce visibility
export const GET = withProviders(reviewItemGET);
// rbac-public: public read endpoint — Firestore rules + payload schema enforce visibility
export const PATCH = withProviders(reviewItemPATCH);
// rbac-public: public read endpoint — Firestore rules + payload schema enforce visibility
export const DELETE = withProviders(reviewItemDELETE);
