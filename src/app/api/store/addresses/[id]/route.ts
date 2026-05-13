import { withProviders } from "@/providers.config";
import { z } from "zod";
import { createRouteHandler, successResponse, ApiErrors } from "@mohasinac/appkit";
import { addressesRepository, storeRepository } from "@mohasinac/appkit";

const updateAddressSchema = z.object({
  label: z.string().min(1).max(60).optional(),
  fullName: z.string().min(1).max(100).optional(),
  phone: z.string().min(7).max(20).optional(),
  addressLine1: z.string().min(1).max(200).optional(),
  addressLine2: z.string().max(200).optional(),
  landmark: z.string().max(100).optional(),
  city: z.string().min(1).max(100).optional(),
  state: z.string().min(1).max(100).optional(),
  postalCode: z.string().min(4).max(10).optional(),
  country: z.string().min(1).max(60).optional(),
  isDefault: z.boolean().optional(),
});

export const PUT = withProviders(createRouteHandler<(typeof updateAddressSchema)["_output"]>({
  auth: true,
  roles: ["seller", "admin"],
  schema: updateAddressSchema,
  handler: async ({ body, user, params }) => {
    const store = await storeRepository.findByOwnerId(user!.uid);
    if (!store) return ApiErrors.forbidden("No store found for this account");

    const addressId = String(params?.id ?? "");
    if (!addressId) return ApiErrors.badRequest("Address ID is required");

    const updated = await addressesRepository.updateForOwner(
      "store",
      store.id,
      addressId,
      body!,
    );
    return successResponse(updated, "Address updated");
  },
}));

export const DELETE = withProviders(createRouteHandler({
  auth: true,
  roles: ["seller", "admin"],
  handler: async ({ user, params }) => {
    const store = await storeRepository.findByOwnerId(user!.uid);
    if (!store) return ApiErrors.forbidden("No store found for this account");

    const addressId = String(params?.id ?? "");
    if (!addressId) return ApiErrors.badRequest("Address ID is required");

    await addressesRepository.deleteForOwner("store", store.id, addressId);
    return successResponse(null, "Address deleted");
  },
}));
