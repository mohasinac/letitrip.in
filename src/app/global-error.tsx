"use client";

/**
 * Global Error Handler — Root layout error boundary
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/error#global-errorjs
 *
 * Route-level wrapper for the centralized appkit GlobalError component.
 */
import { GlobalError } from "@mohasinac/appkit/client";

export default function AppGlobalError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	return <GlobalError error={error} reset={reset} />;
}

