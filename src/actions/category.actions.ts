"use server";

/**
 * Category Server Actions — thin entrypoints.
 * Business logic lives in @mohasinac/appkit/features/categories/actions.
 */

import { z } from "zod";
import { requireRoleUser } from "@mohasinac/appkit";
import {
  rateLimitByIdentifier,
  RateLimitPresets,
} from "@mohasinac/appkit";
import {
  AuthorizationError,
  NotFoundError,
  ValidationError,
} from "@mohasinac/appkit";
import {
  categoryCreateSchema,
  categoryUpdateSchema,
} from "@/validation/request-schemas";
import {
  createCategory,
  updateCategory,
  deleteCategory,
  listCategories,
  listTopLevelCategories,
  listBrandCategories,
  getCategoryById,
  getCategoryBySlug,
  getCategoryChildren,
  fetchCategoryTree,
} from "@mohasinac/appkit";
import type {
  CategoryDocument,
  CategoryUpdateInput,
  CategoryTreeNode,
} from "@mohasinac/appkit";
import type { FirebaseSieveResult } from "@mohasinac/appkit";

const categoryIdSchema = z.object({ id: z.string().min(1, "id is required") });

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

export async function createCategoryAction(
  input: CreateCategoryInput,
): Promise<CategoryDocument> {
  const admin = await requireRoleUser(["admin"]);

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
  return createCategory(
    {
      ...body,
      isActive: true,
      isSearchable: true,
      order: 0,
      isFeatured: false,
      featuredPriority: 0,
      rootId: "",
      parentIds: body.parentId ? [body.parentId] : [],
      childrenIds: [] as string[],
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
      display: body.display
        ? { ...body.display, showInFooter: body.display.showInFooter ?? false }
        : { showInMenu: true, showInFooter: false as boolean },
    } as import("@mohasinac/appkit").CategoryCreateInput,
    admin.uid,
  );
}

export async function updateCategoryAction(
  id: string,
  input: Partial<CategoryUpdateInput>,
): Promise<CategoryDocument> {
  const admin = await requireRoleUser(["admin"]);

  const rl = await rateLimitByIdentifier(
    `category:update:${admin.uid}`,
    RateLimitPresets.API,
  );
  if (!rl.success)
    throw new AuthorizationError("Too many requests. Please slow down.");

  const idParsed = categoryIdSchema.safeParse({ id });
  if (!idParsed.success) throw new ValidationError("Invalid id");

  const parsed = categoryUpdateSchema.safeParse(input);
  if (!parsed.success)
    throw new ValidationError(
      parsed.error.issues[0]?.message ?? "Invalid update data",
    );

  const existing = await getCategoryById(id);
  if (!existing) throw new NotFoundError("Category not found");

  return updateCategory(id, parsed.data as CategoryUpdateInput);
}

export async function deleteCategoryAction(id: string): Promise<void> {
  const admin = await requireRoleUser(["admin"]);

  const rl = await rateLimitByIdentifier(
    `category:delete:${admin.uid}`,
    RateLimitPresets.API,
  );
  if (!rl.success)
    throw new AuthorizationError("Too many requests. Please slow down.");

  const idParsed = categoryIdSchema.safeParse({ id });
  if (!idParsed.success) throw new ValidationError("Invalid id");

  const existing = await getCategoryById(id);
  if (!existing) throw new NotFoundError("Category not found");

  return deleteCategory(id);
}

// --- Read Actions -------------------------------------------------------------

export async function listCategoriesAction(params?: {
  filters?: string;
  sorts?: string;
  page?: number;
  pageSize?: number;
}): Promise<FirebaseSieveResult<CategoryDocument>> {
  return listCategories(params);
}

export async function listTopLevelCategoriesAction(
  limit = 12,
): Promise<CategoryDocument[]> {
  return listTopLevelCategories(limit);
}

export async function listBrandCategoriesAction(
  limit = 12,
): Promise<CategoryDocument[]> {
  return listBrandCategories(limit);
}

export async function getCategoryByIdAction(
  id: string,
): Promise<CategoryDocument | null> {
  return getCategoryById(id);
}

export async function getCategoryBySlugAction(
  slug: string,
): Promise<CategoryDocument | null> {
  return getCategoryBySlug(slug);
}

export async function getCategoryChildrenAction(
  parentId: string,
): Promise<CategoryDocument[]> {
  return getCategoryChildren(parentId);
}

export async function buildCategoryTreeAction(
  rootId?: string,
): Promise<CategoryTreeNode[]> {
  return fetchCategoryTree(rootId);
}

