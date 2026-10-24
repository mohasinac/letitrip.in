import { withProviders } from "@/providers.config";
import { testerChecklistResponseRepository } from "@mohasinac/appkit/features/tester/repository/tester-checklist-response.repository";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { SEO_CONFIG } from "@/constants/seo";
import { ROLES_ADMIN_MOD } from "@/constants";

// The canonical host has ONE definition (appkit.config.js seo.siteUrl), which
// SEO_CONFIG surfaces. The literal here was the APEX host, which 308-redirects.
const SITE_ORIGIN = SEO_CONFIG.siteUrl;

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
