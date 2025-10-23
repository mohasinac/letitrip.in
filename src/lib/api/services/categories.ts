import { Category, CategoryFormData, ApiResponse } from '@/types';

class CategoriesService {
  private readonly baseUrl = '/api/categories';

  async getCategories(params?: {
    subcategories?: boolean;
    featured?: boolean;
  }): Promise<{
    categories: Category[];
    totalCategories: number;
    featuredCount: number;
  }> {
    const searchParams = new URLSearchParams();
    if (params?.subcategories) searchParams.set('subcategories', 'true');
    if (params?.featured) searchParams.set('featured', 'true');

    const url = searchParams.toString() 
      ? `${this.baseUrl}?${searchParams.toString()}` 
      : this.baseUrl;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }

    const result: ApiResponse = await response.json();
    return result.data;
  }

  async createCategory(data: CategoryFormData): Promise<Category> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create category');
    }

    const result: ApiResponse<{ category: Category }> = await response.json();
    return result.data!.category;
  }

  async updateCategory(id: string, data: Partial<CategoryFormData>): Promise<Category> {
    const response = await fetch(this.baseUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id, ...data }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update category');
    }

    const result: ApiResponse<{ category: Category }> = await response.json();
    return result.data!.category;
  }

  async deleteCategory(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}?id=${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete category');
    }
  }

  // Mock data for development
  getMockCategories(): Category[] {
    return [
      {
        id: "electronics",
        name: "Electronics",
        slug: "electronics",
        description: "Latest gadgets, smartphones, laptops, and electronic accessories",
        image: "/api/placeholder/400/300",
        icon: "📱",
        productCount: 1250,
        featured: true,
        sortOrder: 1,
        isActive: true,
        createdAt: "2024-01-15T10:00:00Z",
        updatedAt: "2024-10-20T14:30:00Z",
        order: 1,
        subcategories: [
          { id: "smartphones", name: "Smartphones", slug: "smartphones", productCount: 345 },
          { id: "laptops", name: "Laptops & Computers", slug: "laptops", productCount: 289 },
          { id: "headphones", name: "Audio & Headphones", slug: "headphones", productCount: 156 },
        ],
      },
      {
        id: "fashion",
        name: "Fashion & Apparel",
        slug: "fashion",
        description: "Trendy clothing, shoes, and fashion accessories for all",
        image: "/api/placeholder/400/300",
        icon: "👕",
        productCount: 2100,
        featured: true,
        sortOrder: 2,
        isActive: true,
        createdAt: "2024-01-16T11:00:00Z",
        updatedAt: "2024-10-21T16:45:00Z",
        order: 2,
        subcategories: [
          { id: "mens-clothing", name: "Men's Clothing", slug: "mens-clothing", productCount: 567 },
          { id: "womens-clothing", name: "Women's Clothing", slug: "womens-clothing", productCount: 743 },
          { id: "shoes", name: "Shoes & Footwear", slug: "shoes", productCount: 428 },
        ],
      },
      {
        id: "home-garden",
        name: "Home & Garden",
        slug: "home-garden",
        description: "Furniture, decor, appliances, and garden supplies",
        image: "/api/placeholder/400/300",
        icon: "🏠",
        productCount: 890,
        featured: true,
        sortOrder: 3,
        isActive: true,
        createdAt: "2024-01-17T09:00:00Z",
        updatedAt: "2024-10-18T13:10:00Z",
        order: 3,
        subcategories: [
          { id: "furniture", name: "Furniture", slug: "furniture", productCount: 234 },
          { id: "kitchen", name: "Kitchen & Dining", slug: "kitchen", productCount: 345 },
        ],
      },
      {
        id: "sports",
        name: "Sports & Outdoors",
        slug: "sports",
        description: "Athletic gear, outdoor equipment, and fitness accessories",
        image: "/api/placeholder/400/300",
        icon: "⚽",
        productCount: 650,
        featured: true,
        sortOrder: 4,
        isActive: true,
        createdAt: "2024-01-18T10:00:00Z",
        updatedAt: "2024-10-22T11:20:00Z",
        order: 4,
        subcategories: [
          { id: "fitness", name: "Fitness & Exercise", slug: "fitness", productCount: 189 },
          { id: "outdoor", name: "Outdoor Recreation", slug: "outdoor", productCount: 267 },
        ],
      },
    ];
  }
}

export const categoriesService = new CategoriesService();
