import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from '@/lib/firebase/admin';

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

// GET - Retrieve all categories or specific ones
export async function GET(request: NextRequest) {
  try {
    const db = getAdminDb();
    const { searchParams } = new URL(request.url);
    const includeSubcategories = searchParams.get("subcategories") === "true";
    const featuredOnly = searchParams.get("featured") === "true";

    // Fetch categories from Firestore
    let categoriesQuery = db.collection('categories')
      .where('isActive', '==', true)
      .orderBy('sortOrder', 'asc');

    if (featuredOnly) {
      categoriesQuery = categoriesQuery.where('featured', '==', true);
    }

    const categoriesSnapshot = await categoriesQuery.get();
    
    const categories: Category[] = [];
    
    for (const doc of categoriesSnapshot.docs) {
      const categoryData = doc.data();
      
      // Count products in this category
      const productsSnapshot = await db.collection('products')
        .where('category', '==', categoryData.slug)
        .where('status', '==', 'active')
        .get();
      
      const category: Category = {
        id: doc.id,
        name: categoryData.name,
        slug: categoryData.slug,
        description: categoryData.description || '',
        image: categoryData.image || '/images/categories/default.jpg',
        icon: categoryData.icon,
        productCount: productsSnapshot.size,
        parentId: categoryData.parentId,
        featured: categoryData.featured || false,
        sortOrder: categoryData.sortOrder || 0,
        isActive: categoryData.isActive || true,
        createdAt: categoryData.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: categoryData.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        order: categoryData.sortOrder || 0
      };

      // Fetch subcategories if requested
      if (includeSubcategories) {
        const subcategoriesSnapshot = await db.collection('categories')
          .where('parentId', '==', doc.id)
          .where('isActive', '==', true)
          .orderBy('sortOrder', 'asc')
          .get();
        
        category.subcategories = [];
        for (const subDoc of subcategoriesSnapshot.docs) {
          const subData = subDoc.data();
          const subProductsSnapshot = await db.collection('products')
            .where('category', '==', subData.slug)
            .where('status', '==', 'active')
            .get();
          
          category.subcategories.push({
            id: subDoc.id,
            name: subData.name,
            slug: subData.slug,
            productCount: subProductsSnapshot.size
          });
        }
      }

      categories.push(category);
    }

    return NextResponse.json({
      success: true,
      data: {
        categories,
        totalCategories: categories.length,
        featuredCount: categories.filter(cat => cat.featured).length
      }
    });

  } catch (error) {
    console.error("Get categories error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

// POST - Create a new category
export async function POST(request: NextRequest) {
  try {
    const db = getAdminDb();
    const body = await request.json();
    
    const { name, description, image, icon, featured, sortOrder, parentId } = body;
    
    if (!name) {
      return NextResponse.json(
        { success: false, error: "Category name is required" },
        { status: 400 }
      );
    }

    // Generate slug from name
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    
    // Check if category with this slug already exists
    const existingCategory = await db.collection('categories')
      .where('slug', '==', slug)
      .get();
    
    if (!existingCategory.empty) {
      return NextResponse.json(
        { success: false, error: "Category with this name already exists" },
        { status: 400 }
      );
    }

    // Create new category
    const categoryData = {
      name,
      slug,
      description: description || '',
      image: image || '/images/categories/default.jpg',
      icon: icon || '',
      featured: featured || false,
      sortOrder: sortOrder || 0,
      isActive: true,
      parentId: parentId || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const docRef = await db.collection('categories').add(categoryData);
    
    const newCategory: Category = {
      id: docRef.id,
      ...categoryData,
      productCount: 0,
      order: sortOrder || 0,
      createdAt: categoryData.createdAt.toISOString(),
      updatedAt: categoryData.updatedAt.toISOString()
    };

    return NextResponse.json({
      success: true,
      data: { category: newCategory }
    });

  } catch (error) {
    console.error("Create category error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create category" },
      { status: 500 }
    );
  }
}

// PUT - Update an existing category
export async function PUT(request: NextRequest) {
  try {
    const db = getAdminDb();
    const body = await request.json();
    
    const { id, name, description, image, icon, featured, sortOrder, isActive, parentId } = body;
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Category ID is required" },
        { status: 400 }
      );
    }

    // Check if category exists
    const categoryRef = db.collection('categories').doc(id);
    const categoryDoc = await categoryRef.get();
    
    if (!categoryDoc.exists) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 }
      );
    }

    const updateData: any = {
      updatedAt: new Date()
    };

    if (name) {
      updateData.name = name;
      updateData.slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    }
    if (description !== undefined) updateData.description = description;
    if (image !== undefined) updateData.image = image;
    if (icon !== undefined) updateData.icon = icon;
    if (featured !== undefined) updateData.featured = featured;
    if (sortOrder !== undefined) updateData.sortOrder = sortOrder;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (parentId !== undefined) updateData.parentId = parentId;

    await categoryRef.update(updateData);
    
    // Get updated category
    const updatedDoc = await categoryRef.get();
    const updatedData = updatedDoc.data()!;
    
    // Count products in this category
    const productsSnapshot = await db.collection('products')
      .where('category', '==', updatedData.slug)
      .where('status', '==', 'active')
      .get();

    const updatedCategory: Category = {
      id: updatedDoc.id,
      name: updatedData.name,
      slug: updatedData.slug,
      description: updatedData.description || '',
      image: updatedData.image || '/images/categories/default.jpg',
      icon: updatedData.icon,
      productCount: productsSnapshot.size,
      parentId: updatedData.parentId,
      featured: updatedData.featured || false,
      sortOrder: updatedData.sortOrder || 0,
      isActive: updatedData.isActive || true,
      order: updatedData.sortOrder || 0,
      createdAt: updatedData.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      updatedAt: updatedData.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      data: { category: updatedCategory }
    });

  } catch (error) {
    console.error("Update category error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update category" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a category
export async function DELETE(request: NextRequest) {
  try {
    const db = getAdminDb();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Category ID is required" },
        { status: 400 }
      );
    }

    // Check if category exists
    const categoryRef = db.collection('categories').doc(id);
    const categoryDoc = await categoryRef.get();
    
    if (!categoryDoc.exists) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 }
      );
    }

    // Check if category has products
    const categoryData = categoryDoc.data()!;
    const productsSnapshot = await db.collection('products')
      .where('category', '==', categoryData.slug)
      .get();
    
    if (!productsSnapshot.empty) {
      return NextResponse.json(
        { success: false, error: "Cannot delete category with existing products" },
        { status: 400 }
      );
    }

    // Check if category has subcategories
    const subcategoriesSnapshot = await db.collection('categories')
      .where('parentId', '==', id)
      .get();
    
    if (!subcategoriesSnapshot.empty) {
      return NextResponse.json(
        { success: false, error: "Cannot delete category with subcategories" },
        { status: 400 }
      );
    }

    // Delete the category
    await categoryRef.delete();

    return NextResponse.json({
      success: true,
      data: { message: "Category deleted successfully" }
    });

  } catch (error) {
    console.error("Delete category error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete category" },
      { status: 500 }
    );
  }
}

// PATCH - Toggle category status (active/inactive)
export async function PATCH(request: NextRequest) {
  try {
    const db = getAdminDb();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Category ID is required" },
        { status: 400 }
      );
    }

    // Check if category exists
    const categoryRef = db.collection('categories').doc(id);
    const categoryDoc = await categoryRef.get();
    
    if (!categoryDoc.exists) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 }
      );
    }

    const categoryData = categoryDoc.data()!;
    const newStatus = !categoryData.isActive;

    // Update category status
    await categoryRef.update({
      isActive: newStatus,
      updatedAt: new Date()
    });

    // Get updated category
    const updatedDoc = await categoryRef.get();
    const updatedData = updatedDoc.data()!;
    
    // Count products in this category
    const productsSnapshot = await db.collection('products')
      .where('category', '==', updatedData.slug)
      .where('status', '==', 'active')
      .get();

    const updatedCategory: Category = {
      id: updatedDoc.id,
      name: updatedData.name,
      slug: updatedData.slug,
      description: updatedData.description || '',
      image: updatedData.image || '/images/categories/default.jpg',
      icon: updatedData.icon,
      productCount: productsSnapshot.size,
      parentId: updatedData.parentId,
      featured: updatedData.featured || false,
      sortOrder: updatedData.sortOrder || 0,
      isActive: updatedData.isActive || true,
      order: updatedData.sortOrder || 0,
      createdAt: updatedData.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      updatedAt: updatedData.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      data: { category: updatedCategory }
    });

  } catch (error) {
    console.error("Toggle category status error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to toggle category status" },
      { status: 500 }
    );
  }
}
