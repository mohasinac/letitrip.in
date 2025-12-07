import { Collections } from "@/app/api/lib/firebase/collections";
import {
  createSuccessResponse,
  withErrorHandler,
} from "@/app/api/lib/route-helpers";

/**
 * GET /api/categories/leaves
 * Get leaf categories (categories with no children)
 * Public endpoint
 */
export const GET = withErrorHandler(async () => {
  const snapshot = await Collections.categories().limit(1000).get();
  const all = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as any));

  const parentIds = new Set<string>();
  all.forEach((c) => {
    if (c.parent_id) parentIds.add(c.parent_id);
  });

  const leaves = all.filter((c) => !parentIds.has(c.id));

  return createSuccessResponse(leaves);
});
