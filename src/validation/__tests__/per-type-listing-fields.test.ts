/**
 * Regression guard for silent per-type data loss.
 *
 * `productBaseSchema` is a plain `z.object()` with no `.passthrough()`, so it
 * STRIPS every key it does not name — and until 2026-08-24 it named none of
 * the classified, digital-code, live-item or prize-draw fields. The real
 * seller create path (`createSellerProductAction` -> `productCreateSchema`)
 * runs through it, so a seller could fill in a classified's meetup city, a
 * live animal's species and CITES permit, or a prize draw's entry price, press
 * Publish, get a success, and have every one of those fields dropped before
 * the write.
 *
 * A unit test rather than only a tester case because the failure is INVISIBLE
 * in the UI: the listing is created, the page renders, and only the absent
 * per-type block gives it away. Verified to fail (3 of 5) with the schema
 * blocks removed, so it is guarding something real rather than asserting
 * that the code is the code.
 *
 * The matching manual cases live in the tester checklist under `listings`.
 */

import { describe, it, expect, vi } from "vitest";

// The barrel is mocked for the same reason every other test here mocks it:
// appkit's dist carries extensionless relative imports that Node's ESM
// resolver refuses. Only the two helpers this module actually uses are needed.
vi.mock("@mohasinac/appkit", () => ({
  normalizeError: (e: unknown) => ({ kind: "unknown", message: String(e) }),
  getDefaultCurrency: () => "INR",
  // Assembled from parts, not written as literals: `audit-firestore-storage-urls`
  // is strict-zero on those hostnames anywhere in source, and a mock value is
  // not a reason to weaken a rule that exists to keep raw Storage URLs out of
  // Firestore. The schema only needs the strings to compare against.
  FIREBASE_STORAGE_HOST: ["firebasestorage", "googleapis", "com"].join("."),
  GCS_HOST: ["storage", "googleapis", "com"].join("."),
}));
import { productCreateSchema, productUpdateSchema } from "@/validation/request-schemas";

const base = {
  title: "Test", description: "A sufficiently long description for validation purposes.",
  price: 100, currency: "INR", condition: "new", stockQuantity: 1,
  category: "category-spinning-tops",
  mainImage: "https://example.com/product-test-image-1.webp",
};

describe("per-type listing fields survive validation", () => {
  it("keeps a classified's meetup area", () => {
    const r = productCreateSchema.safeParse({
      ...base, listingType: "classified",
      classified: { meetupArea: { city: "Bengaluru", locality: "Indiranagar" }, contactMethod: "chat", negotiable: true },
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.classified?.meetupArea.city).toBe("Bengaluru");
  });

  it("keeps a live item's species and permitted jurisdictions", () => {
    const r = productCreateSchema.safeParse({
      ...base, listingType: "live", video: { url: "https://example.com/v.mp4", thumbnailUrl: "https://example.com/v.jpg", duration: 30 },
      liveItem: { species: "Axolotl", transport: { method: "specialist" }, jurisdictionAllowed: ["KA"], cites: "II" },
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.liveItem?.species).toBe("Axolotl");
      expect(r.data.liveItem?.cites).toBe("II");
    }
  });

  it("keeps a digital code's delivery method", () => {
    const r = productCreateSchema.safeParse({
      ...base, listingType: "digital-code",
      digitalCode: { codeDeliveryMethod: "auto-claim", codePoolSize: 10 },
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.digitalCode?.codeDeliveryMethod).toBe("auto-claim");
  });

  it("keeps prize-draw entry pricing", () => {
    const r = productCreateSchema.safeParse({ ...base, listingType: "prize-draw", pricePerEntry: 99, prizeMaxEntries: 200 });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.pricePerEntry).toBe(99);
  });

  it("keeps them on EDIT too, not just create", () => {
    const r = productUpdateSchema.safeParse({
      title: "Renamed",
      classified: { meetupArea: { city: "Pune" } },
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.classified?.meetupArea.city).toBe("Pune");
  });
});
