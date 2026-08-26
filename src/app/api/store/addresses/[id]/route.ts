import { withProviders } from "@/providers.config";
import { z } from "zod";
import { createRouteHandler, successResponse, ApiErrors } from "@mohasinac/appkit";
import { addressesRepository, storeRepository } from "@mohasinac/appkit";
import { ROLES_STORE_READ, ROLES_STORE_WRITE } from "@/constants";

/*
 * Hoisted once the GET below made these a third repeat. Same string in three
 * handlers is a rename waiting to go half-done.
 */
const MSG_NO_STORE = "No store found for this account";
const MSG_NO_ADDRESS_ID = "Address ID is required";

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

/**
 * Read one of THIS store's addresses.
 *
 * Added 2026-08-26 for `/store/addresses/[id]/edit`: this route had only PUT
 * and DELETE, so `useAddress` would have 405'd the moment a page reused it.
 * Caught by `audit-client-verb-match` before the page was written.
 *
 * A foreign or missing address answers 404 identically — `getForOwner` returns
 * null for both, deliberately, so the response cannot confirm an id exists.
 */
export const GET = withProviders(createRouteHandler({
  auth: true,
  roles: [...ROLES_STORE_READ],
  handler: async ({ user, params }) => {
    const store = await storeRepository.findByOwnerId(user!.uid);
    if (!store) return ApiErrors.forbidden(MSG_NO_STORE);

    const addressId = String(params?.id ?? "");
    if (!addressId) return ApiErrors.badRequest(MSG_NO_ADDRESS_ID);

    const address = await addressesRepository.getForOwner("store", store.id, addressId);
    if (!address) return ApiErrors.notFound("Address not found");
    return successResponse(address);
  },
}));

export const PUT = withProviders(createRouteHandler<(typeof updateAddressSchema)["_output"]>({
  auth: true,
  roles: [...ROLES_STORE_WRITE],
  schema: updateAddressSchema,
  handler: async ({ body, user, params }) => {
    const store = await storeRepository.findByOwnerId(user!.uid);
    if (!store) return ApiErrors.forbidden(MSG_NO_STORE);

    const addressId = String(params?.id ?? "");
    if (!addressId) return ApiErrors.badRequest(MSG_NO_ADDRESS_ID);

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
  roles: [...ROLES_STORE_WRITE],
  handler: async ({ user, params }) => {
    const store = await storeRepository.findByOwnerId(user!.uid);
    if (!store) return ApiErrors.forbidden(MSG_NO_STORE);

    const addressId = String(params?.id ?? "");
    if (!addressId) return ApiErrors.badRequest(MSG_NO_ADDRESS_ID);

    await addressesRepository.deleteForOwner("store", store.id, addressId);
    return successResponse(null, "Address deleted");
  },
}));
