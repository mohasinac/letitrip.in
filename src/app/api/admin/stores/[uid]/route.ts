import { withProviders } from "@/providers.config";
import { STORE_FIELDS } from "@/constants/field-names";
import { z } from "zod";
import {
  adminUpdateStoreStatus,
  userRepository,
  storeRepository,
  createRouteHandler,
  successResponse,
  errorResponse,
} from "@mohasinac/appkit";

const updateStoreSchema = z.object({
  storeStatus: z.enum(Object.values(STORE_FIELDS.STATUS_VALUES) as [string, ...string[]]).optional(),
  adminNotes: z.string().optional(),
  isFeatured: z.boolean().optional(),
});

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: ["admin", "moderator"],
    handler: async ({ params }) => {
      const uid = (params as { uid: string }).uid;
      const user = await userRepository.findById(uid);
      if (!user) return errorResponse("User not found", 404);
      const store = user.storeSlug
        ? await storeRepository.findBySlug(user.storeSlug).catch(() => null)
        : null;
      return successResponse({ user, store });
    },
  }),
);

export const PATCH = withProviders(
  createRouteHandler<(typeof updateStoreSchema)["_output"]>({
    auth: true,
    roles: ["admin", "moderator"],
    schema: updateStoreSchema,
    handler: async ({ body, params }) => {
      const uid = (params as { uid: string }).uid;
      await adminUpdateStoreStatus(uid, body! as any);
      return successResponse({ uid, ...body }, "Store updated");
    },
  }),
);
