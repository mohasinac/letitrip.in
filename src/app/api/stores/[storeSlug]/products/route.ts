import { initProviders } from "@/providers.config";

export async function GET(
  ...args: Parameters<typeof import("@mohasinac/appkit/features/stores/server").storeProductsGET>
) {
  await initProviders();
  const { storeProductsGET } = await import("@mohasinac/appkit/features/stores/server");
  return storeProductsGET(...args);
}

