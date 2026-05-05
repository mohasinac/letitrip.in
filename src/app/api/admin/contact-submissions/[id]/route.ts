import { withProviders } from "@/providers.config";
import { z } from "zod";
import {
  createRouteHandler,
  successResponse,
  errorResponse,
  contactSubmissionsRepository,
} from "@mohasinac/appkit";

const updateSubmissionSchema = z.object({
  action: z.enum(["read", "resolved", "delete"]),
});

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: ["admin", "moderator"],
    handler: async ({ params }) => {
      const id = (params as { id: string }).id;
      const submission = await contactSubmissionsRepository.findById(id);
      if (!submission) return errorResponse("Submission not found", 404);
      return successResponse(submission);
    },
  }),
);

export const PATCH = withProviders(
  createRouteHandler<(typeof updateSubmissionSchema)["_output"]>({
    auth: true,
    roles: ["admin", "moderator"],
    schema: updateSubmissionSchema,
    handler: async ({ body, params }) => {
      const id = (params as { id: string }).id;
      const submission = await contactSubmissionsRepository.findById(id);
      if (!submission) return errorResponse("Submission not found", 404);
      if (body!.action === "read") {
        await contactSubmissionsRepository.markRead(id);
        return successResponse(null, "Marked as read");
      }
      if (body!.action === "resolved") {
        await contactSubmissionsRepository.markResolved(id);
        return successResponse(null, "Marked as resolved");
      }
      if (body!.action === "delete") {
        await contactSubmissionsRepository.deleteById(id);
        return successResponse(null, "Submission deleted");
      }
      return errorResponse("Invalid action", 400);
    },
  }),
);

export const DELETE = withProviders(
  createRouteHandler({
    auth: true,
    roles: ["admin"],
    handler: async ({ params }) => {
      const id = (params as { id: string }).id;
      const submission = await contactSubmissionsRepository.findById(id);
      if (!submission) return errorResponse("Submission not found", 404);
      await contactSubmissionsRepository.deleteById(id);
      return successResponse(null, "Submission deleted");
    },
  }),
);
