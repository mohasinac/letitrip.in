/**
 * Common Validation Utilities
 * Reusable validation schemas and functions
 */

import { z } from "zod";

/**
 * Common validation schemas
 */
export const commonSchemas = {
  // Email validation
  email: z.string().email("Invalid email address"),

  // Phone number validation (international format)
  phoneNumber: z
    .string()
    .regex(
      /^\+[1-9]\d{1,14}$/,
      "Invalid phone number format. Use international format (+1234567890)",
    ),

  // URL validation
  url: z.string().url("Invalid URL format"),

  // UUID validation
  uuid: z.string().uuid("Invalid UUID format"),

  // Date validation
  isoDate: z.string().datetime("Invalid ISO date format"),

  // Pagination
  pagination: z.object({
    page: z.number().int().positive().default(1),
    limit: z.number().int().positive().max(100).default(10),
  }),

  // Search
  search: z.object({
    query: z.string().min(1).max(200),
    fields: z.array(z.string()).optional(),
  }),

  // ID parameter
  id: z.string().min(1, "ID is required"),

  // Password
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),

  // Username
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be at most 20 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores",
    ),

  // Name
  name: z.string().min(2, "Name must be at least 2 characters").max(50),

  // Description
  description: z
    .string()
    .max(1000, "Description must be at most 1000 characters"),
};

/**
 * Query parameter parser
 */
export function parseQueryParams<T extends z.ZodSchema>(
  url: string,
  schema: T,
): z.infer<T> {
  const { searchParams } = new URL(url);
  const params: Record<string, any> = {};

  searchParams.forEach((value, key) => {
    // Try to parse as JSON first
    try {
      params[key] = JSON.parse(value);
    } catch {
      // If not JSON, use as string
      params[key] = value;
    }
  });

  return schema.parse(params);
}

/**
 * Body parser with validation
 */
export async function parseBody<T extends z.ZodSchema>(
  request: Request,
  schema: T,
): Promise<z.infer<T>> {
  const body = await request.json();
  return schema.parse(body);
}

/**
 * File validation
 */
export const fileSchemas = {
  image: z.object({
    name: z.string(),
    type: z.enum(["image/jpeg", "image/png", "image/webp", "image/gif"]),
    size: z.number().max(5 * 1024 * 1024, "Image must be less than 5MB"),
  }),

  document: z.object({
    name: z.string(),
    type: z.enum([
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ]),
    size: z.number().max(10 * 1024 * 1024, "Document must be less than 10MB"),
  }),
};

/**
 * Sanitization utilities
 */
export const sanitize = {
  // Remove HTML tags
  stripHtml: (str: string): string => {
    return str.replace(/<[^>]*>/g, "");
  },

  // Trim and normalize whitespace
  normalizeWhitespace: (str: string): string => {
    return str.trim().replace(/\s+/g, " ");
  },

  // Sanitize filename
  sanitizeFilename: (filename: string): string => {
    return filename
      .replace(/[^a-zA-Z0-9.-]/g, "_")
      .replace(/_{2,}/g, "_")
      .toLowerCase();
  },
};
