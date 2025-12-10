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

  // Private IP ranges with proper anchoring to prevent partial matches
  const privateRanges = [
    /^10\.\d+\.\d+\.\d+$/, // 10.0.0.0/8
    /^172\.(1[6-9]|2\d|3[01])\.\d+\.\d+$/, // 172.16.0.0/12
    /^192\.168\.\d+\.\d+$/, // 192.168.0.0/16
    /^127\.\d+\.\d+\.\d+$/, // 127.0.0.0/8 (localhost)
    /^169\.254\.\d+\.\d+$/, // 169.254.0.0/16 (link-local)
    /^::1$/, // ::1 (IPv6 localhost)
    /^f[cd][0-9a-f]{2}:[0-9a-f:]+$/i, // fc00::/7 and fd00::/8 (IPv6 unique local)
    /^fe80:[0-9a-f:]+$/i, // fe80::/10 (IPv6 link-local)
  ];

  return privateRanges.some((range) => range.test(ip));
}
