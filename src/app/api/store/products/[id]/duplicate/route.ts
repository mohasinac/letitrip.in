import { withProviders } from "@/providers.config";
import {
  createRouteHandler,
  successResponse,
  errorResponse,
  productRepository,
  storeRepository,
  isAdminUser,
  isEmployeeUser,
} from "@mohasinac/appkit";
import type { ProductDocument } from "@mohasinac/appkit";
import { ROLES_STORE_WRITE } from "@/constants";
import { USER_ROLE } from "@/constants";

const ERR_PRODUCT_NOT_FOUND = "Product not found";

const ROLES = [...ROLES_STORE_WRITE, USER_ROLE.EMPLOYEE];

async function loadScopedProduct(
  user: { uid: string },
  isPrivileged: boolean,
  id: string,
) {
  const product = await productRepository.findById(id);
  if (!product) return null;
  if (isPrivileged) return product;
  const store = await storeRepository.findByOwnerId(user.uid);
  if (!store || product.storeId !== store.id) return null;
  return product;
}

export const POST = withProviders(
  createRouteHandler({
    auth: true,
    roles: ROLES,
    permission: "store:api:write",
    handler: async ({ params, user }) => {
      const id = (params as { id: string }).id;
      const privileged = isAdminUser(user) || isEmployeeUser(user);
      const product = await loadScopedProduct(user!, privileged, id);
      if (!product) return errorResponse(ERR_PRODUCT_NOT_FOUND, 404);

      // S-STORE-2-C — clone an existing listing as a new draft. Strips
      // identity fields (id/slug/barcodeId — auto-generated fresh),
      // analytics (viewCount/avgRating/reviewCount), auction bid state, and
      // group membership (a duplicate starts standalone, not silently
      // joined to the source listing's group).
      const {
        id: _id,
        createdAt: _createdAt,
        updatedAt: _updatedAt,
        slug: _slug,
        barcodeId: _barcodeId,
        viewCount: _viewCount,
        avgRating: _avgRating,
        reviewCount: _reviewCount,
        groupId: _groupId,
        isGroupParent: _isGroupParent,
        groupParentSlug: _groupParentSlug,
        groupChildSlugs: _groupChildSlugs,
        groupTitle: _groupTitle,
        bidCount: _bidCount,
        currentBid: _currentBid,
        leadingBidderId: _leadingBidderId,
        auctionOriginalEndDate: _auctionOriginalEndDate,
        ...clonable
      }: ProductDocument = product;

      const created = await productRepository.create({
        ...clonable,
        title: `${product.title} (Copy)`,
        status: "draft",
      });
      return successResponse({ id: created.id });
    },
  }),
);
