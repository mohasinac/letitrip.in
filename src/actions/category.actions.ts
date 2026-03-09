"use server";

/**
 * Category Server Actions
 *
 * Admin-only mutations for categories that call the repository directly,
 * bypassing the service → apiClient → API route chain.
 */

import { requireRole } from "@/lib/firebase/auth-server";
import { categoriesRepository } from "@/repositories";
import { serverLogger } from "@/lib/server-logger";
import { rateLimitByIdentifier, RateLimitPresets } from "@/lib/security";
import { AuthorizationError, ValidationError } from "@/lib/errors";
import { categoryCreateSchema } from "@/lib/validation/schemas";
import type {
  CategoryDocument,
  CategoryCreateInput,
} from "@/db/schema/categories";

export type CreateCategoryInput = {
  name: string;
  parentId?: string;
  description?: string;
  display?: {
    icon?: string;
    coverImage?: string;
    color?: string;
    showInMenu?: boolean;
    showInFooter?: boolean;
  };
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
};

/**
 * Create a new category (admin only).
 *
 * Validates input with Zod, rate-limits by uid, then calls
 * `categoriesRepository.createWithHierarchy()` directly.
 */
export async function createCategoryAction(
  input: CreateCategoryInput,
): Promise<CategoryDocument> {
  const admin = await requireRole(["admin"]);

  const rl = await rateLimitByIdentifier(
    `category:create:${admin.uid}`,
    RateLimitPresets.API,
  );
  if (!rl.success)
    throw new AuthorizationError("Too many requests. Please slow down.");

  const parsed = categoryCreateSchema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError(
      parsed.error.issues[0]?.message ?? "Invalid category data",
    );
  }

  const body = parsed.data;
  const categoryData: CategoryCreateInput = {
    ...body,
    createdBy: admin.uid,
    isActive: true,
    isSearchable: true,
    order: 0,
    isFeatured: false,
    featuredPriority: 0,
    rootId: "",
    parentIds: body.parentId ? [body.parentId] : [],
    childrenIds: [],
    tier: 0,
    path: "",
    slug: "",
    seo: {
      title: body.seo?.title || body.name,
      description:
        body.seo?.description ||
        body.description ||
        `Browse ${body.name} category`,
      keywords: body.seo?.keywords || [],
    },
    display: body.display || { showInMenu: true, showInFooter: false },
  };

  const category = await categoriesRepository.createWithHierarchy(categoryData);

  serverLogger.debug("createCategoryAction", {
    adminId: admin.uid,
    categoryId: category.id,
  });

  return category;
}
