import { initProviders } from "@/providers.config";

export async function GET(
  ...args: Parameters<typeof import("@mohasinac/appkit").storeSlugGET>
) {
  await initProviders();
  const { storeSlugGET } = await import("@mohasinac/appkit");
  return storeSlugGET(...args);
}

