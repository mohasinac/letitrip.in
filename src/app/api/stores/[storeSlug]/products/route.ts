import { initProviders } from "@/providers.config";

export async function GET(
  ...args: Parameters<typeof import("@mohasinac/appkit").storeProductsGET>
) {
  await initProviders();
  const { storeProductsGET } = await import("@mohasinac/appkit");
  return storeProductsGET(...args);
}

