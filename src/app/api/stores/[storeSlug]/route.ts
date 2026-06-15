import { initProviders } from "@/providers.config";

// rbac-public: public read endpoint — Firestore rules + payload schema enforce visibility
// audit-route-schema-ok: pending-bespoke-schema
export async function GET(
  ...args: Parameters<typeof import("@mohasinac/appkit").storeSlugGET>
) {
  await initProviders();
  const { storeSlugGET } = await import("@mohasinac/appkit");
  return storeSlugGET(...args);
}

