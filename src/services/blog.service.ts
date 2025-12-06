/**
 * @fileoverview Blog Service - Extends BaseService
 * @module src/services/blog.service
 * @description Blog post management service with CRUD operations
 *
 * @pattern BaseService - Inherits common CRUD operations
 * @created 2025-12-05
 * @refactored 2026-01-08 - Migrated to BaseService pattern
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

import { PAGINATION } from "@/constants/limits";
import { BLOG_STATUS, type BlogStatus } from "@/constants/statuses";
import { apiService } from "./api.service";
import { BaseService } from "./base.service";

/**
 * BlogPost interface
 *
 * @interface
 * @description Defines the structure and contract for BlogPost
 */
export interface BlogPost {
  /** Id */
  id: string;
  /** Title */
  title: string;
  /** Slug */
  slug: string;
  /** Excerpt */
  excerpt: string;
  /** Content */
  content: string;
  /** Featured Image */
  featuredImage?: string;
  /** Author */
  author: {
    /** Id */
    id: string;
    /** Name */
    name: string;
    /** Avatar */
    avatar?: string;
  };
  /** Category */
  category: string;
  /** Tags */
  tags: string[];
  /** Status */
  status: BlogStatus;
  /** Featured */
  featured: boolean;
  /** Published At */
  publishedAt?: Date;
  /** Created At */
  createdAt: Date;
  /** Updated At */
  updatedAt: Date;
  /** Views */
  views: number;
  /** Likes */
  likes: number;
}

/**
 * BlogFilters interface
 *
 * @interface
 * @description Defines the structure and contract for BlogFilters
 */
interface BlogFilters {
  /** Category */
  category?: string;
  /** Tag */
  tag?: string;
  /** Author */
  author?: string;
  /** Status */
  status?: BlogStatus;
  /** Search */
  search?: string;
  /** Featured */
  featured?: boolean;
  /** Page */
  page?: number;
  /** Limit */
  limit?: number;
  /** Sort By */
  sortBy?: "publishedAt" | "views" | "likes" | "createdAt";
  /** Sort Order */
  sortOrder?: "asc" | "desc";
  /** Start After */
  startAfter?: string;
}

/**
 * CreateBlogPostData interface
 *
 * @interface
 * @description Defines the structure and contract for CreateBlogPostData
 */
interface CreateBlogPostData {
  /** Title */
  title: string;
  /** Slug */
  slug: string;
  /** Excerpt */
  excerpt: string;
  /** Content */
  content: string;
  /** Featured Image */
  featuredImage?: string;
  /** Category */
  category: string;
  /** Tags */
  tags?: string[];
  /** Status */
  status: typeof BLOG_STATUS.DRAFT | typeof BLOG_STATUS.PUBLISHED;
  /** Featured */
  featured?: boolean;
  /** Published At */
  publishedAt?: Date;
}

/**
 * UpdateBlogPostData interface
 *
 * @interface
 * @description Defines the structure and contract for UpdateBlogPostData
 */
interface UpdateBlogPostData
  extends Partial<Omit<CreateBlogPostData, "status">> {
  /** Status */
  status?: BlogStatus;
}

class BlogService extends BaseService<
  BlogPost,
  BlogPost,
  CreateBlogPostData,
  BlogFilters
> {
  protected endpoint = "/blog";
  protected entityName = "BlogPost";

  protected toBE(form: CreateBlogPostData): Partial<BlogPost> {
    return form as Partial<BlogPost>;
  }

  protected toFE(be: BlogPost): BlogPost {
    return be;
  }

  // Note: list(), getById(), create(), update(), delete() inherited from BaseService

  async getBySlug(slug: string): Promise<BlogPost> {
    return apiService.get<BlogPost>(`/blog/slug/${slug}`);
  }

  // Get featured blog posts
  async getFeatured(): Promise<BlogPost[]> {
    const response = await this.list({
      /** Featured */
      featured: true,
      /** Status */
      status: BLOG_STATUS.PUBLISHED,
      /** Limit */
      limit: 100,
    });
    return Array.isArray(response) ? response : (response as any).data || [];
  }

  // Get homepage blog posts
  async getHomepage(): Promise<BlogPost[]> {
    const response = await this.list({
      /** Featured */
      featured: true,
      /** Status */
      status: BLOG_STATUS.PUBLISHED,
      /** Limit */
      limit: PAGINATION.DEFAULT_PAGE_SIZE,
    });
    return Array.isArray(response) ? response : (response as any).data || [];
  }

  // Like/unlike blog post
  async toggleLike(id: string): Promise<{ liked: boolean; likes: number }> {
    return apiService.post<{ liked: boolean; likes: number }>(
      `/blog/${id}/like`,
      {}
    );
  }

  // Get related posts
  async getRelated(id: string, limit?: number): Promise<BlogPost[]> {
    const params = new URLSearchParams();
    if (limit) params.append("limit", limit.toString());

    const queryString = params.toString();
    const endpoint = queryString
      ? `/blog/${id}/related?${queryString}`
      : `/blog/${id}/related`;

    return apiService.get<BlogPost[]>(endpoint);
  }

  // Get posts by category
  async getByCategory(
    /** Category */
    category: string,
    /** Page */
    page?: number,
    /** Limit */
    limit?: number
  ): Promise<{ data: BlogPost[]; count: number; pagination: any }> {
    return this.list({ category, status: BLOG_STATUS.PUBLISHED, page, limit });
  }

  // Get posts by tag
  async getByTag(
    /** Tag */
    tag: string,
    /** Page */
    page?: number,
    /** Limit */
    limit?: number
  ): Promise<{ data: BlogPost[]; count: number; pagination: any }> {
    return this.list({ tag, status: BLOG_STATUS.PUBLISHED, page, limit });
  }

  // Get posts by author
  async getByAuthor(
    /** Author Id */
    authorId: string,
    /** Page */
    page?: number,
    /** Limit */
    limit?: number
  ): Promise<{ data: BlogPost[]; count: number; pagination: any }> {
    return this.list({
      /** Author */
      author: authorId,
      /** Status */
      status: BLOG_STATUS.PUBLISHED,
      page,
      limit,
    });
  }

  // Search posts
  async search(
    /** Query */
    query: string,
    /** Page */
    page?: number,
    /** Limit */
    limit?: number
  ): Promise<{ data: BlogPost[]; count: number; pagination: any }> {
    return this.list({
      /** Search */
      search: query,
      /** Status */
      status: BLOG_STATUS.PUBLISHED,
      page,
      limit,
    });
  }
}

export const blogService = new BlogService();
export type { BlogFilters, CreateBlogPostData, UpdateBlogPostData };
