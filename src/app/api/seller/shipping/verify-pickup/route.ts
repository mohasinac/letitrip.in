/**
 * Seller Shipping — Verify Pickup Address OTP
 *
 * POST /api/seller/shipping/verify-pickup
 *
 * After adding a pickup address via PATCH /api/seller/shipping,
 * Shiprocket sends an OTP to the seller's registered phone.
 * This endpoint verifies that OTP and marks the address as verified.
 */

import { NextRequest } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/firebase/auth-server";
import { userRepository } from "@/repositories";
import { handleApiError } from "@/lib/errors/error-handler";
import { AuthorizationError, ValidationError } from "@/lib/errors";
import { successResponse, ApiErrors } from "@/lib/api-response";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";
import { serverLogger } from "@/lib/server-logger";
import { shiprocketVerifyPickupOTP } from "@/lib/shiprocket/client";

const verifyOTPSchema = z.object({
  otp: z.number().int().min(100000).max(999999),
  pickupLocationId: z.number().int().positive(),
});

export async function POST(request: NextRequest) {
  try {
    const authUser = await requireAuth();
    const user = await userRepository.findById(authUser.uid);

    if (!user) {
      throw new AuthorizationError(ERROR_MESSAGES.AUTH.UNAUTHORIZED);
    }
    if (user.role !== "seller" && user.role !== "admin") {
      throw new AuthorizationError(ERROR_MESSAGES.AUTH.ADMIN_ACCESS_REQUIRED);
    }

    const body = await request.json();
    const validation = verifyOTPSchema.safeParse(body);
    if (!validation.success) {
      return ApiErrors.validationError(validation.error.issues);
    }

    const { otp, pickupLocationId } = validation.data;
    const config = user.shippingConfig;

    if (!config || config.method !== "shiprocket") {
      throw new ValidationError(ERROR_MESSAGES.SHIPPING.NOT_CONFIGURED);
    }
    if (!config.shiprocketToken) {
      throw new ValidationError(
        ERROR_MESSAGES.SHIPPING.SHIPROCKET_CREDS_REQUIRED,
      );
    }

    serverLogger.info("Verifying Shiprocket pickup OTP", {
      uid: authUser.uid,
      pickupLocationId,
    });

    const result = await shiprocketVerifyPickupOTP(config.shiprocketToken, {
      otp,
      pickup_location_id: pickupLocationId,
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

    await userRepository.update(authUser.uid, { shippingConfig: updatedConfig });

    serverLogger.info("Shiprocket pickup address verified", {
      uid: authUser.uid,
      pickupLocationId,
    });

    return successResponse(
      { isVerified: true },
      SUCCESS_MESSAGES.SHIPPING.PICKUP_VERIFIED,
    );
  } catch (error) {
    return handleApiError(error);
  }
}
