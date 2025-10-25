import { Category, CategoryFormData, CategoryTreeNode, ApiResponse, PaginatedResponse } from "@/types";

export class CategoryService {
  private static baseUrl = "/api/admin/categories";

  /**
   * Get all categories with optional filters
   */
  static async getCategories(params?: {
    parentId?: string | null;
    level?: number;
    featured?: boolean;
    includeInactive?: boolean;
    search?: string;
    withProductCounts?: boolean;
    rootOnly?: boolean;
  }): Promise<ApiResponse<Category[]>> {
    const searchParams = new URLSearchParams();
    
    if (params?.parentId !== undefined) {
      if (params.parentId === null) {
        searchParams.append("rootOnly", "true");
      } else {
        searchParams.append("parentId", params.parentId);
      }
    }
    
    if (params?.level !== undefined) {
      searchParams.append("level", params.level.toString());
    }
    
    if (params?.featured !== undefined) {
      searchParams.append("featured", params.featured.toString());
    }
    
    if (params?.includeInactive) {
      searchParams.append("includeInactive", "true");
    }
    
    if (params?.search) {
      searchParams.append("search", params.search);
    }
    
    if (params?.withProductCounts) {
      searchParams.append("withProductCounts", "true");
    }

    const response = await fetch(`${this.baseUrl}?${searchParams}`, {
      credentials: 'include' // This sends cookies automatically
    });

    return response.json();
  }

  /**
   * Get category tree structure
   */
  static async getCategoryTree(params?: {
    includeInactive?: boolean;
    withProductCounts?: boolean;
    maxDepth?: number;
  }): Promise<ApiResponse<{ categories: CategoryTreeNode[]; totalCategories: number; maxDepth: number }>> {
    const searchParams = new URLSearchParams();
    
    if (params?.includeInactive) {
      searchParams.append("includeInactive", "true");
    }
    
    if (params?.withProductCounts) {
      searchParams.append("withProductCounts", "true");
    }
    
    if (params?.maxDepth) {
      searchParams.append("maxDepth", params.maxDepth.toString());
    }

    const response = await fetch(`${this.baseUrl}/tree?${searchParams}`, {
      credentials: 'include'
    });

    return response.json();
  }

  /**
   * Get only leaf categories (can have products assigned)
   */
  static async getLeafCategories(params?: {
    includeInactive?: boolean;
    search?: string;
    withProductCounts?: boolean;
    limit?: number;
  }): Promise<ApiResponse<{ 
    data: Category[]; 
    meta: { 
      total: number; 
      totalLeafCategories: number; 
      search: string | null; 
      limit: number | null; 
      withProductCounts: boolean; 
    } 
  }>> {
    const searchParams = new URLSearchParams();
    
    if (params?.includeInactive) {
      searchParams.append("includeInactive", "true");
    }
    
    if (params?.search) {
      searchParams.append("search", params.search);
    }
    
    if (params?.withProductCounts) {
      searchParams.append("withProductCounts", "true");
    }
    
    if (params?.limit) {
      searchParams.append("limit", params.limit.toString());
    }

    const response = await fetch(`${this.baseUrl}/leaf?${searchParams}`, {
      credentials: 'include'
    });

    return response.json();
  }

  /**
   * Enhanced search with leaf category filtering
   */
  static async searchCategories(query: string, params?: {
    limit?: number;
    includeInactive?: boolean;
    leafOnly?: boolean;
    withProductCounts?: boolean;
  }): Promise<ApiResponse<{ 
    categories: Category[]; 
    query: string; 
    total: number; 
    totalFound: number; 
    filters: any; 
  }>> {
    const searchParams = new URLSearchParams();
    searchParams.append("q", query);
    
    if (params?.limit) {
      searchParams.append("limit", params.limit.toString());
    }
    
    if (params?.includeInactive) {
      searchParams.append("includeInactive", "true");
    }
    
    if (params?.leafOnly) {
      searchParams.append("leafOnly", "true");
    }
    
    if (params?.withProductCounts) {
      searchParams.append("withProductCounts", "true");
    }

    const response = await fetch(`${this.baseUrl}/search?${searchParams}`, {
      credentials: 'include'
    });

    return response.json();
  }

  /**
   * Search specifically for leaf categories (for product assignment)
   */
  static async searchLeafCategories(query: string, params?: {
    limit?: number;
    includeInactive?: boolean;
    withProductCounts?: boolean;
  }): Promise<ApiResponse<{ 
    categories: Category[]; 
    query: string; 
    total: number; 
    totalFound: number; 
    filters: any; 
  }>> {
    return this.searchCategories(query, {
      ...params,
      leafOnly: true
    });
  }

  /**
   * Get a single category by ID
   */
  static async getCategory(id: string): Promise<ApiResponse<Category>> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      credentials: 'include'
    });

    return response.json();
  }

  /**
   * Create a new category
   */
  static async createCategory(data: CategoryFormData): Promise<ApiResponse<Category>> {
    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: 'include',
      body: JSON.stringify(data)
    });

    return response.json();
  }

  /**
   * Update an existing category
   */
  static async updateCategory(id: string, data: CategoryFormData): Promise<ApiResponse<Category>> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: 'include',
      body: JSON.stringify(data)
    });

    return response.json();
  }

  /**
   * Delete a category
   */
  static async deleteCategory(id: string): Promise<ApiResponse<{ message: string }>> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: "DELETE",
      credentials: 'include'
    });

    return response.json();
  }

  /**
   * Validate category slug
   */
  static async validateSlug(slug: string, excludeId?: string): Promise<ApiResponse<{ available: boolean; slug: string }>> {
    const searchParams = new URLSearchParams();
    searchParams.append("slug", slug);
    
    if (excludeId) {
      searchParams.append("excludeId", excludeId);
    }

    const response = await fetch(`${this.baseUrl}/validate-slug?${searchParams}`);
    return response.json();
  }

  /**
   * Generate slug from name
   */
  static async generateSlug(name: string, excludeId?: string): Promise<ApiResponse<{ slug: string; available: boolean }>> {
    const response = await fetch(`${this.baseUrl}/validate-slug`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ name, excludeId })
    });

    return response.json();
  }

  /**
   * Perform bulk operations on categories
   */
  static async bulkOperation(
    operation: "delete" | "activate" | "deactivate" | "setFeatured" | "updateSortOrder" | "moveToParent",
    categoryIds: string[],
    data?: any
  ): Promise<ApiResponse<{ operation: string; results: any[]; processedCount: number }>> {
    const response = await fetch(`${this.baseUrl}/bulk`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: 'include',
      body: JSON.stringify({ operation, categoryIds, data })
    });

    return response.json();
  }

  /**
   * Upload category image
   */
  static async uploadImage(file: File, categoryId?: string): Promise<{ url: string; path: string }> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", "category");
    
    if (categoryId) {
      formData.append("categoryId", categoryId);
    }

    const response = await fetch("/api/upload", {
      method: "POST",
      credentials: 'include',
      body: formData
    });

    if (!response.ok) {
      throw new Error("Failed to upload image");
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * Client-side slug generation utility
   */
  static generateSlugFromName(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
  }

  /**
   * Build category breadcrumb
   */
  static buildBreadcrumb(category: Category, allCategories: Category[]): Category[] {
    const breadcrumb: Category[] = [];
    const categoryMap = new Map(allCategories.map(c => [c.id, c]));
    
    let current: Category | undefined = category;
    while (current) {
      breadcrumb.unshift(current);
      current = current.parentId ? categoryMap.get(current.parentId) : undefined;
    }
    
    return breadcrumb;
  }

  /**
   * Get category children
   */
  static getCategoryChildren(parentId: string, allCategories: Category[]): Category[] {
    return allCategories
      .filter(category => category.parentId === parentId)
      .sort((a, b) => {
        if (a.sortOrder !== b.sortOrder) {
          return a.sortOrder - b.sortOrder;
        }
        return a.name.localeCompare(b.name);
      });
  }

  /**
   * Check if category has descendants
   */
  static hasDescendants(categoryId: string, allCategories: Category[]): boolean {
    return allCategories.some(category => 
      category.parentIds?.includes(categoryId) || category.parentId === categoryId
    );
  }

  /**
   * Get all descendants of a category
   */
  static getDescendants(categoryId: string, allCategories: Category[]): Category[] {
    return allCategories.filter(category => 
      category.parentIds?.includes(categoryId)
    );
  }

  /**
   * Validate category hierarchy (prevent circular references)
   */
  static validateHierarchy(categoryId: string, newParentId: string, allCategories: Category[]): boolean {
    if (categoryId === newParentId) {
      return false; // Cannot be parent of itself
    }

    const descendants = this.getDescendants(categoryId, allCategories);
    return !descendants.some(desc => desc.id === newParentId);
  }
}
