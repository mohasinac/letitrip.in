/**
 * Shared sieve-test helpers. Instantiate with `makeSuite()` at the top of
 * each suite file to get a scoped `rec`, `results`, and assertion functions.
 *
 * Every probe / request is given a per-test timeout (REQUEST_TIMEOUT_MS from
 * _http.mjs). A timed-out request records a hard failure so timeouts are
 * always visible in the report rather than crashing the suite.
 */

export function makeSuite(requestFn) {
  const results = [];
  const rec = (name, ok, detail) => results.push({ name, ok, detail });

  // ── Data extractors ────────────────────────────────────────────────────────

  function itemsOf(body) {
    if (Array.isArray(body?.data?.items)) return body.data.items;
    if (Array.isArray(body?.data?.posts)) return body.data.posts; // blog
    if (Array.isArray(body?.data?.users)) return body.data.users; // admin users
    if (Array.isArray(body?.data?.orders)) return body.data.orders; // admin orders
    if (Array.isArray(body?.data)) return body.data;
    return [];
  }

  function countOf(body) {
    return itemsOf(body).length;
  }

  // ── Assertion helpers ──────────────────────────────────────────────────────

  function assertEvery(label, items, predicate) {
    if (!items.length) {
      rec(label, false, "no items returned (cannot verify)");
      return;
    }
    const violations = items.filter((i) => !predicate(i));
    const ok = violations.length === 0;
    const sample = violations
      .slice(0, 3)
      .map((v) => v.id ?? v.slug ?? JSON.stringify(v).slice(0, 40))
      .join(",");
    rec(
      label,
      ok,
      ok
        ? `${items.length}/${items.length} items pass`
        : `${violations.length}/${items.length} violate: ${sample}`,
    );
  }

  function assertSort(label, items, key, direction) {
    if (items.length < 2) {
      rec(label, false, `need >=2 items, got ${items.length}`);
      return;
    }
    const cmp = direction === "asc" ? (a, b) => a <= b : (a, b) => a >= b;
    const getVal = (it) => {
      const v = it[key];
      if (typeof v === "string" && /^\d{4}-\d{2}-\d{2}T/.test(v))
        return Date.parse(v);
      return typeof v === "number" ? v : Number(v) || 0;
    };
    for (let i = 1; i < items.length; i++) {
      const prev = getVal(items[i - 1]);
      const cur = getVal(items[i]);
      if (!cmp(prev, cur)) {
        rec(
          label,
          false,
          `out of order at idx ${i}: ${items[i - 1].id}(${prev}) vs ${items[i].id}(${cur})`,
        );
        return;
      }
    }
    rec(label, true, `${items.length} items in ${direction} order by ${key}`);
  }

  function assertDisjoint(label, aItems, bItems) {
    const aIds = new Set(aItems.map((i) => i.id));
    const overlap = bItems.filter((i) => aIds.has(i.id)).map((i) => i.id);
    rec(
      label,
      overlap.length === 0 && aItems.length > 0 && bItems.length > 0,
      overlap.length === 0
        ? `no overlap (a=${aItems.length} b=${bItems.length})`
        : `overlap=${overlap.length}: ${overlap.slice(0, 3).join(",")}`,
    );
  }

  // ── Network helpers ────────────────────────────────────────────────────────

  async function probe(label, path, opts = {}, predicate = (r) => r.status === 200) {
    const r = await requestFn("GET", path, opts);
    if (r.timedOut) {
      rec(label, false, `TIMEOUT after ${r.timeoutMs}ms`);
      return r;
    }
    const ok = predicate(r);
    rec(label, ok, `status=${r.status} count=${countOf(r.body)} ${r.elapsedMs}ms`);
    return r;
  }

  async function sieveDiff(label, aPath, bPath, opts = {}) {
    const [a, b] = await Promise.all([
      requestFn("GET", aPath, opts),
      requestFn("GET", bPath, opts),
    ]);
    if (a.timedOut || b.timedOut) {
      rec(`sieve diff: ${label}`, false, `TIMEOUT: a=${a.timedOut} b=${b.timedOut}`);
      return;
    }
    const ac = countOf(a.body);
    const bc = countOf(b.body);
    const aFirst = itemsOf(a.body)[0]?.id;
    const bFirst = itemsOf(b.body)[0]?.id;
    const differ = ac !== bc || aFirst !== bFirst;
    rec(
      `sieve diff: ${label}`,
      a.status === 200 && b.status === 200 && differ,
      `a=${a.status}/${ac}/${aFirst ?? "-"} b=${b.status}/${bc}/${bFirst ?? "-"}`,
    );
  }

  return { rec, results, itemsOf, countOf, assertEvery, assertSort, assertDisjoint, probe, sieveDiff };
}
