import { withProviders } from "@/providers.config";
import {
  createRouteHandler,
  successResponse,
  errorResponse,
  buyNowAuction,
  userRepository,
  NotFoundError,
  ValidationError,
  AuthorizationError,
} from "@mohasinac/appkit";
import { isSoftBanned } from "@mohasinac/appkit/server";

// rbac-public: public read endpoint — Firestore rules + payload schema enforce visibility
export const POST = withProviders(
  createRouteHandler({
    auth: true,
    handler: async ({ user, params }) => {
      const { id: productId } = (params ?? {}) as { id: string };
      if (!productId) return errorResponse("Auction ID is required", 400);

      const userDoc = await userRepository.findById(user!.uid);
      if (userDoc && isSoftBanned(userDoc, "place_bids")) {
        const ban = userDoc.softBans?.find((b) => b.action === "place_bids");
        return errorResponse(
          `Your account is restricted from purchases. Reason: ${ban?.reason ?? "Policy violation"}.`,
          403,
        );
      }

      try {
        const result = await buyNowAuction(
          user!.uid,
          (user as any).displayName ?? user!.email ?? "Unknown User",
          user!.email ?? "",
          { productId },
        );
        return successResponse(result, "Auction purchased via Buy Now", 201);
      } catch (err) {
        if (err instanceof NotFoundError) return errorResponse(err.message, 404);
        if (err instanceof ValidationError) return errorResponse(err.message, 400);
        if (err instanceof AuthorizationError) return errorResponse(err.message, 403);
        throw err;
      }
    },
  }),
);
