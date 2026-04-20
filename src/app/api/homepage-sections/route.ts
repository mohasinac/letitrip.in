import { initProviders } from "@/providers.config";

export async function GET(...args: Parameters<typeof import("@mohasinac/appkit").GET>) {
  await initProviders();
  const { GET } = await import("@mohasinac/appkit");
  return GET(...args);
}

export async function POST(...args: Parameters<typeof import("@mohasinac/appkit").POST>) {
  await initProviders();
  const { POST } = await import("@mohasinac/appkit");
  return POST(...args);
}

