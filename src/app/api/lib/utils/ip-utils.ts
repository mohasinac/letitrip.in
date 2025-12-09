/**
 * IP Utility Functions
 *
 * Extracts client IP address from Next.js requests
 */

import { NextRequest } from "next/server";

/**
 * Get the client's IP address from the request
 *
 * Checks in order:
 * 1. x-forwarded-for header (takes first IP if multiple)
 * 2. x-real-ip header
 * 3. Returns "unknown" if no IP found
 *
 * @param req Next.js request object
 * @returns Client IP address or "unknown"
 */
export function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");

  if (forwarded) {
    // x-forwarded-for may contain multiple IPs, take the first one
    return forwarded.split(",")[0].trim();
  }

  const realIp = req.headers.get("x-real-ip");

  return realIp || "unknown";
}

/**
 * Get all forwarded IPs from the request
 *
 * @param req Next.js request object
 * @returns Array of IP addresses (empty if none found)
 */
export function getAllForwardedIps(req: NextRequest): string[] {
  const forwarded = req.headers.get("x-forwarded-for");

  if (!forwarded) {
    return [];
  }

  return forwarded.split(",").map((ip) => ip.trim());
}

/**
 * Check if IP address is from a private network
 *
 * @param ip IP address to check
 * @returns true if IP is private, false otherwise
 */
export function isPrivateIp(ip: string): boolean {
  if (ip === "unknown") {
    return false;
  }

  // Private IP ranges (IPv4)
  const privateRanges = [
    /^10\./, // 10.0.0.0/8
    /^172\.(1[6-9]|2\d|3[01])\./, // 172.16.0.0/12
    /^192\.168\./, // 192.168.0.0/16
    /^127\./, // 127.0.0.0/8 (localhost)
    /^169\.254\./, // 169.254.0.0/16 (link-local)
    /^::1$/, // ::1 (IPv6 localhost)
    /^fc00:/, // fc00::/7 (IPv6 unique local)
    /^fe80:/, // fe80::/10 (IPv6 link-local)
  ];

  return privateRanges.some((range) => range.test(ip));
}
