import { initProviders } from "@/providers.config";

export async function GET(
  ...args: Parameters<typeof import("@mohasinac/appkit/features/stores/server").storeReviewsGET>
) {
  await initProviders();
  const { storeReviewsGET } = await import("@mohasinac/appkit/features/stores/server");
  return storeReviewsGET(...args);
}

