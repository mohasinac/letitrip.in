import { initProviders } from "@/providers.config";

export async function GET(
  ...args: Parameters<typeof import("@mohasinac/appkit/features/stores/server").storeSlugGET>
) {
  await initProviders();
  const { storeSlugGET } = await import("@mohasinac/appkit/features/stores/server");
  return storeSlugGET(...args);
}

