import { initProviders } from "@/providers.config";

export async function GET(...args: Parameters<typeof import("@mohasinac/appkit/features/blog/server").GET>) {
	await initProviders();
	const { GET } = await import("@mohasinac/appkit/features/blog/server");
	return GET(...args);
}
