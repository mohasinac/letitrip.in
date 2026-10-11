"use server";

import { wrapAction, type ActionResult } from "@mohasinac/appkit/server";
/**
 * Blog Server Actions -- thin entrypoints.
 * Business logic lives in @mohasinac/appkit/features/blog/actions.
 */

import { z } from "zod";
import { requireRoleUser } from "@mohasinac/appkit/providers/auth-firebase/helpers";
import { rateLimitByIdentifier, RateLimitPresets } from "@mohasinac/appkit/security/rate-limit";
import { AuthorizationError } from "@mohasinac/appkit/errors/authorization-error";
import { NotFoundError } from "@mohasinac/appkit/errors/not-found-error";
import { ValidationError } from "@mohasinac/appkit/errors/validation-error";
import { createBlogPost, updateBlogPost, deleteBlogPost, getBlogPostById, listBlogPosts, getFeaturedBlogPosts, getLatestBlogPosts, getBlogPostBySlug } from "@mohasinac/appkit/features/blog/actions/blog-actions";
import { createBlogPostSchema, updateBlogPostSchema } from "@mohasinac/appkit/features/blog/actions/blog-actions";
import type { CreateBlogPostInput, UpdateBlogPostInput } from "@mohasinac/appkit/features/blog/actions/blog-actions";
import type { BlogPostDocument } from "@mohasinac/appkit/features/blog/schemas/firestore";
import type { FirebaseSieveResult } from "@mohasinac/appkit/providers/db-firebase/sieve";
import { ERR_RATE_LIMIT, ERR_INVALID_UPDATE } from "./_constants";


const blogIdSchema = z.object({ id: z.string().min(1, "id is required") });

export async function createBlogPostAction(
  input: CreateBlogPostInput,
): Promise<ActionResult<BlogPostDocument>> {
  return wrapAction(async () => {
    const admin = await requireRoleUser(["admin", "moderator"]);
    
      const rl = await rateLimitByIdentifier(
        `blog:create:${admin.uid}`,
        RateLimitPresets.API,
      );
      if (!rl.success)
        throw new AuthorizationError(ERR_RATE_LIMIT);
    
      const parsed = createBlogPostSchema.safeParse(input);
      if (!parsed.success)
        throw new ValidationError(
          parsed.error.issues[0]?.message ?? "Invalid blog post data",
        );
    
      return createBlogPost(parsed.data, {
        uid: admin.uid,
        name: admin.name ?? undefined,
        email: admin.email ?? undefined,
        picture: admin.picture ?? undefined,
      });
  });
}

export async function updateBlogPostAction(
  id: string,
  input: UpdateBlogPostInput,
): Promise<ActionResult<BlogPostDocument>> {
  return wrapAction(async () => {
    const admin = await requireRoleUser(["admin", "moderator"]);
    
      const rl = await rateLimitByIdentifier(
        `blog:update:${admin.uid}`,
        RateLimitPresets.API,
      );
      if (!rl.success)
        throw new AuthorizationError(ERR_RATE_LIMIT);
    
      const idParsed = blogIdSchema.safeParse({ id });
      if (!idParsed.success) throw new ValidationError("Invalid id");
    
      const parsed = updateBlogPostSchema.safeParse(input);
      if (!parsed.success)
        throw new ValidationError(
          parsed.error.issues[0]?.message ?? ERR_INVALID_UPDATE,
        );
    
      const existing = await getBlogPostById(id);
      if (!existing) throw new NotFoundError("Blog post not found");
    
      return updateBlogPost(id, parsed.data);
  });
}

export async function deleteBlogPostAction(id: string): Promise<void> {
  const admin = await requireRoleUser(["admin", "moderator"]);

  const rl = await rateLimitByIdentifier(
    `blog:delete:${admin.uid}`,
    RateLimitPresets.API,
  );
  if (!rl.success)
    throw new AuthorizationError(ERR_RATE_LIMIT);

  const idParsed = blogIdSchema.safeParse({ id });
  if (!idParsed.success) throw new ValidationError("Invalid id");

  const existing = await getBlogPostById(id);
  if (!existing) throw new NotFoundError("Blog post not found");

  return deleteBlogPost(id);
}

export async function listBlogPostsAction(params?: {
  filters?: string;
  sorts?: string;
  page?: number;
  pageSize?: number;
  category?: string;
}): Promise<ActionResult<FirebaseSieveResult<BlogPostDocument>>> {
  return wrapAction(async () => {
    return listBlogPosts(params);
  });
}

export async function getFeaturedBlogPostsAction(
  count = 3,
): Promise<ActionResult<BlogPostDocument[]>> {
  return wrapAction(async () => {
    return getFeaturedBlogPosts(count);
  });
}

export async function getLatestBlogPostsAction(
  count = 5,
): Promise<ActionResult<BlogPostDocument[]>> {
  return wrapAction(async () => {
    return getLatestBlogPosts(count);
  });
}

export async function getBlogPostBySlugAction(
  slug: string,
): Promise<ActionResult<BlogPostDocument | null>> {
  return wrapAction(async () => {
    return getBlogPostBySlug(slug);
  });
}
