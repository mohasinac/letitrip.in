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
import { serverLogger } from "@mohasinac/appkit/monitoring";
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
  coerceMediaField,
  getMediaUrl,
  type MediaField,
} from "@mohasinac/appkit/utils";
import type {
  BlogPostDocument,
  BlogPostCreateInput,
  BlogPostUpdateInput,
} from "@/db/schema";
import type { FirebaseSieveResult, SieveModel } from "@mohasinac/appkit/providers/db-firebase";
import {
  finalizeStagedMediaField,
  finalizeStagedMediaObject,
  finalizeStagedMediaObjectArray,
} from "@mohasinac/appkit/features/media";

const singleImageMediaSchema = z
  .union([
    z.object({
      url: z.string().url(),
      type: z.enum(["image", "video", "file"]),
      alt: z.string().optional(),
      thumbnailUrl: z.string().url().optional(),
    }),
    z.string().url().transform((url) => ({ url, type: "image" as const })),
  ])
  .nullable()
  .optional();

const mediaFieldSchema = z.object({
  url: z.string().url(),
  type: z.enum(["image", "video", "file"]),
  alt: z.string().optional(),
  thumbnailUrl: z.string().url().optional(),
});

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
  coverImage: singleImageMediaSchema,
  contentImages: z.array(mediaFieldSchema).max(10).optional().default([]),
  additionalImages: z.array(mediaFieldSchema).max(5).optional().default([]),
  authorId: z.string().min(1).optional(),
  authorName: z.string().min(1).optional(),
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

  const finalizedCoverUrl = await finalizeStagedMediaField(
    getMediaUrl(parsed.data.coverImage),
  );
  const finalizedCoverImage = await finalizeStagedMediaObject(
    coerceMediaField(parsed.data.coverImage ?? finalizedCoverUrl ?? null) as
      | MediaField
      | null,
  );
  const finalizedContentImages = await finalizeStagedMediaObjectArray(
    parsed.data.contentImages,
  );
  const finalizedAdditionalImages = await finalizeStagedMediaObjectArray(
    parsed.data.additionalImages,
  );

  const data = {
    ...parsed.data,
    coverImage: finalizedCoverImage ?? null,
    contentImages: finalizedContentImages,
    additionalImages: finalizedAdditionalImages,
    authorId: parsed.data.authorId?.trim() || admin.uid,
    authorName:
      parsed.data.authorName?.trim() ||
      admin.name ||
      admin.email?.split("@")[0] ||
      "Admin",
    authorAvatar: parsed.data.authorAvatar || admin.picture,
  } as BlogPostCreateInput;
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

  const finalizedCoverUrl = await finalizeStagedMediaField(
    getMediaUrl(parsed.data.coverImage),
  );
  const finalizedCoverImage = parsed.data.coverImage === null
    ? null
    : await finalizeStagedMediaObject(
        coerceMediaField(parsed.data.coverImage ?? finalizedCoverUrl ?? null) as
          | MediaField
          | null,
      );
  const finalizedContentImages = parsed.data.contentImages
    ? await finalizeStagedMediaObjectArray(parsed.data.contentImages)
    : undefined;
  const finalizedAdditionalImages = parsed.data.additionalImages
    ? await finalizeStagedMediaObjectArray(parsed.data.additionalImages)
    : undefined;

  const post = await blogRepository.update(id, {
    ...parsed.data,
    coverImage:
      parsed.data.coverImage === null ? null : (finalizedCoverImage ?? undefined),
    contentImages: finalizedContentImages,
    additionalImages: finalizedAdditionalImages,
  } as BlogPostUpdateInput);

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

// ─── Read Actions ─────────────────────────────────────────────────────────────

export async function listBlogPostsAction(params?: {
  filters?: string;
  sorts?: string;
  page?: number;
  pageSize?: number;
  category?: string;
}): Promise<FirebaseSieveResult<BlogPostDocument>> {
  const sieve: SieveModel = {
    sorts: params?.sorts ?? "-publishedAt",
    page: params?.page ?? 1,
    pageSize: params?.pageSize ?? 10,
  };
  return blogRepository.listPublished(
    { category: params?.category as any },
    sieve,
  );
}

export async function getFeaturedBlogPostsAction(
  count = 3,
): Promise<BlogPostDocument[]> {
  const result = await blogRepository.listPublished(
    { featuredOnly: true },
    { sorts: "-publishedAt", page: 1, pageSize: count },
  );
  return result.items;
}

export async function getLatestBlogPostsAction(
  count = 5,
): Promise<BlogPostDocument[]> {
  const result = await blogRepository.listPublished(
    {},
    { sorts: "-publishedAt", page: 1, pageSize: count },
  );
  return result.items;
}

export async function getBlogPostBySlugAction(
  slug: string,
): Promise<BlogPostDocument | null> {
  return blogRepository.findBySlug(slug);
}

