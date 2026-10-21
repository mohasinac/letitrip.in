import { withProviders } from "@/providers.config";
import { z } from "zod";
import { adminUpdateUser, adminDeleteUser } from "@mohasinac/appkit/features/admin/actions/admin-actions";
import { userRepository } from "@mohasinac/appkit/features/auth/repository/user.repository";
import { successResponse, errorResponse } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
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
  isTester: z.boolean().optional(),
  canTestAdmin: z.boolean().optional(),
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
    handler: async ({ params }) => {
      const uid = (params as { uid: string }).uid;
      const user = await userRepository.findById(uid);
      if (!user) return errorResponse("User not found", 404);
      /*
       * 🛑 MASKED, not the raw document. This returned `user` verbatim, and
       * `UserRepository.mapDoc` deliberately does NOT decrypt — the
       * repository is ciphertext-by-default with named accessors — so this
       * route answered with `enc:v1:` AES blobs for email, phone,
       * displayName, and the `payoutDetails` / `shippingConfig` members that
       * carry a UPI handle and an account number.
       *
       * This is Root Cause #38's tell, verbatim: "the single-item GET
       * endpoint returning the raw, unstripped document while the LIST
       * endpoint hand-picks a narrower field set". The sibling list route
       * already calls `maskedUsers`; this one was the half that was missed,
       * and it is the two `enc:v1:` occurrences the audit measured on
       * `/admin/users/<uid>`.
       *
       * `maskedUser`, not `revealUser`. An admin opening a user needs to
       * identify them, not read their phone number — and the masked variant
       * is the documented default for "every admin list and every public
       * surface". A surface that genuinely needs plaintext should say so by
       * name, which is the whole point of the accessor pair.
       */
      return successResponse(userRepository.maskedUser(user));
    },
  }),
);

export const PATCH = withProviders(
  createRouteHandler<(typeof updateUserSchema)["_output"]>({
    auth: true,
    roles: [...ROLES_ADMIN_MOD],
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
    handler: async ({ params, user }) => {
      const uid = (params as { uid: string }).uid;
      await adminDeleteUser(user!.uid, uid);
      return successResponse(null, "User deleted");
    },
  }),
);
