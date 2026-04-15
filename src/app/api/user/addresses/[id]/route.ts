import { initProviders } from "@/providers.config";

export async function GET(...args: Parameters<typeof import("@mohasinac/appkit/features/stores/server").GET>) {
	await initProviders();
	const { GET } = await import("@mohasinac/appkit/features/stores/server");
	return GET(...args);
}
