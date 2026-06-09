/**
 * resolveConversationRole — shared role + seller-owner resolver for the
 * `/api/user/conversations/*` mutating routes.
 *
 * Returns `null` when the caller has no claim to the conversation (the route
 * should respond 404 — never leak the conversation's existence). Otherwise
 * returns the caller's senderRole + the resolved seller-owner UID (used by
 * `pingConversationRtdb` to fan out the per-user RTDB ping).
 *
 * Auth model (matches the read route in `[id]/route.ts`):
 *
 *   - sieveFilter("conv.buyerId", SIEVE_OP.EQ, "= user.uid")                         → "buyer"
 *   - sieveFilter("store.ownerId", SIEVE_OP.EQ, "= user.uid") (own store)            → "seller"
 *   - sieveFilter("user.role", SIEVE_OP.EQ, "= "admin"")                             → "seller" (replies as the store)
 *   - else                                                → null (404)
 */
import { storeRepository } from "@mohasinac/appkit";

export interface ConversationRoleResolution {
  role: "buyer" | "seller";
  sellerOwnerId: string | null;
}

export interface ConversationSubject {
  buyerId: string;
  storeId: string;
}

export interface AuthenticatedUser {
  uid: string;
  role?: string;
}

export async function resolveConversationRole(
  user: AuthenticatedUser,
  conv: ConversationSubject,
): Promise<ConversationRoleResolution | null> {
  if (conv.buyerId === user.uid) {
    const store = await storeRepository.findById(conv.storeId);
    return {
      role: "buyer",
      sellerOwnerId: (store as { ownerId?: string } | null)?.ownerId ?? null,
    };
  }

  const ownStore = await storeRepository.findByOwnerId(user.uid);
  if (ownStore?.id && ownStore.id === conv.storeId) {
    return { role: "seller", sellerOwnerId: user.uid };
  }

  if (user.role === "admin") {
    const ownerStore = await storeRepository.findById(conv.storeId);
    return {
      role: "seller",
      sellerOwnerId:
        (ownerStore as { ownerId?: string } | null)?.ownerId ?? null,
    };
  }

  return null;
}
