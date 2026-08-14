export interface RuntimeRequestContext {
  sameOrigin: boolean;
  request?: {
    headers: {
      get(name: string): string | null;
    };
  };
  url: {
    pathname: string;
  };
}

export function isSameOriginApiRequest({
  sameOrigin,
  url: { pathname },
}: RuntimeRequestContext): boolean {
  // audit-hardcoded-api-routes-ok: generic path-prefix check, not an endpoint reference
  return sameOrigin && pathname.startsWith("/api/");
}

export function isSameOriginRscRequest({
  request,
  sameOrigin,
  url: { pathname },
}: RuntimeRequestContext): boolean {
  return (
    sameOrigin &&
    // audit-hardcoded-api-routes-ok: generic path-prefix check, not an endpoint reference
    !pathname.startsWith("/api/") &&
    request?.headers.get("RSC") === "1"
  );
}

export function isSameOriginHtmlRequest({
  request,
  sameOrigin,
  url: { pathname },
}: RuntimeRequestContext): boolean {
  return (
    sameOrigin &&
    // audit-hardcoded-api-routes-ok: generic path-prefix check, not an endpoint reference
    !pathname.startsWith("/api/") &&
    request?.headers.get("Content-Type")?.includes("text/html") === true
  );
}

export const LEGACY_RUNTIME_CACHE_NAMES = [
  "next-static-js-assets",
  "static-js-assets",
  "static-style-assets",
  "next-data",
  "static-data-assets",
  "apis",
  "pages-rsc-prefetch",
  "pages-rsc",
  "pages",
  "others",
  "cross-origin",
];

