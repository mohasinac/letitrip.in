/**
 * Seller Shipping — Verify Pickup Address OTP
 *
 * POST /api/seller/shipping/verify-pickup
 *
 * After adding a pickup address via PATCH /api/seller/shipping,
 * Shiprocket sends an OTP to the seller's registered phone.
 * This endpoint verifies that OTP and marks the address as verified.
 */

import { withProviders } from "@/providers.config";
import { z } from "zod";
import { userRepository } from "@mohasinac/appkit";
import { ValidationError } from "@mohasinac/appkit";
import { successResponse } from "@mohasinac/appkit";
import { createApiHandler } from "@mohasinac/appkit";
import { ERROR_MESSAGES } from "@mohasinac/appkit";
import { SUCCESS_MESSAGES } from "@mohasinac/appkit";
import { serverLogger } from "@mohasinac/appkit";
import { shiprocketVerifyPickupOTP } from "@mohasinac/appkit";
import type { SellerShippingConfig } from "@mohasinac/appkit";

const verifyOTPSchema = z.object({
  otp: z.number().int().min(100000).max(999999),
  pickupLocationId: z.number().int().positive(),
});

export const POST = withProviders(createApiHandler<(typeof verifyOTPSchema)["_output"]>({
  auth: true,
  roles: ["seller", "admin"],
  schema: verifyOTPSchema,
  handler: async ({ user, body }) => {
    const { otp, pickupLocationId } = body || {};
    const config = user!.shippingConfig as SellerShippingConfig | undefined;

    if (!config || config.method !== "shiprocket") {
      throw new ValidationError(ERROR_MESSAGES.SHIPPING.NOT_CONFIGURED);
    }
    if (!config.shiprocketToken) {
      throw new ValidationError(
        ERROR_MESSAGES.SHIPPING.SHIPROCKET_CREDS_REQUIRED,
      );
    }

    serverLogger.info("Verifying Shiprocket pickup OTP", {
      uid: user!.uid,
      pickupLocationId,
    });

    const result = await shiprocketVerifyPickupOTP(config.shiprocketToken, {
      otp: Number(otp),
      pickup_location_id: pickupLocationId!,
    }).catch((err: Error) => {
      throw new ValidationError(
        `${ERROR_MESSAGES.SHIPPING.PICKUP_VERIFICATION_FAILED}: ${err.message}`,
      );
    });

    if (!result.success) {
      throw new ValidationError(
        result.message || ERROR_MESSAGES.SHIPPING.PICKUP_VERIFICATION_FAILED,
      );
    }

    // Mark address as verified in Firestore
    const updatedConfig = {
      ...config,
      pickupAddress: config.pickupAddress
        ? {
            ...config.pickupAddress,
            isVerified: true,
            shiprocketAddressId: pickupLocationId,
          }
        : undefined,
      isConfigured: true,
    };

    await userRepository.update(user!.uid, { shippingConfig: updatedConfig });

    serverLogger.info("Shiprocket pickup address verified", {
      uid: user!.uid,
      pickupLocationId,
    });

    return successResponse(
      { isVerified: true },
      SUCCESS_MESSAGES.SHIPPING.PICKUP_VERIFIED,
    );
  },
}));




