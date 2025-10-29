import { Metadata } from "next";
import { notFound } from "next/navigation";
import CategoryPageClient from "@/components/categories/CategoryPageClient";
import { getAdminDb } from "@/lib/database/admin";
import type { Category } from "@/types";

interface PageProps {
  params: Promise<{
    slug?: string[];
  }>;
  searchParams: { [key: string]: string | string[] | undefined };
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams.slug?.[0];

  if (!slug) {
    return {
      title: "Shop by Category | JustForView Store",
      description:
        "Browse all product categories and find what you're looking for.",
    };
  }

  try {
    const db = getAdminDb();
    const snapshot = await db
      .collection("categories")
      .where("slug", "==", slug)
      .where("isActive", "==", true)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return {
        title: "Category Not Found",
      };
    }

    const category = {
      id: snapshot.docs[0].id,
      ...snapshot.docs[0].data(),
    } as Category;

    return {
      title: `${category.name} | JustForView Store`,
      description:
        category.description ||
        `Shop ${category.name} products at JustForView Store`,
      keywords: category.seo?.keywords || [category.name],
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Category | JustForView Store",
    };
  }
}

export default async function CategoriesPage({ params }: PageProps) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug?.[0];
  const db = getAdminDb();

  try {
    // Fetch all active categories
    const snapshot = await db
      .collection("categories")
      .where("isActive", "==", true)
      .orderBy("sortOrder", "asc")
      .get();

    const allCategories: Category[] = snapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        } as Category)
    );

    // If slug provided, find the current category
    let currentCategory: Category | null = null;
    if (slug) {
      console.log(slug);
      currentCategory =
        allCategories.find((cat) => {
          console.log(cat.slug);
          return cat.slug === slug;
        }) || null;
      if (!currentCategory) {
        notFound();
      }
    }

    // Calculate product counts for all categories
    const categoriesWithCounts = await Promise.all(
      allCategories.map(async (category) => {
        // Get direct products count
        const productsSnapshot = await db
          .collection("products")
          .where("categoryId", "==", category.id)
          .where("status", "==", "active")
          .count()
          .get();

        const directProductCount = productsSnapshot.data().count;

        // Get child categories product count
        const childCategories = allCategories.filter((cat) =>
          cat.parentIds?.includes(category.id)
        );

        let childProductCount = 0;
        for (const child of childCategories) {
          const childProductsSnapshot = await db
            .collection("products")
            .where("categoryId", "==", child.id)
            .where("status", "==", "active")
            .count()
            .get();
          childProductCount += childProductsSnapshot.data().count;
        }

        return {
          ...category,
          directProductCount,
          childProductCount,
          totalProductCount: directProductCount + childProductCount,
          subcategoryCount: childCategories.length,
        };
      })
    );

    return (
      <CategoryPageClient
        allCategories={categoriesWithCounts}
        currentCategory={currentCategory}
        slug={slug}
      />
    );
  } catch (error) {
    console.error("Error fetching categories:", error);
    notFound();
  }
}
