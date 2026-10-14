/**
 * The ONE derivation of a bey-model category id from a corpus row's `name`.
 *
 * Extracted from `gen-category-models.mjs` (where it originated) so a second
 * script can resolve the SAME id without re-deriving the rule — which is
 * exactly the mistake this session made once already: `fetch-taxonomy-images.mjs`
 * first used the corpus's own `slug` field, which includes the trailing
 * parenthetical ("aero-knight-ms-aero-knight-metal-sky"), while the category
 * generator strips it ("aero-knight-ms"). The two disagreed on 58 of 195 ids,
 * and the images for those 58 silently never reached a category — the same
 * "second implementation of the thing being measured" failure as
 * `measure-leaf-offenders.mjs`'s first version in this same session.
 *
 * `gen-category-models.mjs` does not export these two functions itself because
 * the whole file is a generator with top-level side effects (it reads the
 * corpus and writes `category-models.ts` the moment it is imported) — pulling
 * two pure functions out to their own module is what makes them importable
 * without re-running the generator.
 *
 * @tag domain:categories
 * @tag layer:script
 * @tag access:node-only
 * @tag sideEffects:none — pure functions
 */

/**
 * "Aero Knight MS (Aero Knight Metal Sky)" -> { name: "Aero Knight MS",
 * extraAliases: ["Aero Knight Metal Sky"] }. A `/`-separated bracket yields
 * multiple aliases; a bracket under 3 chars or pure punctuation is dropped as
 * noise rather than aliased.
 */
export function splitTrailingParenthetical(raw) {
  const name = (raw || "").replace(/[*⭐]/g, "").trim();
  const m = /^(.*?)\s*\(([^()]*)\)\s*$/.exec(name);
  if (!m) return { name, extraAliases: [] };
  const head = m[1].trim();
  const inner = m[2]
    .split("/")
    .map((s) => s.trim())
    .filter((s) => s.length > 2 && /[a-z0-9]/i.test(s));
  if (!head) return { name, extraAliases: [] };
  return { name: head, extraAliases: inner };
}

export function slugify(s) {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** The category id a corpus `canonical` row resolves to — "category-aero-knight-ms". */
export function categoryIdForModel(corpusRow) {
  const { name } = splitTrailingParenthetical(corpusRow.name);
  return `category-${slugify(name)}`;
}
