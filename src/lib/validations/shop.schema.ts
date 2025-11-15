import { z } from "zod";

// Shop validation schema
export const shopSchema = z.object({
  name: z
    .string()
    .min(3, "Shop name must be at least 3 characters")
    .max(100, "Shop name must be less than 100 characters"),
  slug: z
    .string()
    .min(3, "Slug must be at least 3 characters")
    .max(100, "Slug must be less than 100 characters")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug can only contain lowercase letters, numbers, and hyphens"
    ),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(1000, "Description must be less than 1000 characters"),
  logo: z.string().url("Invalid logo URL").optional(),
  banner: z.string().url("Invalid banner URL").optional(),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Invalid Indian phone number")
    .optional(),
  email: z.string().email("Invalid email address").optional(),
  address: z
    .object({
      line1: z.string().min(5, "Address is too short"),
      line2: z.string().optional(),
      city: z.string().min(2, "City is required"),
      state: z.string().min(2, "State is required"),
      pincode: z.string().regex(/^\d{6}$/, "Invalid pincode"),
      country: z.string().default("India"),
    })
    .optional(),
  policies: z
    .object({
      shipping: z.string().optional(),
      returns: z.string().optional(),
      privacy: z.string().optional(),
    })
    .optional(),
  isActive: z.boolean().default(true),
  isVerified: z.boolean().default(false),
});

export type ShopFormData = z.infer<typeof shopSchema>;
