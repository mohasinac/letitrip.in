import {
  isSameOriginApiRequest,
  isSameOriginHtmlRequest,
  isSameOriginRscRequest,
  LEGACY_RUNTIME_CACHE_NAMES,
} from "../runtime-caching-rules";

function createHeaders(headers: Record<string, string>) {
  return {
    get(name: string) {
      return headers[name] ?? null;
    },
  };
}

describe("runtime caching rules", () => {
  it("matches same-origin API requests", () => {
    expect(
      isSameOriginApiRequest({
        sameOrigin: true,
        url: { pathname: "/api/site-settings" },
      }),
    ).toBe(true);

    expect(
      isSameOriginApiRequest({
        sameOrigin: false,
        url: { pathname: "/api/site-settings" },
      }),
    ).toBe(false);
  });

  it("matches same-origin RSC requests and excludes APIs", () => {
    expect(
      isSameOriginRscRequest({
        sameOrigin: true,
        request: { headers: createHeaders({ RSC: "1" }) },
        url: { pathname: "/en/auth/login" },
      }),
    ).toBe(true);

    expect(
      isSameOriginRscRequest({
        sameOrigin: true,
        request: { headers: createHeaders({ RSC: "1" }) },
        url: { pathname: "/api/events" },
      }),
    ).toBe(false);
  });

  it("matches same-origin HTML requests and keeps legacy cache cleanup names", () => {
    expect(
      isSameOriginHtmlRequest({
        sameOrigin: true,
        request: {
          headers: createHeaders({
            "Content-Type": "text/html; charset=utf-8",
          }),
        },
        url: { pathname: "/en/auth/login" },
      }),
    ).toBe(true);

    expect(LEGACY_RUNTIME_CACHE_NAMES).toEqual(
      expect.arrayContaining([
        "next-static-js-assets",
        "apis",
        "pages-rsc",
        "pages",
      ]),
    );
  });
});
