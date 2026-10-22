const DEFAULT_TESTER_PHASE_SIZE = 25;
const PRIORITY_GROUPS = ["happy-path"];
function assignDefaultPhases(itemsInCatalogOrder, targetPhaseSize = DEFAULT_TESTER_PHASE_SIZE) {
  const pageOrder = [];
  const pageSize = /* @__PURE__ */ new Map();
  const pageGroup = /* @__PURE__ */ new Map();
  for (const item of itemsInCatalogOrder) {
    const pageId = `${item.groupKey}\u241F${item.pageKey}`;
    if (!pageSize.has(pageId)) {
      pageOrder.push(pageId);
      pageSize.set(pageId, 0);
      pageGroup.set(pageId, item.groupKey);
    }
    pageSize.set(pageId, pageSize.get(pageId) + 1);
  }
  const byGroup = /* @__PURE__ */ new Map();
  for (const pageId of pageOrder) {
    const g = pageGroup.get(pageId);
    if (!byGroup.has(g)) byGroup.set(g, []);
    byGroup.get(g).push(pageId);
  }
  const interleaved = [];
  for (const g of PRIORITY_GROUPS) {
    for (const pageId of byGroup.get(g) ?? []) interleaved.push(pageId);
  }
  const groupsLargestFirst = [...byGroup.entries()].filter(([g]) => !PRIORITY_GROUPS.includes(g)).map(([g, pages]) => ({
    g,
    pages,
    cases: pages.reduce((n, p) => n + pageSize.get(p), 0)
  })).sort((a, b) => b.cases - a.cases || a.g.localeCompare(b.g)).map((e) => e.g);
  const cursor = new Map(groupsLargestFirst.map((g) => [g, 0]));
  let remaining = pageOrder.length - interleaved.length;
  while (remaining > 0) {
    for (const g of groupsLargestFirst) {
      const i = cursor.get(g);
      const pages = byGroup.get(g);
      if (i >= pages.length) continue;
      interleaved.push(pages[i]);
      cursor.set(g, i + 1);
      remaining--;
    }
  }
  const phaseOfPage = /* @__PURE__ */ new Map();
  let currentPhase = 1;
  let currentPhaseCount = 0;
  for (const pageId of interleaved) {
    const size = pageSize.get(pageId);
    if (currentPhaseCount > 0 && currentPhaseCount >= targetPhaseSize) {
      currentPhase += 1;
      currentPhaseCount = 0;
    }
    phaseOfPage.set(pageId, currentPhase);
    currentPhaseCount += size;
  }
  return itemsInCatalogOrder.map(
    (item) => phaseOfPage.get(`${item.groupKey}\u241F${item.pageKey}`)
  );
}
export {
  DEFAULT_TESTER_PHASE_SIZE,
  PRIORITY_GROUPS,
  assignDefaultPhases
};
