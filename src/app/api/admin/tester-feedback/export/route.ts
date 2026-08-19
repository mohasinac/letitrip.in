import { withProviders } from "@/providers.config";
import { createRouteHandler, testerChecklistResponseRepository } from "@mohasinac/appkit";
import { ROLES_ADMIN_MOD } from "@/constants";

const SITE_ORIGIN = process.env.NEXT_PUBLIC_SITE_URL || "https://letitrip.in";

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_MOD],
    handler: async () => {
      const markdown = await testerChecklistResponseRepository.getMarkdownReport(SITE_ORIGIN);
      const date = new Date().toISOString().slice(0, 10);

      return new Response(markdown, {
        headers: {
          "Content-Type": "text/markdown; charset=utf-8",
          "Content-Disposition": `attachment; filename="tester-feedback-report-${date}.md"`,
        },
      }) as unknown as ReturnType<typeof Response.json>;
    },
  }),
);
