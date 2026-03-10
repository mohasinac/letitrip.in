"use server";

/**
 * Blog Server Actions (admin only)
 *
 * CRUD mutations for blog posts — call blogRepository directly,
 * bypassing the service → apiClient → API route chain.
 */

import { z } from "zod";
import { requireRole } from "@/lib/firebase/auth-server";
import { blogRepository } from "@/repositories";
import { serverLogger } from "@/lib/server-logger";
import { rateLimitByIdentifier, RateLimitPresets } from "@/lib/security";
import {
  AuthorizationError,
  NotFoundError,
  ValidationError,
} from "@/lib/errors";
import type {
  BlogPostDocument,
  BlogPostCreateInput,
  BlogPostUpdateInput,
} from "@/db/schema";

// ─── Schemas ──────────────────────────────────────────────────────────────

const createBlogPostSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  excerpt: z.string().min(1),
  content: z.string().min(1),
  category: z.enum(["news", "tips", "guides", "updates", "community"]),
  tags: z.array(z.string()).default([]),
  isFeatured: z.boolean().default(false),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  coverImage: z.string().optional(),
  authorId: z.string().min(1),
  authorName: z.string().min(1),
  authorAvatar: z.string().optional(),
  readTimeMinutes: z.number().int().min(1).default(5),
  publishedAt: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
});

const updateBlogPostSchema = createBlogPostSchema.partial();

const blogIdSchema = z.object({
  id: z.string().min(1, "id is required"),
});

export type CreateBlogPostInput = z.infer<typeof createBlogPostSchema>;
export type UpdateBlogPostInput = z.infer<typeof updateBlogPostSchema>;

// ─── Server Actions ────────────────────────────────────────────────────────

export async function createBlogPostAction(
  input: CreateBlogPostInput,
): Promise<BlogPostDocument> {
  const admin = await requireRole(["admin", "moderator"]);

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

  const data = parsed.data as BlogPostCreateInput;
  const post = await blogRepository.create(data);

  serverLogger.info("createBlogPostAction", {
    adminId: admin.uid,
    postId: post.id,
  });
  return post;
}

export async function updateBlogPostAction(
  id: string,
  input: UpdateBlogPostInput,
): Promise<BlogPostDocument> {
  const admin = await requireRole(["admin", "moderator"]);

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

  const existing = await blogRepository.findById(id);
  if (!existing) throw new NotFoundError("Blog post not found");

  const post = await blogRepository.update(
    id,
    parsed.data as BlogPostUpdateInput,
  );

  serverLogger.info("updateBlogPostAction", { adminId: admin.uid, postId: id });
  return post;
}

export async function deleteBlogPostAction(id: string): Promise<void> {
  const admin = await requireRole(["admin", "moderator"]);

  const rl = await rateLimitByIdentifier(
    `blog:delete:${admin.uid}`,
    RateLimitPresets.API,
  );
  if (!rl.success)
    throw new AuthorizationError("Too many requests. Please slow down.");

  const idParsed = blogIdSchema.safeParse({ id });
  if (!idParsed.success) throw new ValidationError("Invalid id");

  const existing = await blogRepository.findById(id);
  if (!existing) throw new NotFoundError("Blog post not found");

  await blogRepository.delete(id);

  serverLogger.info("deleteBlogPostAction", { adminId: admin.uid, postId: id });
}
