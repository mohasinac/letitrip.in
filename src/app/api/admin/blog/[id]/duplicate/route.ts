import { withProviders } from "@/providers.config";
import { blogRepository } from "@mohasinac/appkit/features/blog/repository/blog.repository";
import { successResponse, errorResponse } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import type { BlogPostDocument } from "@mohasinac/appkit/features/blog/schemas/firestore";
import { generateBlogPostId } from "@mohasinac/appkit/utils/id-generators";
import { ROLES_ADMIN_ONLY } from "@/constants";

/**
 * POST /api/admin/blog/[id]/duplicate — clone a post as a fresh draft.
 *
 * Mirrors `POST /api/store/products/[id]/duplicate`, which is the established
 * shape: strip identity, strip analytics, force `draft`, suffix the title, and
 * return `{ id }` so the caller can navigate straight to the new draft's
 * editor — which is the entire point of a one-click clone.
 *
 * 🛑 ADMIN ONLY, matching `OwnerQuickActions`' clone affordance, which is gated
 * on `useIsAdmin()` rather than on the owner check the pencil and bin use. A
 * post has an `authorId` but no store, so there is no seller-scoped variant to
 * build here; widening this to authors would hand a capability to a role the UI
 * deliberately does not offer it to.
 *
 * @tag domain:blog
 * @tag layer:route
 * @tag access:admin
 */

const ERR_NOT_FOUND = "Blog post not found";

export const POST = withProviders(
  createRouteHandler({
    auth: true,
    roles: ROLES_ADMIN_ONLY,
    permission: "blog:write",
    handler: async ({ params }) => {
      const id = (params as { id: string }).id;
      const post = await blogRepository.findById(id);
      if (!post) return errorResponse(ERR_NOT_FOUND, 404);

      /*
       * Identity is regenerated, never copied: `slug` is derived from the title
       * by the repository, and a copied slug would collide with the source —
       * blog ids ARE their slug (pure-slug resource), so reusing it would
       * overwrite the original rather than create a copy.
       *
       * Analytics start at zero. `views` is the post's own measured reach;
       * inheriting the source's would state something false about a draft
       * nobody has read, and the number is the one thing an editor judges a
       * post by.
       *
       * `publishedAt` goes too — it is the moment of publication, and this
       * clone has not been published. Carrying it would date a new draft to
       * the original's publication and sort it there in every listing.
       *
       * `isFeatured` is NOT inherited: two featured copies of one post is a
       * homepage defect, and the editor can re-feature deliberately.
       */
      const {
        id: _id,
        slug: _slug,
        createdAt: _createdAt,
        updatedAt: _updatedAt,
        publishedAt: _publishedAt,
        views: _views,
        isFeatured: _isFeatured,
        ...clonable
      }: BlogPostDocument = post;

      /*
       * 🛑 A NEW slug, derived from the new title — not the source's.
       * Blog is a pure-slug resource (id === slug), so reusing it would
       * overwrite the original instead of creating a copy. `views` is omitted
       * from `BlogPostCreateInput` entirely, so the repository owns the zero.
       */
      const title = `${post.title} (Copy)`;
      const created = await blogRepository.create({
        ...clonable,
        title,
        slug: generateBlogPostId({ title, category: post.category, status: "draft" }),
        status: "draft",
        isFeatured: false,
      });

      return successResponse({ id: created.id });
    },
  }),
);
