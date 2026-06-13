import { withProviders } from "@/providers.config";
import {
  createRouteHandler,
  successResponse,
  ApiErrors,
  itemRequestsRepository,
} from "@mohasinac/appkit";

// rbac-public: public read endpoint — Firestore rules + payload schema enforce visibility
export const GET = withProviders(
  createRouteHandler({
    auth: false,
    handler: async ({ params }) => {
      const id = (params as { id: string }).id;
      const doc = await itemRequestsRepository.findById(id);
      if (!doc || doc.status === "pending-approval") return ApiErrors.notFound("Not found");
      return successResponse(doc);
    },
  }),
);
