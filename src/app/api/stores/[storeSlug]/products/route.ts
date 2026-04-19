import { initProviders } from "@/providers.config";

export async function GET(
  ...args: Parameters<typeof import("@mohasinac/appkit/server").storeProductsGET>
) {
  await initProviders();
  const { storeProductsGET } = await import("@mohasinac/appkit/server");
  return storeProductsGET(...args);
}

