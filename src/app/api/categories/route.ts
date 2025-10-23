import { NextRequest, NextResponse } from "next/server";

interface SubCategory {
  id: string;
  name: string;
  slug: string;
  productCount: number;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  icon?: string;
  productCount: number;
  parentId?: string;
  subcategories?: SubCategory[];
  featured: boolean;
  sortOrder?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  order: number;
}

// Mock categories data - In production, this would be replaced with database operations
let categories: Category[] = [
  {
    id: "cat_1",
    name: "Electronics",
    slug: "electronics",
    description: "Latest gadgets, smartphones, laptops, and electronic accessories",
    image: "/api/placeholder/400/300",
    icon: "📱",
    productCount: 1250,
    subcategories: [
      {
        id: "subcat_1",
        name: "Smartphones",
        slug: "smartphones",
        productCount: 345
      },
      {
        id: "subcat_2", 
        name: "Laptops",
        slug: "laptops",
        productCount: 289
      },
      {
        id: "subcat_3",
        name: "Headphones",
        slug: "headphones",
        productCount: 156
      }
    ],
    featured: true,
    sortOrder: 1,
    isActive: true,
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-10-20T14:30:00Z",
    order: 1
  },
  {
    id: "cat_2",
    name: "Fashion & Apparel",
    slug: "fashion",
    description: "Trendy clothing, shoes, and fashion accessories for all",
    image: "/api/placeholder/400/300",
    icon: "👕",
    productCount: 2100,
    subcategories: [
      {
        id: "subcat_4",
        name: "Men's Clothing",
        slug: "mens-clothing",
        productCount: 567
      },
      {
        id: "subcat_5",
        name: "Women's Clothing",
        slug: "womens-clothing",
        productCount: 743
      },
      {
        id: "subcat_6",
        name: "Shoes",
        slug: "shoes",
        productCount: 428
      }
    ],
    featured: true,
    sortOrder: 2,
    isActive: true,
    createdAt: "2024-01-16T11:00:00Z",
    updatedAt: "2024-10-21T16:45:00Z",
    order: 2
  },
  {
    id: "cat_3",
    name: "Home & Garden",
    slug: "home-garden",
    description: "Furniture, decor, appliances, and garden supplies",
    image: "/api/placeholder/400/300",
    icon: "🏠",
    productCount: 890,
    subcategories: [
      {
        id: "subcat_7",
        name: "Furniture",
        slug: "furniture",
        productCount: 234
      },
      {
        id: "subcat_8",
        name: "Kitchen",
        slug: "kitchen",
        productCount: 345
      }
    ],
    featured: false,
    sortOrder: 3,
    isActive: true,
    createdAt: "2024-01-17T09:00:00Z",
    updatedAt: "2024-10-18T13:10:00Z",
    order: 3
  },
  {
    id: "cat_4",
    name: "Sports & Outdoors",
    slug: "sports",
    description: "Athletic gear, outdoor equipment, and fitness accessories",
    image: "/api/placeholder/400/300",
    icon: "⚽",
    productCount: 650,
    subcategories: [
      {
        id: "subcat_9",
        name: "Fitness",
        slug: "fitness",
        productCount: 189
      },
      {
        id: "subcat_10",
        name: "Outdoor",
        slug: "outdoor",
        productCount: 267
      }
    ],
    featured: true,
    sortOrder: 4,
    isActive: true,
    createdAt: "2024-01-18T10:00:00Z",
    updatedAt: "2024-10-22T11:20:00Z",
    order: 4
  }
];

// GET - Retrieve all categories or specific ones
export async function GET(request: NextRequest) {
  try {

    const { searchParams } = new URL(request.url);
    const includeSubcategories = searchParams.get("subcategories") === "true";
    const featuredOnly = searchParams.get("featured") === "true";

    let filteredCategories = categories;

    // Filter featured categories if requested
    if (featuredOnly) {
      filteredCategories = categories.filter(cat => cat.featured);
    }

    // Transform categories based on subcategories requirement
    const responseCategories = filteredCategories.map(cat => {
      if (includeSubcategories) {
        return cat;
      } else {
        const { subcategories, ...categoryWithoutSubcategories } = cat;
        return categoryWithoutSubcategories;
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        categories: responseCategories,
        totalCategories: categories.length,
        featuredCount: categories.filter(cat => cat.featured).length
      }
    });

  } catch (error) {
    console.error("Get categories error:", error);
    return NextResponse.json(
      { error: "Failed to get categories" },
      { status: 500 }
    );
  }
}

// POST - Create a new category
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, slug, description, image, icon, parentId, featured = false, sortOrder } = body;

    // Validate required fields
    if (!name || !slug || !description) {
      return NextResponse.json(
        { error: "Missing required fields: name, slug, description" },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existingCategory = categories.find(cat => cat.slug === slug);
    if (existingCategory) {
      return NextResponse.json(
        { error: "Category with this slug already exists" },
        { status: 409 }
      );
    }

    // Generate new ID
    const newId = `cat_${Date.now()}`;

    // Create new category
    const newCategory: Category = {
      id: newId,
      name,
      slug,
      description,
      image: image || "/api/placeholder/400/300",
      icon,
      productCount: 0,
      parentId,
      subcategories: [],
      featured,
      sortOrder: sortOrder || categories.length + 1,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      order: sortOrder || categories.length + 1
    };

    categories.push(newCategory);

    return NextResponse.json({
      success: true,
      data: { category: newCategory },
      message: "Category created successfully"
    }, { status: 201 });

  } catch (error) {
    console.error("Create category error:", error);
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}

// PUT - Update an existing category
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, slug, description, image, icon, parentId, featured, sortOrder, isActive } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Category ID is required" },
        { status: 400 }
      );
    }

    // Find category to update
    const categoryIndex = categories.findIndex(cat => cat.id === id);
    if (categoryIndex === -1) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    // Check if new slug conflicts with existing categories (excluding current)
    if (slug) {
      const existingCategory = categories.find(cat => cat.slug === slug && cat.id !== id);
      if (existingCategory) {
        return NextResponse.json(
          { error: "Category with this slug already exists" },
          { status: 409 }
        );
      }
    }

    // Update category
    const updatedCategory = {
      ...categories[categoryIndex],
      ...(name && { name }),
      ...(slug && { slug }),
      ...(description && { description }),
      ...(image && { image }),
      ...(icon !== undefined && { icon }),
      ...(parentId !== undefined && { parentId }),
      ...(featured !== undefined && { featured }),
      ...(sortOrder !== undefined && { sortOrder, order: sortOrder }),
      ...(isActive !== undefined && { isActive }),
      updatedAt: new Date().toISOString()
    };

    categories[categoryIndex] = updatedCategory;

    return NextResponse.json({
      success: true,
      data: { category: updatedCategory },
      message: "Category updated successfully"
    });

  } catch (error) {
    console.error("Update category error:", error);
    return NextResponse.json(
      { error: "Failed to update category" },
      { status: 500 }
    );
  }
}

// DELETE - Remove a category
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Category ID is required" },
        { status: 400 }
      );
    }

    const categoryIndex = categories.findIndex(cat => cat.id === id);
    if (categoryIndex === -1) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    // Check if category has products (in a real app, you'd check the database)
    const categoryToDelete = categories[categoryIndex];
    if (categoryToDelete.productCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete category with existing products. Please reassign or remove products first." },
        { status: 409 }
      );
    }

    // Remove category
    const deletedCategory = categories.splice(categoryIndex, 1)[0];

    return NextResponse.json({
      success: true,
      data: { category: deletedCategory },
      message: "Category deleted successfully"
    });

  } catch (error) {
    console.error("Delete category error:", error);
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
}
