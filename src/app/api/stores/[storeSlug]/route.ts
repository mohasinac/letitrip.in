import { initProviders } from "@/providers.config";

// rbac-scope-enforced-in-handler: per-verb auth enforced within handler
export async function GET(
  ...args: Parameters<typeof import("@mohasinac/appkit").storeSlugGET>
) {
  await initProviders();
  const { storeSlugGET } = await import("@mohasinac/appkit");
  return storeSlugGET(...args);
}
