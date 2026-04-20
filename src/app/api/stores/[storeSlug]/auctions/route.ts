import { initProviders } from "@/providers.config";

export async function GET(
  ...args: Parameters<typeof import("@mohasinac/appkit").storeAuctionsGET>
) {
  await initProviders();
  const { storeAuctionsGET } = await import("@mohasinac/appkit");
  return storeAuctionsGET(...args);
}

