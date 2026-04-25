import { withProviders } from "@/providers.config";
import {
  userRepository,
  createRouteHandler,
  successResponse,
  errorResponse,
} from "@mohasinac/appkit";

export const GET = withProviders(
  createRouteHandler({
    handler: async ({ params }) => {
      const userId = (params as { userId: string }).userId;
      const user = await userRepository.findById(userId);
      if (!user) return errorResponse("User not found", 404);

      // Only expose safe public fields — no PII
      return successResponse({
        uid: user.uid,
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
