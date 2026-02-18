/**
 * API Request Helpers
 *
 * Shared utilities for API route request parsing and session extraction.
 */

import { NextRequest } from "next/server";
import { ERROR_MESSAGES } from "@/constants";
import { AuthenticationError } from "@/lib/errors";

export function getSearchParams(request: NextRequest): URLSearchParams {
  return new URL(request.url).searchParams;
}

export function getOptionalSessionCookie(
  request: NextRequest,
): string | undefined {
  return request.cookies.get("__session")?.value;
}

export function getRequiredSessionCookie(request: NextRequest): string {
  const sessionCookie = getOptionalSessionCookie(request);

  if (!sessionCookie) {
    throw new AuthenticationError(ERROR_MESSAGES.AUTH.UNAUTHORIZED);
  }

  return sessionCookie;
}

export function getBooleanParam(
  searchParams: URLSearchParams,
  key: string,
): boolean | undefined {
  const value = searchParams.get(key);
  if (value === null) {
    return undefined;
  }

  return value === "true";
}

export function getStringParam(
  searchParams: URLSearchParams,
  key: string,
): string | undefined {
  const value = searchParams.get(key);
  if (!value) {
    return undefined;
  }

  return value;
}

export function getNumberParam(
  searchParams: URLSearchParams,
  key: string,
  fallback: number,
  options?: { min?: number; max?: number },
): number {
  const rawValue = searchParams.get(key);
  const parsed = rawValue ? Number.parseInt(rawValue, 10) : fallback;
  const safeValue = Number.isNaN(parsed) ? fallback : parsed;

  if (typeof options?.min === "number" && safeValue < options.min) {
    return options.min;
  }

  if (typeof options?.max === "number" && safeValue > options.max) {
    return options.max;
  }

  return safeValue;
}
