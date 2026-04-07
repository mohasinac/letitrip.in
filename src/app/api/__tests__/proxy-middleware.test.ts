/**
 * @jest-environment node
 */

import { describe, expect, it, jest } from "@jest/globals";
import { NextRequest, NextResponse } from "next/server";

async function loadProxyWithEnv(env: Partial<Record<string, string>>) {
  const originalEnv = {
    CORS_ALLOWED_ORIGINS: process.env.CORS_ALLOWED_ORIGINS,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  };

  process.env.CORS_ALLOWED_ORIGINS = env.CORS_ALLOWED_ORIGINS;
  process.env.NEXT_PUBLIC_APP_URL = env.NEXT_PUBLIC_APP_URL;
  process.env.NEXT_PUBLIC_SITE_URL = env.NEXT_PUBLIC_SITE_URL;

  jest.resetModules();
  jest.doMock("next-intl/middleware", () => ({
    __esModule: true,
    default: jest.fn(() => jest.fn(() => NextResponse.next())),
  }));
  jest.doMock("../../../../src/i18n/routing", () => ({
    routing: {},
  }));

  const module = await import("../../../../proxy");

  return {
    proxy: module.default,
    restore: () => {
      process.env.CORS_ALLOWED_ORIGINS = originalEnv.CORS_ALLOWED_ORIGINS;
      process.env.NEXT_PUBLIC_APP_URL = originalEnv.NEXT_PUBLIC_APP_URL;
      process.env.NEXT_PUBLIC_SITE_URL = originalEnv.NEXT_PUBLIC_SITE_URL;
      jest.resetModules();
      jest.clearAllMocks();
    },
  };
}

describe("proxy CORS handling", () => {
  it("returns 204 preflight with CORS headers for allowed origins", async () => {
    const { proxy, restore } = await loadProxyWithEnv({
      CORS_ALLOWED_ORIGINS: "https://app.example.com",
      NEXT_PUBLIC_APP_URL: "https://site.example.com",
      NEXT_PUBLIC_SITE_URL: "https://site.example.com",
    });

    const request = new NextRequest("https://site.example.com/api/ping", {
      method: "OPTIONS",
      headers: {
        origin: "https://app.example.com",
      },
    });

    const response = proxy(request);

    expect(response.status).toBe(204);
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe(
      "https://app.example.com",
    );
    expect(response.headers.get("Access-Control-Allow-Credentials")).toBe(
      "true",
    );
    expect(response.headers.get("Access-Control-Allow-Methods")).toContain(
      "OPTIONS",
    );

    restore();
  });

  it("returns 403 preflight for disallowed origins", async () => {
    const { proxy, restore } = await loadProxyWithEnv({
      CORS_ALLOWED_ORIGINS: "https://app.example.com",
      NEXT_PUBLIC_APP_URL: "https://site.example.com",
      NEXT_PUBLIC_SITE_URL: "https://site.example.com",
    });

    const request = new NextRequest("https://site.example.com/api/ping", {
      method: "OPTIONS",
      headers: {
        origin: "https://evil.example.com",
      },
    });

    const response = proxy(request);

    expect(response.status).toBe(403);

    restore();
  });

  it("adds CSP for non-API pages", async () => {
    const { proxy, restore } = await loadProxyWithEnv({
      CORS_ALLOWED_ORIGINS: "https://app.example.com",
      NEXT_PUBLIC_APP_URL: "https://site.example.com",
      NEXT_PUBLIC_SITE_URL: "https://site.example.com",
    });

    const request = new NextRequest("https://site.example.com/en/products", {
      method: "GET",
    });

    const response = proxy(request);

    expect(response.headers.get("Content-Security-Policy")).toBeTruthy();

    restore();
  });
});
