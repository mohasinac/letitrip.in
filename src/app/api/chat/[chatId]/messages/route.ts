import { initProviders } from "@/providers.config";

export async function GET(...args: Parameters<typeof import("@mohasinac/appkit/features/categories/server").GET>) {
  await initProviders();
  const { GET } = await import("@mohasinac/appkit/features/categories/server");
  return GET(...args);
}

export async function POST(...args: Parameters<typeof import("@mohasinac/appkit/features/categories/server").POST>) {
  await initProviders();
  const { POST } = await import("@mohasinac/appkit/features/categories/server");
  return POST(...args);
}
