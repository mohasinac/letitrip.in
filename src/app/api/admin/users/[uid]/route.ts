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

const updateUserSchema = z.object({
  role: z.enum(["user", "seller", "admin", "moderator"]).optional(),
  isDisabled: z.boolean().optional(),
  emailVerified: z.boolean().optional(),
  adminNotes: z.string().optional(),
});

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: ["admin", "moderator"],
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
    roles: ["admin", "moderator"],
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
    roles: ["admin"],
    handler: async ({ params, user }) => {
      const uid = (params as { uid: string }).uid;
      await adminDeleteUser(user!.uid, uid);
      return successResponse(null, "User deleted");
    },
  }),
);
