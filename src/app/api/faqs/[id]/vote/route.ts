import { initProviders } from "@/providers.config";

export async function GET(...args: Parameters<typeof import("@mohasinac/appkit/server").GET>) {
	await initProviders();
	const { GET } = await import("@mohasinac/appkit/server");
	return GET(...args);
}
