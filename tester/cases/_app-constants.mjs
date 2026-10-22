/**
 * The two application constants the case corpus cites, mirrored here.
 *
 * ## Why mirrored and not imported
 *
 * `tester/` is a separate repository. Two of the 137 case files used to reach
 * back into appkit with a relative path —
 *
 *     import { PRODUCT_MAX_IMAGES } from "../../../../_internal/shared/media/limits";
 *     import { MEDIA_ENDPOINTS }    from "../../../../constants/api-endpoints";
 *
 * — which resolved only while the cases lived inside `appkit/src`. Once moved,
 * those paths climb out of the repo entirely (`d:/proj/_internal/...`), and
 * they were the sole reason 8 of the 145 converted files failed to load.
 *
 * 🛑 A MIRROR IS A LIABILITY, so it is deliberately TINY and it is CHECKED.
 * `tester/scripts/lib/validate-cases.mjs` asserts each value below still
 * matches the appkit source when that source is reachable, and says so when it
 * is not. A silent copy is how Root Cause #42 is written; a copy that fails
 * loudly on drift is just a repository boundary.
 *
 * The alternative — depending on a built `appkit/dist` from the tester repo —
 * would couple the harness to a build artifact of the thing it tests, so a
 * stale `dist` would quietly change what the cases assert.
 */

/**
 * The product gallery cap.
 *
 * 🛑 NOT the same number as the per-upload or per-review cap — appkit's own
 * comment three lines below this constant says conflating them is a live bug.
 * Source: appkit/src/_internal/shared/media/limits.ts
 */
export const PRODUCT_MAX_IMAGES = 24;

/**
 * Videos per listing.
 *
 * One, and the reason is structural rather than a policy number:
 * `ProductDocument.video` is a single field, not an array. A case asserting
 * "the second video is rejected" is asserting that shape.
 * Source: appkit/src/_internal/shared/media/limits.ts
 */
export const PRODUCT_MAX_VIDEOS = 1;

/**
 * The media endpoints a case may navigate to or assert against.
 * Source: appkit/src/constants/api-endpoints.ts
 */
export const MEDIA_ENDPOINTS = {
  BASE: "/api/media",
  SIGN: "/api/media/sign",
  FINALIZE: "/api/media/finalize",
  CROP: "/api/media/crop",
  TRIM: "/api/media/trim",
  DELETE: (url) => `/api/media?url=${encodeURIComponent(url)}`,
};
