import { withProviders } from "@/providers.config";
import { createRouteHandler, newsletterRepository } from "@mohasinac/appkit";

function escape(value: unknown): string {
  const s = String(value ?? "");
  return s.includes(",") || s.includes('"') || s.includes("\n")
    ? `"${s.replace(/"/g, '""')}"`
    : s;
}

function csvRow(cols: unknown[]): string {
  return cols.map(escape).join(",");
}

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: ["admin", "moderator"],
    permission: "admin:newsletter:read",
    handler: async () => {
      const result = await newsletterRepository.list({
        sorts: "-createdAt",
        page: "1",
        pageSize: "10000",
      });

      const header = csvRow(["id", "email", "status", "source", "subscribedAt", "createdAt"]);

      const dataRows = (result.data as unknown as Record<string, unknown>[]).map((s) =>
        csvRow([
          s["id"],
          s["email"] ?? "",
          s["status"] ?? "",
          s["source"] ?? "",
          s["subscribedAt"] ?? "",
          s["createdAt"] ?? "",
        ]),
      );

      const csv = [header, ...dataRows].join("\r\n");
      const date = new Date().toISOString().slice(0, 10);

      return new Response(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="newsletter-subscribers-${date}.csv"`,
        },
      }) as unknown as ReturnType<typeof Response.json>;
    },
  }),
);
