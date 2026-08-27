/**
 * /api/reviews/[id] — single review read/update/delete.
 *
 * This file was previously a verbatim copy of the review LIST handler
 * (`src/app/api/reviews/route.ts`), exported as `GET(request: Request)` with no
 * `{ params }` argument — so `GET /api/reviews/{id}` ran the list handler,
 * found no `?productId=`, and returned `400 "productId query parameter is
 * required"`. The real handlers already existed in appkit and were never
 * mounted.
 */
import {
  reviewItemDELETE,
  reviewItemGET,
  reviewItemPATCH,
} from "@mohasinac/appkit";
import { withProviders } from "@/providers.config";

export const GET = withProviders(reviewItemGET);
export const PATCH = withProviders(reviewItemPATCH);
export const DELETE = withProviders(reviewItemDELETE);
