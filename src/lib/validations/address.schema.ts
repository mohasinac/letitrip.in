import { z } from "zod";

// Address validation schema
export const addressSchema = z.object({
  fullName: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name must be less than 100 characters"),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Invalid Indian phone number"),
  line1: z
    .string()
    .min(5, "Address line 1 must be at least 5 characters")
    .max(100, "Address line 1 must be less than 100 characters"),
  line2: z
    .string()
    .max(100, "Address line 2 must be less than 100 characters")
    .optional(),
  city: z
    .string()
    .min(2, "City must be at least 2 characters")
    .max(50, "City must be less than 50 characters"),
  state: z
    .string()
    .min(2, "State must be at least 2 characters")
    .max(50, "State must be less than 50 characters"),
  pincode: z.string().regex(/^\d{6}$/, "Pincode must be 6 digits"),
  country: z.string().min(2, "Country is required").default("India"),
  type: z.enum(["home", "work", "other"], {
    message: "Please select a valid address type",
  }),
  isDefault: z.boolean().default(false),
  landmark: z
    .string()
    .max(100, "Landmark must be less than 100 characters")
    .optional(),
});

export type AddressFormData = z.infer<typeof addressSchema>;
