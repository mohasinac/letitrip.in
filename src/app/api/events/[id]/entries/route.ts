import { withFeatureGuard } from "@/lib/features";
import { withProviders } from "@/providers.config";
import {
  createRouteHandler,
  enterEvent,
  errorResponse,
  parseJsonBody,
  successResponse,
  userRepository,
} from "@mohasinac/appkit";
import { isSoftBanned } from "@mohasinac/appkit/server";

// rbac-scope-enforced-in-handler: auth and ownership enforced within handler
const __POST__g = withProviders(
  createRouteHandler({
    authOptional: true,
    handler: async ({ user, request, params }) => {
      if (user) {
        const userDoc = await userRepository.findById(user.uid);
        if (userDoc && isSoftBanned(userDoc, "join_events")) {
          const ban = userDoc.softBans?.find((b) => b.action === "join_events");
          return errorResponse(
            `Your account is restricted from joining events. Reason: ${ban?.reason ?? "Policy violation"}. Contact support if you believe this is an error.`,
            403,
          );
        }
      }
      const eventId = (params as { id: string }).id;
      const body = await parseJsonBody(request);
      const safeUser = user
        ? { uid: user.uid, displayName: user.displayName, email: user.email ?? undefined }
        : undefined;
      const result = await enterEvent(eventId, body, safeUser);
      return successResponse(result, "Entry submitted", 201);
    },
  }),
);

// rbac-scope-enforced-in-handler: feature-guarded — returns 404 when FEATURE_* disabled
export const POST = withFeatureGuard("EVENTS", __POST__g);
