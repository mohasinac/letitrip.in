import { initProviders } from "@/providers.config";
import { blogGET, serverLogger } from "@mohasinac/appkit";

function isMissingFirestoreIndexError(error: unknown): boolean {
	const message = error instanceof Error ? error.message : String(error);
	return (
		message.includes("FAILED_PRECONDITION") &&
		message.includes("requires an index")
	);
}

export async function GET(
	...args: Parameters<typeof blogGET>
) {
	await initProviders();
	const [request] = args as [Request, ...unknown[]];
	const requestUrl = new URL(request.url);
	const hasSearchQuery = Boolean(requestUrl.searchParams.get("q"));

	try {
		const response = await blogGET(...args);

		if (hasSearchQuery && response.status >= 500) {
			const fallbackUrl = new URL(request.url);
			fallbackUrl.searchParams.delete("q");

			serverLogger.warn(
				"Blog search returned server error; retrying without q filter",
				{ url: request.url, status: response.status },
			);

			const fallbackRequest = new Request(fallbackUrl, {
				method: "GET",
				headers: request.headers,
			});
			return blogGET(fallbackRequest as Parameters<typeof blogGET>[0]);
		}

		return response;
	} catch (error) {
		if (hasSearchQuery && isMissingFirestoreIndexError(error)) {
			const fallbackUrl = new URL(request.url);
			fallbackUrl.searchParams.delete("q");

			serverLogger.warn(
				"Blog search query hit missing Firestore index; retrying without q filter",
				{ url: request.url },
			);

			const fallbackRequest = new Request(fallbackUrl, {
				method: "GET",
				headers: request.headers,
			});
			return blogGET(fallbackRequest as Parameters<typeof blogGET>[0]);
		}

		throw error;
	}
}

