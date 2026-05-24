import { withProviders } from "@/providers.config";
import { z } from "zod";
import {
  adminUpdateUser,
  adminDeleteUser,
  userRepository,
  createRouteHandler,
  successResponse,
  errorResponse,
} from "@mohasinac/appkit";
import { ROLES_ADMIN_MOD, ROLES_ADMIN_ONLY } from "@/constants";

// ST-2 — admin extended user editing
const publicProfileSchema = z
  .object({
    bio: z.string().max(2000).optional(),
    location: z.string().max(200).optional(),
    website: z.string().max(300).optional(),
    socialLinks: z
      .object({
        twitter: z.string().max(200).optional(),
        instagram: z.string().max(200).optional(),
        facebook: z.string().max(200).optional(),
        linkedin: z.string().max(200).optional(),
      })
      .optional(),
  })
  .optional();

const updateUserSchema = z.object({
  role: z.enum(["user", "seller", "admin", "moderator"]).optional(),
  isDisabled: z.boolean().optional(),
  emailVerified: z.boolean().optional(),
  adminNotes: z.string().optional(),
  // ST-2 additions — admin can now edit identity fields that aren't self-serviceable
  displayName: z.string().min(1).max(200).optional(),
  phoneNumber: z.string().max(40).optional().nullable(),
  publicProfile: publicProfileSchema,
});

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_MOD],
    permission: "admin:users:read",
    handler: async ({ params }) => {
      const uid = (params as { uid: string }).uid;
      const user = await userRepository.findById(uid);
      if (!user) return errorResponse("User not found", 404);
      return successResponse(user);
    },
  }),
);

export const PATCH = withProviders(
  createRouteHandler<(typeof updateUserSchema)["_output"]>({
    auth: true,
    roles: [...ROLES_ADMIN_MOD],
    permission: "admin:users:write",
    schema: updateUserSchema,
    handler: async ({ body, params, user }) => {
      const uid = (params as { uid: string }).uid;
      await adminUpdateUser(user!.uid, uid, body! as any);
      return successResponse({ uid, ...body }, "User updated");
    },
  }),
);

export const DELETE = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    permission: "admin:users:delete",
    handler: async ({ params, user }) => {
      const uid = (params as { uid: string }).uid;
      await adminDeleteUser(user!.uid, uid);
      return successResponse(null, "User deleted");
    },
  }),
);
