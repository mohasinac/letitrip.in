import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@mohasinac/appkit", () => ({
  storeRepository: {
    findById: vi.fn(),
    findByOwnerId: vi.fn(),
  },
  isAdminUser: vi.fn((u: { role?: string }) => u.role === "admin"),
}));

import { resolveConversationRole } from "../conversations/authorise";
import { storeRepository, isAdminUser } from "@mohasinac/appkit";

function conv() {
  return { buyerId: "buyer-uid", storeId: "store-A" };
}

beforeEach(() => {
  vi.clearAllMocks();
  (storeRepository.findById as ReturnType<typeof vi.fn>).mockResolvedValue({
    id: "store-A",
    ownerId: "seller-uid",
  });
  (storeRepository.findByOwnerId as ReturnType<typeof vi.fn>).mockResolvedValue(null);
});

describe("resolveConversationRole", () => {
  it("user.uid === conv.buyerId → role: buyer", async () => {
    const result = await resolveConversationRole({ uid: "buyer-uid" }, conv());
    expect(result?.role).toBe("buyer");
  });

  it("user.uid === conv.buyerId → sellerOwnerId from store.ownerId", async () => {
    const result = await resolveConversationRole({ uid: "buyer-uid" }, conv());
    expect(result?.sellerOwnerId).toBe("seller-uid");
  });

  it("user is store owner (ownStore.id === conv.storeId) → role: seller", async () => {
    (storeRepository.findByOwnerId as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "store-A",
      ownerId: "seller-uid",
    });
    const result = await resolveConversationRole({ uid: "seller-uid" }, conv());
    expect(result?.role).toBe("seller");
    expect(result?.sellerOwnerId).toBe("seller-uid");
  });

  it("admin user → role: seller (replies as store)", async () => {
    (isAdminUser as ReturnType<typeof vi.fn>).mockReturnValue(true);
    (storeRepository.findByOwnerId as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    const result = await resolveConversationRole({ uid: "admin-uid", role: "admin" }, conv());
    expect(result?.role).toBe("seller");
  });

  it("admin user → sellerOwnerId from the store's ownerId", async () => {
    (isAdminUser as ReturnType<typeof vi.fn>).mockReturnValue(true);
    (storeRepository.findByOwnerId as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    const result = await resolveConversationRole({ uid: "admin-uid", role: "admin" }, conv());
    expect(result?.sellerOwnerId).toBe("seller-uid");
  });

  it("unrelated user (not buyer, not owner, not admin) → null", async () => {
    (storeRepository.findByOwnerId as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    (isAdminUser as ReturnType<typeof vi.fn>).mockReturnValue(false);
    const result = await resolveConversationRole({ uid: "other-uid" }, conv());
    expect(result).toBeNull();
  });

  it("buyer who is also admin → role: buyer (buyer checked first)", async () => {
    (isAdminUser as ReturnType<typeof vi.fn>).mockReturnValue(true);
    const result = await resolveConversationRole({ uid: "buyer-uid", role: "admin" }, conv());
    // buyerId === user.uid check comes first
    expect(result?.role).toBe("buyer");
  });
});
