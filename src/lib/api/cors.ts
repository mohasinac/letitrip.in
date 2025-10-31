/**
 * CORS Configuration
 * Centralized CORS settings for all API routes
 */

import { NextRequest } from "next/server";

/**
 * Allowed origins based on environment
 */
const getAllowedOrigins = (): string[] => {
  const env = process.env.NODE_ENV;

  if (env === "development") {
    return [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://127.0.0.1:3000",
    ];
  }

  // Production origins
  return [
    process.env.NEXT_PUBLIC_APP_URL || "",
    process.env.NEXT_PUBLIC_SITE_URL || "",
    "https://www.hobbiesspot.com",
    "https://hobbiesspot.com",
  ].filter(Boolean);
};

/**
 * CORS Headers Configuration
 */
export const getCorsHeaders = (origin?: string) => {
  const allowedOrigins = getAllowedOrigins();

  // Check if origin is allowed
  const isAllowed =
    origin &&
    allowedOrigins.some(
      (allowed) => origin.includes(allowed) || allowed === "*",
    );

  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers":
      "Content-Type, Authorization, X-Requested-With, Accept, Origin",
    "Access-Control-Max-Age": "86400", // 24 hours
    "Access-Control-Allow-Credentials": "true",
  };

  // Set origin based on environment
  if (process.env.NODE_ENV === "development") {
    headers["Access-Control-Allow-Origin"] = "*";
  } else {
    headers["Access-Control-Allow-Origin"] = isAllowed
      ? origin!
      : allowedOrigins[0];
  }

  return headers;
};

/**
 * Handle CORS preflight request
 */
export const handleCorsPreFlight = (request: NextRequest) => {
  const origin = request.headers.get("origin");
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(origin || undefined),
  });
};

/**
 * Add CORS headers to response
 */
export const addCorsHeaders = (
  response: Response,
  request: NextRequest,
): Response => {
  const origin = request.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin || undefined);

  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
};
