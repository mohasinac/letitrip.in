import { initProviders } from "@/providers.config";

export async function GET(
  ...args: Parameters<typeof import("@mohasinac/appkit/server").storeAuctionsGET>
) {
  await initProviders();
  const { storeAuctionsGET } = await import("@mohasinac/appkit/server");
  return storeAuctionsGET(...args);
}

