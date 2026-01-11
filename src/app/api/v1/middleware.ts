import { NextResponse } from "next/server";

/**
 * API Version Middleware
 *
 * Adds version information to API responses and handles version-specific logic.
 *
 * Usage:
 * ```ts
 * import { withApiVersion } from "@/app/api/v1/middleware";
 *
 * export async function GET(request: Request) {
 *   return withApiVersion(async () => {
 *     // Your API logic here
 *     return NextResponse.json({ data: "..." });
 *   });
 * }
 * ```
 */

export interface ApiVersionConfig {
  version: string;
  deprecationDate?: string;
  sunsetDate?: string;
}

const VERSION_CONFIG: ApiVersionConfig = {
  version: "1.0.0",
  // deprecationDate: "2026-06-01", // When v1 will be deprecated
  // sunsetDate: "2026-12-01", // When v1 will be removed
};

/**
 * Wraps API route handler with version metadata
 *
 * @param handler - The API route handler function
 * @param config - Version configuration (optional)
 * @returns Enhanced response with version headers
 */
export async function withApiVersion(
  handler: () => Promise<NextResponse>,
  config: Partial<ApiVersionConfig> = {}
): Promise<NextResponse> {
  try {
    const response = await handler();

    // Add version headers
    response.headers.set(
      "X-API-Version",
      config.version || VERSION_CONFIG.version
    );

    // Add deprecation warning if configured
    if (config.deprecationDate || VERSION_CONFIG.deprecationDate) {
      const deprecationDate =
        config.deprecationDate || VERSION_CONFIG.deprecationDate;
      response.headers.set("Deprecation", `date="${deprecationDate}"`);
      response.headers.set("Link", '</api/v2>; rel="successor-version"');
    }

    // Add sunset warning if configured
    if (config.sunsetDate || VERSION_CONFIG.sunsetDate) {
      const sunsetDate = config.sunsetDate || VERSION_CONFIG.sunsetDate;
      response.headers.set("Sunset", sunsetDate);
    }

    return response;
  } catch (error) {
    // Return error with version info
    const errorResponse = NextResponse.json(
      {
        error: "Internal server error",
        version: config.version || VERSION_CONFIG.version,
      },
      { status: 500 }
    );

    errorResponse.headers.set(
      "X-API-Version",
      config.version || VERSION_CONFIG.version
    );

    return errorResponse;
  }
}

/**
 * Validates API version in request
 *
 * @param request - The incoming request
 * @param supportedVersions - Array of supported version strings
 * @returns True if version is supported, false otherwise
 */
export function validateApiVersion(
  request: Request,
  supportedVersions: string[] = ["v1"]
): boolean {
  const acceptVersion = request.headers.get("Accept-Version");

  if (!acceptVersion) {
    // No version specified, allow (defaults to latest)
    return true;
  }

  return supportedVersions.includes(acceptVersion);
}

/**
 * Creates versioned API error response
 *
 * @param message - Error message
 * @param status - HTTP status code
 * @param version - API version
 * @returns JSON error response with version info
 */
export function versionedErrorResponse(
  message: string,
  status: number = 400,
  version: string = VERSION_CONFIG.version
): NextResponse {
  const response = NextResponse.json(
    {
      error: message,
      version,
      timestamp: new Date().toISOString(),
    },
    { status }
  );

  response.headers.set("X-API-Version", version);

  return response;
}
