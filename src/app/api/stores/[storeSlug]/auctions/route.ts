import { initProviders } from "@/providers.config";

export async function GET(
  ...args: Parameters<typeof import("@mohasinac/appkit/features/stores/server").storeAuctionsGET>
) {
  await initProviders();
  const { storeAuctionsGET } = await import("@mohasinac/appkit/features/stores/server");
  return storeAuctionsGET(...args);
}

