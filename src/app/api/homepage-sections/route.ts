import { withProviders } from "@/providers.config";
import {
  homepageGET,
  homepageSectionsRepository,
  createRouteHandler,
  successResponse,
} from "@mohasinac/appkit";
import { ROLES_ADMIN_ONLY } from "@/constants";

// rbac-public: public read endpoint — Firestore rules + payload schema enforce visibility
export const GET = withProviders(homepageGET);

// rbac-public: public read endpoint — Firestore rules + payload schema enforce visibility
export const POST = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    handler: async ({ request }) => {
      const body = await request.json();
      const section = await homepageSectionsRepository.create({
        ...body,
        createdAt: new Date(),
      });
      return successResponse(section, "Homepage section created", 201);
    },
  }),
);
