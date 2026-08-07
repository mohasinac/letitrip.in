/**
 * Seller Shipping Configuration API
 *
 * GET   /api/store/shipping — Read current shipping config
 * PATCH /api/store/shipping — Save custom carrier price + pickup address.
 *   Manual shipping only — no carrier API, no credentials, no OTP step.
 */

import { withProviders } from "@/providers.config";
import { z } from "zod";
import { userRepository, addressesRepository } from "@mohasinac/appkit";
import { successResponse, errorResponse } from "@mohasinac/appkit";
import { createApiHandler } from "@mohasinac/appkit";
import { SUCCESS_MESSAGES } from "@mohasinac/appkit";
import { serverLogger } from "@mohasinac/appkit";
import type { SellerShippingConfig } from "@mohasinac/appkit";
import { ROLES_STORE_WRITE } from "@/constants";

// --- Schemas ----------------------------------------------------------------

const updateShippingSchema = z.object({
  customShippingPrice: z.number().min(0),
  customCarrierName: z.string().min(1).max(80),
  /** ID into the unified `addresses` collection (ownerType="store") — see StoreAddressSelectorCreate. */
  pickupAddressId: z.string().min(1).optional(),
});

// --- GET ---------------------------------------------------------------------

export const GET = withProviders(createApiHandler({
  auth: true,
  roles: [...ROLES_STORE_WRITE],
    permission: "store:api:write",
  handler: async ({ user }) => {
    const config = user!.shippingConfig as SellerShippingConfig | undefined;
    return successResponse({
      shippingConfig: config ?? { method: "custom", isConfigured: false },
    });
  },
}));

// --- PATCH --------------------------------------------------------------------

export const PATCH = withProviders(createApiHandler<(typeof updateShippingSchema)["_output"]>(
  {
    auth: true,
    roles: [...ROLES_STORE_WRITE],
    permission: "store:api:write",
    schema: updateShippingSchema,
    handler: async ({ user, body }) => {
      const data = body!;
      let pickupAddress: SellerShippingConfig["pickupAddress"];
      if (data.pickupAddressId) {
        const addr = await addressesRepository.findById(data.pickupAddressId);
        if (!addr || addr.ownerType !== "store") {
          return errorResponse("Pickup address not found", 404);
        }
        pickupAddress = {
          locationName: addr.label,
          name: addr.fullName,
          phone: addr.phone,
          email: user!.email ?? "",
          address: addr.addressLine1,
          address2: addr.addressLine2,
          city: addr.city,
          state: addr.state,
          pincode: addr.postalCode,
          country: addr.country,
          isVerified: true,
        };
      }

      const config: SellerShippingConfig = {
        method: "custom",
        customShippingPrice: data.customShippingPrice,
        customCarrierName: data.customCarrierName,
        isConfigured: true,
        ...(pickupAddress ? { pickupAddress } : {}),
      };

      await userRepository.update(user!.uid, { shippingConfig: config });

      serverLogger.info("Seller shipping config updated", {
        uid: user!.uid,
        method: config.method,
        isConfigured: config.isConfigured,
      });

      return successResponse(
        { shippingConfig: config },
        SUCCESS_MESSAGES.SHIPPING.UPDATED,
      );
    },
  },
));
