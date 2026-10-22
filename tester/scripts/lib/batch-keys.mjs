/*
 * The ONE owner of the batch-key ↔ filename transform.
 *
 * 🛑 WHY THIS MODULE EXISTS
 *
 * The `/` ↔ `__` transform was hand-rolled at three sites that disagreed with
 * each other, and that disagreement WAS two live defects:
 *
 *   · `record-verdicts.mjs` wrote `${batch.groupKey}__${batch.pageKey}.json`,
 *     which drops the `--admin` slice suffix `splitByIdentity` had just created.
 *     For a split page the admin slice's verdicts overwrote the main slice's
 *     file, `run.mjs`'s existence check could never match, so the slice was
 *     counted failed every time AND re-run forever by `--resume`.
 *
 *   · `run.mjs` built `String(flag("page")).replace("/", "__") + ".json"` and
 *     compared it with `===`, so `--page x/y` silently dropped the `--admin`
 *     slice that `fetch-cases.mjs` had deliberately produced. Meanwhile
 *     `fetch-cases.mjs` got the same filter RIGHT (`b.key === PAGE || b.key ===
 *     PAGE+"--admin"`). Two ends of one filter, two answers.
 *
 * A key is the batch's identity (`buying/cart`, `buying/cart--admin`,
 * `buying/cart--p02`); a filename is how it is spelled on disk. Every conversion
 * between the two goes through here, and `audit-tester-plugin-wiring`'s R12
 * blocks a fourth copy.
 *
 * Note `.replace("/", "__")` — the old spelling — replaces only the FIRST slash.
 * Keys have exactly one today, so it happened to work; `replaceAll` is used here
 * so a future two-segment key cannot quietly produce a filename with a `/` in it.
 */

/** `buying/cart--admin` → `buying__cart--admin.json` */
export function batchFileName(key) {
  return `${String(key).replaceAll("/", "__")}.json`;
}

/**
 * Deliberately a separate function from `batchFileName` even though the output is
 * identical today. The two are different concepts — an input batch and a recorded
 * verdict — and `run.mjs` matches one against the other. Naming them apart means a
 * future divergence has to be a deliberate act rather than an accident nobody sees.
 */
export function verdictFileName(key) {
  return batchFileName(key);
}

/** `buying__cart--admin.json` → `buying/cart--admin` */
export function keyFromFileName(file) {
  return String(file)
    .replace(/\.json$/, "")
    .replaceAll("__", "/");
}

/**
 * Split a key into its parts. `slice` is the identity split (main/admin), `chunk`
 * the case-count split added for oversized pages. Both are suffixes on the page
 * key rather than separate fields so one string remains the whole identity.
 */
export function parseKey(key) {
  const s = String(key);
  const [base, ...suffixes] = s.split("--");
  let slice = "main";
  let chunk = null;
  for (const suffix of suffixes) {
    if (suffix === "admin" || suffix === "main" || suffix === "guest") slice = suffix;
    else if (/^p\d+$/.test(suffix)) chunk = Number(suffix.slice(1));
  }
  return { base, slice, chunk };
}

/**
 * The ONE page-filter predicate, used by both `fetch-cases.mjs` (which filters
 * batch objects) and `run.mjs` (which filters files on disk).
 *
 * `--page buying/cart` must select the page and every slice and chunk of it.
 * Matching on equality alone is what dropped the admin slice; matching on
 * `startsWith(page)` alone would make `--page buying/car` select `buying/cart`,
 * so the separator is required.
 */
export function matchesPageFilter(key, page) {
  if (!page) return true;
  const k = String(key);
  const p = String(page);
  return k === p || k.startsWith(`${p}--`);
}

/**
 * `buying/cart--admin--p02` → `buying`.
 *
 * Safe because every suffix the pipeline appends (`--admin`, `--p02`) goes after
 * the page key, never before the `/`.
 */
export function groupFromKey(key) {
  return String(key).split("/")[0];
}

/**
 * The group predicate, for phasing a long sweep one group at a time.
 *
 * 🛑 Filters on the batch's own KEY, not on `batch.groupKey` — the house rule
 * this module exists to enforce. Two reasons beyond consistency: `scope.json`
 * rows carry `key` but not `groupKey`, so a key-based predicate has to exist
 * anyway; and two predicates for one filter is precisely how the two ends of the
 * page filter came to disagree.
 */
export function matchesGroupFilter(key, group) {
  if (!group) return true;
  return groupFromKey(key) === String(group);
}
