import { initProviders } from "@/providers.config";

export async function GET(
  ...args: Parameters<typeof import("@mohasinac/appkit/server").storeReviewsGET>
) {
  await initProviders();
  const { storeReviewsGET } = await import("@mohasinac/appkit/server");
  return storeReviewsGET(...args);
}

