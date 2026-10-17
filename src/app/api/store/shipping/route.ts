/**
 * Seller Shipping Configuration API
 *
 * GET   /api/store/shipping — Read current shipping config
 * PATCH /api/store/shipping — Save custom carrier price + pickup address.
 *   Manual shipping only — no carrier API, no credentials, no OTP step.
 */

import { withProviders } from "@/providers.config";
import { z } from "zod";
import { addressesRepository } from "@mohasinac/appkit/features/addresses/repository/addresses.repository";
import { userRepository } from "@mohasinac/appkit/features/auth/repository/user.repository";
import { successResponse, errorResponse } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler as createApiHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { SUCCESS_MESSAGES } from "@mohasinac/appkit/values/success-messages";
import { serverLogger } from "@mohasinac/appkit/monitoring/server-logger";
import type { SellerShippingConfig } from "@mohasinac/appkit/features/auth/schemas/firestore";
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
    schema: updateShippingSchema,
    handler: async ({ user, body }) => {
      const data = body!;
      let pickupAddress: SellerShippingConfig["pickupAddress"];
      if (data.pickupAddressId) {
        const addr = await addressesRepository.findById(data.pickupAddressId);
        if (!addr || addr.ownerType !== "store") {
          return errorResponse("Pickup address not found", 404);
        }
        /*
         * 🛑 REVEALED. `findById` is ciphertext-by-default, and this object is
         * written through `userRepository.update({ shippingConfig })`, where
         * `encryptShippingConfig` encrypts exactly
         * `["phone","email","address","address2"]` — so THREE of these fields
         * were being encrypted a second time and became permanently
         * unreadable. `name` is not in that list, so it froze as ciphertext
         * instead. Four corrupted fields in one object literal.
         */
        const addrPlain = addressesRepository.revealAddress(addr);
        pickupAddress = {
          locationName: addr.label,
          name: addrPlain.fullName,
          phone: addrPlain.phone,
          email: user!.email ?? "",
          address: addrPlain.addressLine1,
          address2: addrPlain.addressLine2,
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
