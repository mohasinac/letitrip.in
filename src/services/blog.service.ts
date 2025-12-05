/**
 * @fileoverview Service Module
 * @module src/services/blog.service
 * @description This file contains service functions for blog operations
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

import { PAGINATION } from "@/constants/limits";
import { BLOG_STATUS, type BlogStatus } from "@/constants/statuses";
import { PaginatedResponseBE } from "@/types/shared/common.types";
import { apiService } from "./api.service";

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

/**
 * BlogService class
 * 
 * @class
 * @description Description of BlogService class functionality
 */
class BlogService {
  // List blog posts (role-filtered)
  async list(
    /** Filters */
    filters?: BlogFilters
  ): Promise<{ data: BlogPost[]; count: number; pagination: any }> {
    /**
 * Performs params operation
 *
 * @returns {any} The params result
 *
 */
const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach((v) => params.append(key, v.toString()));
          } else {
            params.append(key, value.toString());
          }
        }
      });
    }

    const queryString = params.toString();
    const endpoint = queryString ? `/blog?${queryString}` : "/blog";

    const response = await apiService.get<PaginatedResponseBE<any>>(endpoint);

    return {
      /** Data */
      data: response.data || [],
      /** Count */
      count: response.count || 0,
      /** Pagination */
      pagination: response.pagination,
    };
  }

  // Get blog post by ID
  async getById(id: string): Promise<BlogPost> {
    return apiService.get<BlogPost>(`/blog/${id}`);
  }

  // Get blog post by slug
  async getBySlug(slug: string): Promise<BlogPost> {
    return apiService.get<BlogPost>(`/blog/slug/${slug}`);
  }

  // Create blog post (admin)
  async create(data: CreateBlogPostData): Promise<BlogPost> {
    return apiService.post<BlogPost>("/blog", data);
  }

  // Update blog post (author/admin)
  async update(id: string, data: UpdateBlogPostData): Promise<BlogPost> {
    return apiService.patch<BlogPost>(`/blog/${id}`, data);
  }

  // Delete blog post (author/admin)
  async delete(id: string): Promise<{ message: string }> {
    return apiService.delete<{ message: string }>(`/blog/${id}`);
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
