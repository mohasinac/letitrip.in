import { withProviders } from "@/providers.config";
import { getAdminDb } from "@mohasinac/appkit/providers/db-firebase";
import { PART_GLOSSARY_COLLECTION } from "@mohasinac/appkit/features/parts/schemas/firestore";
import { successResponse } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
/* Defining module, not the `@/constants` barrel — see the `[id]` route. */
import { ROLES_BACK_OFFICE } from "@/constants/api-roles";

/** Rule #6: every list endpoint is paginated, and the cap is not negotiable. */
const MAX_PAGE_SIZE = 50;

/**
 * The admin part-glossary list.
 *
 * ── 🛑 `q` IS READ, AND THE SEARCH IS PREFIX-ONLY ON PURPOSE ──────────────
 *
 * `useAdminListing` always sends `q`, so a route that ignores it produces a
 * search box that filters nothing while returning plausible rows — Root Cause
 * #99, which cost `/stores` and `/blog` a working search each, and which is
 * invisible to any test that does not use a nonsense control.
 *
 * So it is read, as an indexed PREFIX range on `name` (`>= q`, `< q + \uf8ff`).
 * Two honest limitations, stated rather than papered over:
 *
 *   · it is a prefix, not a substring — "ranzer" will not find "Dranzer";
 *   · it is CASE-SENSITIVE, because Firestore compares the stored string and
 *     this collection has no lowercased mirror field.
 *
 * The alternative was a bounded fetch plus an in-memory filter, which buys
 * substring matching at ~1,000 reads per keystroke-debounce against a
 * 50,000/day free tier. For a back-office lookup over 2,488 rows a prefix
 * range is the right trade — and the SUBSTRING search already exists for
 * visitors, through the public index artifact that `/parts` uses
 * (`search-txt.ts` documents the same prefix limitation there).
 *
 * 🛑 `total` is the collection COUNT, from an aggregate query, not
 * `docs.length`. A page length reported as a total makes the pager claim one
 * page always.
 */
export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_BACK_OFFICE],
    permission: "admin:parts:read",
    handler: async ({ request }) => {
      const url = new URL(request.url);
      const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
      const pageSize = Math.min(
        MAX_PAGE_SIZE,
        Math.max(1, Number(url.searchParams.get("pageSize")) || 25),
      );
      const q = (url.searchParams.get("q") ?? "").trim();

      const col = getAdminDb().collection(PART_GLOSSARY_COLLECTION);

      /*
       * 🛑 ORDERED BY `name`, WHICH EVERY ROW HAS. An `orderBy` silently
       * excludes every document missing the field — the trap that made a
       * store's whole review set return zero when ordered by an `itemsSold`
       * nothing had ever written (Root Cause #100). `name` is required on
       * `PartGlossaryDocument`, so the ordering drops nothing.
       */
      let query = col.orderBy("name").limit(pageSize).offset((page - 1) * pageSize);
      let countQuery = col.count();

      if (q) {
        /*
         * 🛑 The high private-use sentinel as an ESCAPE, never the raw glyph.
         *
         * U+F8FF is invisible in every rendering — and `JSON.stringify` does
         * not escape it either, so a line containing it prints byte-identical
         * to one that does not. I read exactly that output, concluded the
         * character had been lost, and reported a bug that did not exist; only
         * dumping code points settled it. An escape is reviewable, a private-use
         * glyph is not, and the failure if it ever IS stripped is silent:
         * `upper === q` makes `name >= q AND name < q` match nothing, so every
         * search returns zero rows and looks like a search with no matches.
         */
        const upper = `${q}\uf8ff`;
        query = col
          .where("name", ">=", q)
          .where("name", "<", upper)
          .orderBy("name")
          .limit(pageSize)
          .offset((page - 1) * pageSize);
        countQuery = col.where("name", ">=", q).where("name", "<", upper).count();
      }

      const [snap, countSnap] = await Promise.all([query.get(), countQuery.get()]);

      return successResponse({
        data: snap.docs.map((d) => ({ id: d.id, ...d.data() })),
        total: countSnap.data().count,
        page,
        pageSize,
      });
    },
  }),
);
