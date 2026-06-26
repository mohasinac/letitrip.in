import { initProviders } from "@/providers.config";

// rbac-scope-enforced-in-handler: per-verb auth enforced within handler
export async function GET(
  ...args: Parameters<typeof import("@mohasinac/appkit").storeReviewsGET>
) {
  await initProviders();
  const { storeReviewsGET } = await import("@mohasinac/appkit");
  return storeReviewsGET(...args);
}
