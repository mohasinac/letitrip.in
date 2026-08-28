import { resolveProfileUser } from "@mohasinac/appkit/server";
import { withProviders } from "@/providers.config";
import {
  createRouteHandler,
  successResponse,
  errorResponse,
} from "@mohasinac/appkit";

export const GET = withProviders(
  createRouteHandler({
    handler: async ({ params }) => {
      const userId = (params as { userId: string }).userId;
      // The SAME resolver the page uses. This route used `findById` only,
      // with no uid fallback, so an identifier that resolved on /profile/{id}
      // 404'd here — the two had already diverged before slugs existed.
      const user = await resolveProfileUser(userId);
      if (!user) return errorResponse("User not found", 404);

      // Only expose safe public fields — no PII
      return successResponse({
        uid: user.uid,
        slug: user.slug ?? null,
        displayName: user.displayName ?? null,
        photoURL: user.photoURL ?? null,
        avatarMetadata: user.avatarMetadata ?? null,
        role: user.role,
        createdAt: user.createdAt,
        publicProfile: user.publicProfile ?? null,
        stats: user.stats ?? null,
      });
    },
  }),
);