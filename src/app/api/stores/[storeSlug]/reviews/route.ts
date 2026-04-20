import { initProviders } from "@/providers.config";

export async function GET(
  ...args: Parameters<typeof import("@mohasinac/appkit").storeReviewsGET>
) {
  await initProviders();
  const { storeReviewsGET } = await import("@mohasinac/appkit");
  return storeReviewsGET(...args);
}

