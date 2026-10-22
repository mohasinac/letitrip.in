// Proves the per-batch fixture mechanism without touching the network:
// substitution, worker disjointness, seed/teardown symmetry, and that teardown
// runs on failure. Uses a fake db so it is safe to run anywhere.
import { loadManifest, seedFixtures, teardownFixtures, substituteWorker, at } from "./lib/fixtures.mjs";

function fakeDb() {
  const store = new Map();
  return {
    store,
    collection: (c) => ({
      doc: (id) => ({
        set: async (data) => void store.set(`${c}/${id}`, data),
        delete: async () => void store.delete(`${c}/${id}`),
      }),
    }),
  };
}

const ok = (n, cond) => console.log(`  ${cond ? "PASS" : "FAIL"}  ${n}`);
let failures = 0;
const check = (n, cond) => { if (!cond) failures++; ok(n, cond); };

// 1. substitution, including nested and array values
check("{{w}} substitutes in strings", substituteWorker("auction-{{w}}-live", "w3") === "auction-w3-live");
check("substitutes inside nested objects", substituteWorker({ a: { b: "x-{{w}}" } }, "w2").a.b === "x-w2");
check("substitutes inside arrays", substituteWorker(["a-{{w}}"], "w5")[0] === "a-w5");
check("leaves Dates alone", substituteWorker({ d: new Date(0) }, "w1").d instanceof Date);

// 2. a manifest resolves, and identity/chunk suffixes are stripped
const m1 = await loadManifest(process.cwd(), "buying/bidding");
const m2 = await loadManifest(process.cwd(), "buying/bidding--guest--p2");
check("manifest loads for a page", m1.length > 0);
check("identity+chunk suffixes strip to the same manifest", m1.length === m2.length);
check("a page with no manifest returns []", (await loadManifest(process.cwd(), "seo/page-metadata")).length === 0);

// 3. seed writes exactly what it reports, namespaced by worker
const db = fakeDb();
const written = await seedFixtures(db, m1, "w3");
check("seed reports what it wrote", written.length === m1.length && db.store.size === m1.length);
check("every id carries the worker slot", written.every((w) => w.id.includes("w3")));
check("no {{w}} survives into the db", [...db.store.keys()].every((k) => !k.includes("{{w}}")));

// 4. THE ONE THAT MATTERS FOR 5 WORKERS — disjointness
const dbB = fakeDb();
const writtenB = await seedFixtures(dbB, m1, "w5");
const overlap = written.filter((a) => writtenB.some((b) => a.collection === b.collection && a.id === b.id));
check("two workers on the SAME page write disjoint ids", overlap.length === 0);

// 5. teardown removes exactly what was created
const failed = await teardownFixtures(db, written);
check("teardown removes everything", db.store.size === 0 && failed.length === 0);

// 6. teardown survives an undeletable row rather than stranding the rest
const dbC = fakeDb();
const w = await seedFixtures(dbC, m1, "w1");
const brittle = {
  collection: (c) => ({
    doc: (id) => ({
      set: async () => {},
      delete: async () => {
        if (id.endsWith("-live")) throw new Error("simulated delete failure");
        dbC.store.delete(`${c}/${id}`);
      },
    }),
  }),
};
const failed2 = await teardownFixtures(brittle, w);
check("one undeletable row does not strand the others", failed2.length === 1 && dbC.store.size === 1);

// 7. dates are absolute offsets, never a shared window
const live = m1.find((f) => f.id.endsWith("-live")).data();
const ended = m1.find((f) => f.id.endsWith("-ended")).data();
check("a live auction ends in the FUTURE", live.auctionEndDate.getTime() > Date.now());
check("an ended auction ended in the PAST", ended.auctionEndDate.getTime() < Date.now());
check("at.hoursFromNow is absolute", Math.abs(at.hoursFromNow(2).getTime() - (Date.now() + 7200_000)) < 5000);

console.log(failures ? `\n${failures} FAILURE(S)` : "\nall checks passed");
process.exit(failures ? 1 : 0);
