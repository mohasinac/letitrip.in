import { apiService } from "./api.service";
import type { PaginatedResponse } from "@/types";

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage?: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  category: string;
  tags: string[];
  status: "draft" | "published" | "archived";
  isFeatured: boolean;
  showOnHomepage: boolean;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  views: number;
  likes: number;
}

interface BlogFilters {
  category?: string;
  tag?: string;
  author?: string;
  status?: "draft" | "published" | "archived";
  search?: string;
  isFeatured?: boolean;
  showOnHomepage?: boolean;
  page?: number;
  limit?: number;
  sortBy?: "publishedAt" | "views" | "likes" | "createdAt";
  sortOrder?: "asc" | "desc";
}

interface CreateBlogPostData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage?: string;
  category: string;
  tags?: string[];
  status: "draft" | "published";
  isFeatured?: boolean;
  showOnHomepage?: boolean;
  publishedAt?: Date;
}

interface UpdateBlogPostData extends Partial<Omit<CreateBlogPostData, "status">> {
  status?: "draft" | "published" | "archived";
}

class BlogService {
  // List blog posts (role-filtered)
  async list(filters?: BlogFilters): Promise<PaginatedResponse<BlogPost>> {
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

    return apiService.get<PaginatedResponse<BlogPost>>(endpoint);
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
      isFeatured: true,
      status: "published",
      limit: 100,
    });
    return Array.isArray(response) ? response : (response as any).data || [];
  }

  // Get homepage blog posts
  async getHomepage(): Promise<BlogPost[]> {
    const response = await this.list({
      showOnHomepage: true,
      status: "published",
      limit: 20,
    });
    return Array.isArray(response) ? response : (response as any).data || [];
  }

  // Like/unlike blog post
  async toggleLike(id: string): Promise<{ liked: boolean; likes: number }> {
    return apiService.post<{ liked: boolean; likes: number }>(
      `/blog/${id}/like`,
      {},
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
    category: string,
    page?: number,
    limit?: number,
  ): Promise<PaginatedResponse<BlogPost>> {
    return this.list({ category, status: "published", page, limit });
  }

  // Get posts by tag
  async getByTag(
    tag: string,
    page?: number,
    limit?: number,
  ): Promise<PaginatedResponse<BlogPost>> {
    return this.list({ tag, status: "published", page, limit });
  }

  // Get posts by author
  async getByAuthor(
    authorId: string,
    page?: number,
    limit?: number,
  ): Promise<PaginatedResponse<BlogPost>> {
    return this.list({ author: authorId, status: "published", page, limit });
  }

  // Search posts
  async search(
    query: string,
    page?: number,
    limit?: number,
  ): Promise<PaginatedResponse<BlogPost>> {
    return this.list({ search: query, status: "published", page, limit });
  }
}

export const blogService = new BlogService();
export type { BlogFilters, CreateBlogPostData, UpdateBlogPostData };
