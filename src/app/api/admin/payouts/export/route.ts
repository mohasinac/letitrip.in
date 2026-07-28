import { withFeatureGuard } from "@/lib/features";
import { withProviders } from "@/providers.config";
import type { JsonValue } from "@mohasinac/appkit";
import { createRouteHandler, payoutRepository, sortBy, COMMON_FIELDS } from "@mohasinac/appkit";
import { ROLES_ADMIN_MOD } from "@/constants";

function escape(value: unknown): string {
  const s = String(value ?? "");
  return s.includes(",") || s.includes('"') || s.includes("\n")
 ? `"${s.replace(/"/g, '""')}"`
    : s;
}

function csvRow(cols: unknown[]): string {
  return cols.map(escape).join(",");
}

const __GET__g = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_MOD],
    permission: "admin:payouts:read",
    handler: async () => {
      const result = await payoutRepository.list({
        sorts: sortBy(COMMON_FIELDS.CREATED_AT),
        page: "1",
        pageSize: "1000",
      });

      const header = csvRow([
        "id",
        "storeId",
        "storeName",
        "amount",
        "status",
        "transactionId",
        "periodStart",
        "periodEnd",
        "createdAt",
      ]);

      const dataRows = (result.items as unknown as Record<string, JsonValue>[]).map((p) =>
        csvRow([
          p["id"],
          p["storeId"] ?? p["sellerId"] ?? "",
          p["storeName"] ?? p["sellerName"] ?? "",
          p["amount"],
          p["status"],
          p["transactionId"] ?? "",
          p["periodStart"] ?? "",
          p["periodEnd"] ?? "",
          p["createdAt"] ?? "",
        ]),
      );

      const csv = [header, ...dataRows].join("\r\n");
      const date = new Date().toISOString().slice(0, 10);

      return new Response(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="payouts-${date}.csv"`,
        },
      }) as unknown as ReturnType<typeof Response.json>;
    },
  }),
);

// rbac-scope-enforced-in-handler: feature-guarded — returns 404 when FEATURE_* disabled
export const GET = withFeatureGuard("PAYOUTS", __GET__g);
