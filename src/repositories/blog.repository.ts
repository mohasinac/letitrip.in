/**
 * Blog Posts Repository
 *
 * Manages blog post CRUD and query operations
 */

import { BaseRepository } from "./base.repository";
import {
  BLOG_POSTS_COLLECTION,
  BlogPostDocument,
  BlogPostCreateInput,
  BlogPostUpdateInput,
  BlogPostCategory,
  BlogPostStatus,
  BLOG_POST_FIELDS,
} from "@/db/schema";
import { DatabaseError } from "@/lib/errors";
import { FieldValue } from "firebase-admin/firestore";
import { prepareForFirestore } from "@/lib/firebase/firestore-helpers";
import { generateBlogPostId } from "@/utils";
import type { SieveModel, FirebaseSieveResult } from "@/lib/query";

class BlogRepository extends BaseRepository<BlogPostDocument> {
  constructor() {
    super(BLOG_POSTS_COLLECTION);
  }

  /**
   * Find blog post by slug
   */
  async findBySlug(slug: string): Promise<BlogPostDocument | null> {
    try {
      const snapshot = await this.db
        .collection(this.collection)
        .where(BLOG_POST_FIELDS.SLUG, "==", slug)
        .limit(1)
        .get();

      if (snapshot.empty) return null;

      const doc = snapshot.docs[0];
      return this.mapDoc<BlogPostDocument>(doc);
    } catch (error) {
      throw new DatabaseError(
        `Failed to find blog post by slug: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Create a new blog post
   */
  async create(input: BlogPostCreateInput): Promise<BlogPostDocument> {
    try {
      const now = new Date();
      const id = generateBlogPostId({
        title: input.title,
        category: input.category,
        status: input.status,
      });
      const data = prepareForFirestore({
        ...input,
        views: input.views ?? 0,
        createdAt: now,
        updatedAt: now,
      });

      await this.db.collection(this.collection).doc(id).set(data);

      return { id, ...data } as BlogPostDocument;
    } catch (error) {
      throw new DatabaseError(
        `Failed to create blog post: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Update a blog post
   */
  async update(
    id: string,
    input: BlogPostUpdateInput,
  ): Promise<BlogPostDocument> {
    try {
      const data = prepareForFirestore({ ...input, updatedAt: new Date() });
      await this.db.collection(this.collection).doc(id).update(data);

      const doc = await this.findByIdOrFail(id);
      return doc;
    } catch (error) {
      throw new DatabaseError(
        `Failed to update blog post: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Delete a blog post
   */
  async delete(id: string): Promise<void> {
    try {
      await this.db.collection(this.collection).doc(id).delete();
    } catch (error) {
      throw new DatabaseError(
        `Failed to delete blog post: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Increment view count
   */
  async incrementViews(id: string): Promise<void> {
    try {
      await this.db
        .collection(this.collection)
        .doc(id)
        .update({ [BLOG_POST_FIELDS.VIEWS]: FieldValue.increment(1) });
    } catch {
      // Fire-and-forget — don't throw for view count failures
    }
  }

  /**
   * Fetch Related Posts (same category, exclude current)
   */
  async findRelated(
    category: BlogPostCategory,
    excludeId: string,
    limit = 3,
  ): Promise<BlogPostDocument[]> {
    try {
      const snapshot = await this.db
        .collection(this.collection)
        .where(BLOG_POST_FIELDS.STATUS, "==", "published" as BlogPostStatus)
        .where(BLOG_POST_FIELDS.CATEGORY, "==", category)
        .orderBy(BLOG_POST_FIELDS.PUBLISHED_AT, "desc")
        .limit(limit + 1)
        .get();

      return snapshot.docs
        .map((doc) => this.mapDoc<BlogPostDocument>(doc))
        .filter((post) => post.id !== excludeId)
        .slice(0, limit);
    } catch (error) {
      throw new DatabaseError(
        `Failed to find related posts: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  // ---------------------------------------------------------------------------
  // Sieve-powered list query
  // ---------------------------------------------------------------------------

  /** Fields that consumers may filter or sort on. */
  static readonly SIEVE_FIELDS = {
    id: { canFilter: true, canSort: false },
    title: { canFilter: true, canSort: true },
    slug: { canFilter: true, canSort: false },
    status: { canFilter: true, canSort: true },
    category: { canFilter: true, canSort: true },
    authorName: { canFilter: true, canSort: true },
    authorId: { canFilter: true, canSort: false },
    isFeatured: { canFilter: true, canSort: false },
    readTimeMinutes: { canFilter: true, canSort: true },
    views: { canFilter: true, canSort: true },
    publishedAt: { canFilter: true, canSort: true },
    updatedAt: { canFilter: true, canSort: true },
    tags: { canFilter: true, canSort: false },
    createdAt: { canFilter: true, canSort: true },
  };

  /**
   * Paginated, Firestore-native published-post list.
   *
   * `status == 'published'` is always enforced at the Firestore level.
   * Optional `category` and `featuredOnly` are also applied as Firestore
   * `where()` clauses before Sieve runs.
   *
   * @example
   * ```ts
   * const result = await blogRepository.listPublished(
   *   { category: 'travel', featuredOnly: false },
   *   { sorts: '-publishedAt', page: 1, pageSize: 12 },
   * );
   * ```
   */
  async listPublished(
    opts: { category?: BlogPostCategory; featuredOnly?: boolean },
    model: SieveModel,
  ): Promise<FirebaseSieveResult<BlogPostDocument>> {
    let baseQuery = this.getCollection().where(
      BLOG_POST_FIELDS.STATUS,
      "==",
      "published" as BlogPostStatus,
    );

    if (opts?.category) {
      baseQuery = baseQuery.where(
        BLOG_POST_FIELDS.CATEGORY,
        "==",
        opts.category,
      ) as typeof baseQuery;
    }

    if (opts?.featuredOnly) {
      baseQuery = baseQuery.where(
        BLOG_POST_FIELDS.IS_FEATURED,
        "==",
        true,
      ) as typeof baseQuery;
    }

    return this.sieveQuery<BlogPostDocument>(
      model,
      BlogRepository.SIEVE_FIELDS,
      {
        baseQuery,
        defaultPageSize: 12,
        maxPageSize: 50,
      },
    );
  }

  /**
   * Paginated, Firestore-native blog post list across ALL statuses (admin use).
   *
   * Unlike `listPublished`, no `status` pre-filter is applied — admins can
   * see drafts, archived posts, etc.
   */
  async listAll(
    model: SieveModel,
  ): Promise<FirebaseSieveResult<BlogPostDocument>> {
    return this.sieveQuery<BlogPostDocument>(
      model,
      BlogRepository.SIEVE_FIELDS,
      {
        defaultPageSize: 50,
        maxPageSize: 200,
      },
    );
  }
}

export const blogRepository = new BlogRepository();
export { BlogRepository };
