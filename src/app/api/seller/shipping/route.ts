/**
 * Seller Shipping Configuration API
 *
 * GET  /api/seller/shipping  — Read current shipping config (token redacted)
 * PATCH /api/seller/shipping — Update shipping config:
 *   - Custom method: save fixed price + carrier name
 *   - Shiprocket method: authenticate with Shiprocket credentials, save token,
 *     and optionally register a pickup address (which triggers OTP to seller's phone)
 */

import { z } from "zod";
import { userRepository } from "@/repositories";
import { ValidationError } from "@mohasinac/appkit/errors";
import { successResponse } from "@mohasinac/appkit/next";
import { createApiHandler } from "@mohasinac/appkit/http";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";
import { serverLogger } from "@mohasinac/appkit/monitoring";
import {
  shiprocketAuthenticate,
  shiprocketAddPickupLocation,
  SHIPROCKET_TOKEN_TTL_MS,
} from "@/lib/shiprocket/client";
import type { SellerShippingConfig } from "@/db/schema";

// ─── Schemas ────────────────────────────────────────────────────────────────

const pickupAddressSchema = z.object({
  locationName: z.string().min(2).max(40),
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().min(10).max(15),
  address: z.string().min(5).max(200),
  address2: z.string().max(200).optional().or(z.literal("")),
  city: z.string().min(2).max(80),
  state: z.string().min(2).max(80),
  pincode: z.string().regex(/^\d{6}$/, "Pincode must be 6 digits"),
  country: z.string().default("India"),
});

const updateShippingSchema = z.discriminatedUnion("method", [
  z.object({
    method: z.literal("custom"),
    customShippingPrice: z.number().min(0),
    customCarrierName: z.string().min(1).max(80),
  }),
  z.object({
    method: z.literal("shiprocket"),
    /** Present only on initial connect / token refresh */
    shiprocketCredentials: z
      .object({
        email: z.string().email(),
        password: z.string().min(1),
      })
      .optional(),
    /** If provided, we register this address in Shiprocket (triggers OTP) */
    pickupAddress: pickupAddressSchema.optional(),
  }),
]);

// ─── Helper: strip server-only fields before sending to client ───────────────

function sanitiseConfig(config: SellerShippingConfig | undefined): Omit<
  SellerShippingConfig,
  "shiprocketToken" | "shiprocketTokenExpiry"
> & {
  shiprocketTokenExpiry?: string;
  isTokenValid?: boolean;
} {
  if (!config) {
    return {
      method: "custom",
      isConfigured: false,
      isTokenValid: false,
    };
  }
  const { shiprocketToken, shiprocketTokenExpiry, ...rest } = config;
  return {
    ...rest,
    shiprocketTokenExpiry: shiprocketTokenExpiry?.toISOString(),
    isTokenValid: shiprocketToken
      ? new Date() < new Date(shiprocketTokenExpiry ?? 0)
      : false,
  };
}

// ─── GET ─────────────────────────────────────────────────────────────────────

export const GET = createApiHandler({
  auth: true,
  roles: ["seller", "admin"],
  handler: async ({ user }) => {
    return successResponse({
      shippingConfig: sanitiseConfig(user!.shippingConfig),
    });
  },
});

// ─── PATCH ────────────────────────────────────────────────────────────────────

export const PATCH = createApiHandler<(typeof updateShippingSchema)["_output"]>(
  {
    auth: true,
    roles: ["seller", "admin"],
    schema: updateShippingSchema,
    handler: async ({ user, body }) => {
      const data = body!;
      let config: SellerShippingConfig;
      let otpPending = false;
      let newPickupLocationId: number | undefined;

      if (data.method === "custom") {
        config = {
          method: "custom",
          customShippingPrice: data.customShippingPrice,
          customCarrierName: data.customCarrierName,
          isConfigured: true,
        };
      } else {
        // ── Shiprocket method ──────────────────────────────────────────────────
        const existing = user!.shippingConfig;
        let token = existing?.shiprocketToken;
        let tokenExpiry = existing?.shiprocketTokenExpiry;
        const existingEmail = existing?.shiprocketEmail;

        // Re-authenticate if credentials supplied or token is missing/expired
        if (
          data.shiprocketCredentials ||
          !token ||
          (tokenExpiry && new Date() >= new Date(tokenExpiry))
        ) {
          if (!data.shiprocketCredentials) {
            throw new ValidationError(
              ERROR_MESSAGES.SHIPPING.SHIPROCKET_CREDS_REQUIRED,
            );
          }

          serverLogger.info("Authenticating with Shiprocket", {
            uid: user!.uid,
            email: data.shiprocketCredentials.email,
          });

          const authResult = await shiprocketAuthenticate({
            email: data.shiprocketCredentials.email,
            password: data.shiprocketCredentials.password,
          }).catch((err: Error) => {
            throw new ValidationError(
              `${ERROR_MESSAGES.SHIPPING.SHIPROCKET_AUTH_FAILED}: ${err.message}`,
            );
          });

          token = authResult.token;
          tokenExpiry = new Date(Date.now() + SHIPROCKET_TOKEN_TTL_MS);
          tokenExpiry = new Date(tokenExpiry);
        }

        const shiprocketEmail =
          data.shiprocketCredentials?.email ?? existingEmail ?? "";

        config = {
          method: "shiprocket",
          shiprocketEmail,
          shiprocketToken: token,
          shiprocketTokenExpiry: tokenExpiry,
          pickupAddress: existing?.pickupAddress,
          isConfigured: Boolean(existing?.pickupAddress?.isVerified),
        };

        // Register new pickup address → triggers OTP
        if (data.pickupAddress && token) {
          serverLogger.info("Registering Shiprocket pickup address", {
            uid: user!.uid,
            location: data.pickupAddress.locationName,
          });

          const pickupResult = await shiprocketAddPickupLocation(token, {
            pickup_location: data.pickupAddress.locationName,
            name: data.pickupAddress.name,
            email: data.pickupAddress.email,
            phone: data.pickupAddress.phone,
            address: data.pickupAddress.address,
            address_2: data.pickupAddress.address2 ?? "",
            city: data.pickupAddress.city,
            state: data.pickupAddress.state,
            country: data.pickupAddress.country || "India",
            pin_code: data.pickupAddress.pincode,
          }).catch((err: Error) => {
            throw new ValidationError(
              `${ERROR_MESSAGES.SHIPPING.PICKUP_ADD_FAILED}: ${err.message}`,
            );
          });

          newPickupLocationId = pickupResult.address?.pickup_location_id;
          otpPending = true;

          config.pickupAddress = {
            ...data.pickupAddress,
            isVerified: false,
            shiprocketAddressId: newPickupLocationId,
          };
          config.isConfigured = false; // Not yet verified
        }
      }

      await userRepository.update(user!.uid, { shippingConfig: config });

      const message = otpPending
        ? SUCCESS_MESSAGES.SHIPPING.PICKUP_OTP_SENT
        : SUCCESS_MESSAGES.SHIPPING.UPDATED;

      serverLogger.info("Seller shipping config updated", {
        uid: user!.uid,
        method: config.method,
        isConfigured: config.isConfigured,
        otpPending,
      });

      return successResponse(
        {
          shippingConfig: sanitiseConfig(config),
          otpPending,
          pickupLocationId: newPickupLocationId,
        },
        message,
      );
    },
  },
);

