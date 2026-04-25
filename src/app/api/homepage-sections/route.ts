import { withProviders } from "@/providers.config";
import {
  homepageGET,
  homepageSectionsRepository,
  createRouteHandler,
  successResponse,
} from "@mohasinac/appkit";

export const GET = withProviders(homepageGET);

export const POST = withProviders(
  createRouteHandler({
    auth: true,
    roles: ["admin"],
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
