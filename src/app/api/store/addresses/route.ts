import { withProviders } from "@/providers.config";
import { z } from "zod";
import { createRouteHandler, successResponse, ApiErrors } from "@mohasinac/appkit";
import { addressesRepository, storeRepository } from "@mohasinac/appkit";

const createAddressSchema = z.object({
  label: z.string().min(1).max(60),
  fullName: z.string().min(1).max(100),
  phone: z.string().min(7).max(20),
  addressLine1: z.string().min(1).max(200),
  addressLine2: z.string().max(200).optional(),
  landmark: z.string().max(100).optional(),
  city: z.string().min(1).max(100),
  state: z.string().min(1).max(100),
  postalCode: z.string().min(4).max(10),
  country: z.string().min(1).max(60).default("India"),
  isDefault: z.boolean().default(false),
});

export const GET = withProviders(createRouteHandler({
  auth: true,
  roles: ["seller", "admin", "moderator"],
  handler: async ({ user }) => {
    const store = await storeRepository.findByOwnerId(user!.uid);
    if (!store) return ApiErrors.forbidden("No store found for this account");

    const addresses = await addressesRepository.listByOwner("store", store.id);
    return successResponse({ addresses, total: addresses.length });
  },
}));

export const POST = withProviders(createRouteHandler<(typeof createAddressSchema)["_output"]>({
  auth: true,
  roles: ["seller", "admin"],
  schema: createAddressSchema,
  handler: async ({ body, user }) => {
    const store = await storeRepository.findByOwnerId(user!.uid);
    if (!store) return ApiErrors.forbidden("No store found for this account");

    const address = await addressesRepository.createForOwner("store", store.id, body!);
    return successResponse(address, "Address created");
  },
}));
