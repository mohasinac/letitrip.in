"use server";

/**
 * Blog Server Actions -- thin entrypoints.
 * Business logic lives in @mohasinac/appkit/features/blog/actions.
 */

import { z } from "zod";
import { requireRoleUser } from "@mohasinac/appkit/providers/auth-firebase";
import {
  rateLimitByIdentifier,
  RateLimitPresets,
} from "@mohasinac/appkit/security";
import {
  AuthorizationError,
  NotFoundError,
  ValidationError,
} from "@mohasinac/appkit/errors";
import {
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
  getBlogPostById,
  listBlogPosts,
  getFeaturedBlogPosts,
  getLatestBlogPosts,
  getBlogPostBySlug,
} from "@mohasinac/appkit/features/blog/server";
import {
  createBlogPostSchema,
  updateBlogPostSchema,
  type CreateBlogPostInput,
  type UpdateBlogPostInput,
} from "@mohasinac/appkit/features/blog";
import type { BlogPostDocument } from "@/db/schema/blog-posts";
import type { FirebaseSieveResult } from "@mohasinac/appkit/providers/db-firebase";

export type { CreateBlogPostInput, UpdateBlogPostInput };

const blogIdSchema = z.object({ id: z.string().min(1, "id is required") });

export async function createBlogPostAction(
  input: CreateBlogPostInput,
): Promise<BlogPostDocument> {
  const admin = await requireRoleUser(["admin", "moderator"]);

  const rl = await rateLimitByIdentifier(
    `blog:create:${admin.uid}`,
    RateLimitPresets.API,
  );
  if (!rl.success)
    throw new AuthorizationError("Too many requests. Please slow down.");

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
}

export async function updateBlogPostAction(
  id: string,
  input: UpdateBlogPostInput,
): Promise<BlogPostDocument> {
  const admin = await requireRoleUser(["admin", "moderator"]);

  const rl = await rateLimitByIdentifier(
    `blog:update:${admin.uid}`,
    RateLimitPresets.API,
  );
  if (!rl.success)
    throw new AuthorizationError("Too many requests. Please slow down.");

  const idParsed = blogIdSchema.safeParse({ id });
  if (!idParsed.success) throw new ValidationError("Invalid id");

  const parsed = updateBlogPostSchema.safeParse(input);
  if (!parsed.success)
    throw new ValidationError(
      parsed.error.issues[0]?.message ?? "Invalid update data",
    );

  const existing = await getBlogPostById(id);
  if (!existing) throw new NotFoundError("Blog post not found");

  return updateBlogPost(id, parsed.data);
}

export async function deleteBlogPostAction(id: string): Promise<void> {
  const admin = await requireRoleUser(["admin", "moderator"]);

  const rl = await rateLimitByIdentifier(
    `blog:delete:${admin.uid}`,
    RateLimitPresets.API,
  );
  if (!rl.success)
    throw new AuthorizationError("Too many requests. Please slow down.");

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
}): Promise<FirebaseSieveResult<BlogPostDocument>> {
  return listBlogPosts(params);
}

export async function getFeaturedBlogPostsAction(
  count = 3,
): Promise<BlogPostDocument[]> {
  return getFeaturedBlogPosts(count);
}

export async function getLatestBlogPostsAction(
  count = 5,
): Promise<BlogPostDocument[]> {
  return getLatestBlogPosts(count);
}

export async function getBlogPostBySlugAction(
  slug: string,
): Promise<BlogPostDocument | null> {
  return getBlogPostBySlug(slug);
}
