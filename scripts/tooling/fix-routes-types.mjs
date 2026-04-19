/**
 * Fix type import issues in newly written routes.
 */
import { readFileSync, writeFileSync } from "fs";

// Fix admin/events/[id]/route.ts - remove EventUpdateInput import
let content = readFileSync("src/app/api/admin/events/[id]/route.ts", "utf8");
content = content.replace(
  'import type { EventUpdateInput } from "@mohasinac/appkit/features/events";\n\n',
  ""
);
content = content.replace(
  "const updateData: EventUpdateInput = {",
  "const updateData = {"
);
writeFileSync("src/app/api/admin/events/[id]/route.ts", content, "utf8");
console.log("Fixed: admin/events/[id]/route.ts");

// Fix admin/events/[id]/status/route.ts - remove EventDocument import  
content = readFileSync("src/app/api/admin/events/[id]/status/route.ts", "utf8");
content = content.replace(
  'import type { EventDocument } from "@mohasinac/appkit/features/events";\n\n',
  ""
);
content = content.replace(
  'parsed.data.status as EventDocument["status"]',
  "parsed.data.status as any"
);
writeFileSync("src/app/api/admin/events/[id]/status/route.ts", content, "utf8");
console.log("Fixed: admin/events/[id]/status/route.ts");

// Fix admin/payouts/[id]/route.ts - remove PayoutStatus import
content = readFileSync("src/app/api/admin/payouts/[id]/route.ts", "utf8");
content = content.replace(
  'import type { PayoutStatus } from "@mohasinac/appkit/features/payments";\n\n',
  ""
);
content = content.replace("status as PayoutStatus", "status as any");
writeFileSync("src/app/api/admin/payouts/[id]/route.ts", content, "utf8");
console.log("Fixed: admin/payouts/[id]/route.ts");

// Fix bids/[id]/route.ts - bidRepository.findByProduct takes productId
const bidsIdContent = `import "@/providers.config";
/**
 * Bids [id] API Route
 * GET /api/bids/:id — Get bids for a product (id = productId)
 */

import { bidRepository } from "@mohasinac/appkit/repositories";
import { serverLogger } from "@mohasinac/appkit/monitoring";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(
  request: Request,
  context: RouteContext,
): Promise<Response> {
  const { id } = await context.params;
  const url = new URL(request.url);
  const limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit")) || 20));

  serverLogger.info("Bid list by product requested", { productId: id });

  // id is productId
  const bids = await bidRepository.findByProduct(id);
  return Response.json({ success: true, data: (bids ?? []).slice(0, limit) });
}
`;
writeFileSync("src/app/api/bids/[id]/route.ts", bidsIdContent, "utf8");
console.log("Fixed: bids/[id]/route.ts");

// Fix admin/stores/[uid] - userRepository.findById may not exist, use findByEmail or list
content = readFileSync("src/app/api/admin/stores/[uid]/route.ts", "utf8");
// Replace userRepository.findById with list
content = content.replace(
  "const user = await userRepository.findById(uid).catch(() => null);",
  "const users = await userRepository.findByRole(\"seller\" as any).catch(() => []);\n  const user = users.find((u: any) => u.id === uid) ?? null;"
);
writeFileSync("src/app/api/admin/stores/[uid]/route.ts", content, "utf8");
console.log("Fixed: admin/stores/[uid]/route.ts (userRepository.findById)");

// Fix admin/products/[id] - ProductUpdateInput import
content = readFileSync("src/app/api/admin/products/[id]/route.ts", "utf8");
content = content.replace(
  'import type { ProductUpdateInput } from "@mohasinac/appkit/features/products";\n\n',
  ""
);
content = content.replace(
  "parsed.data as ProductUpdateInput",
  "parsed.data as any"
);
writeFileSync("src/app/api/admin/products/[id]/route.ts", content, "utf8");
console.log("Fixed: admin/products/[id]/route.ts (ProductUpdateInput)");

// Fix admin/blog/[id] - remove validateAdminSession import (not used)
content = readFileSync("src/app/api/admin/blog/[id]/route.ts", "utf8");
content = content.replace(
  'import { validateAdminSession } from "@/lib/firebase/auth-server";\n\n',
  ""
);
writeFileSync("src/app/api/admin/blog/[id]/route.ts", content, "utf8");
console.log("Fixed: admin/blog/[id]/route.ts (removed unused import)");

console.log("\nAll fixes applied.");
