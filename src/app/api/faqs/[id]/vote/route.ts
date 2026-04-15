import { initProviders } from "@/providers.config";

export async function GET(...args: Parameters<typeof import("@mohasinac/appkit/features/events/server").GET>) {
	await initProviders();
	const { GET } = await import("@mohasinac/appkit/features/events/server");
	return GET(...args);
}
