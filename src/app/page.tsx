import InteractiveHeroBanner from "@/components/home/InteractiveHeroBanner";
import ModernFeaturedCategories from "@/components/home/ModernFeaturedCategories";
import ModernWhyChooseUs from "@/components/home/ModernWhyChooseUs";
import ModernCustomerReviews from "@/components/home/ModernCustomerReviews";
import { Box } from "@mui/material";
import { getAdminDb } from "@/lib/database/admin";
import type { Category } from "@/types";

interface CategoryWithCount extends Category {
  productCount: number;
  inStockCount?: number;
  outOfStockCount?: number;
}

export default async function HomePage() {
  // Fetch featured categories
  let featuredCategories: CategoryWithCount[] = [];
  
  try {
    const db = getAdminDb();
    
    // Get featured categories
    const categoriesSnapshot = await db
      .collection("categories")
      .where("featured", "==", true)
      .where("isActive", "==", true)
      .orderBy("sortOrder", "asc")
      .limit(6)
      .get();

    // Fetch product counts for each category
    const categoriesWithCounts = await Promise.all(
      categoriesSnapshot.docs.map(async (doc: any) => {
        const category = { id: doc.id, ...doc.data() } as Category;
        
        // Get total product count
        const productsSnapshot = await db
          .collection("products")
          .where("categoryId", "==", category.id)
          .where("status", "==", "active")
          .count()
          .get();

        // Get in-stock count
        const inStockSnapshot = await db
          .collection("products")
          .where("categoryId", "==", category.id)
          .where("status", "==", "active")
          .where("inStock", "==", true)
          .count()
          .get();

        // Get out-of-stock count
        const outOfStockSnapshot = await db
          .collection("products")
          .where("categoryId", "==", category.id)
          .where("status", "==", "active")
          .where("inStock", "==", false)
          .count()
          .get();

        return {
          ...category,
          productCount: productsSnapshot.data().count,
          inStockCount: inStockSnapshot.data().count,
          outOfStockCount: outOfStockSnapshot.data().count,
        } as CategoryWithCount;
      })
    );

    featuredCategories = categoriesWithCounts;
  } catch (error) {
    console.error("Error fetching featured categories:", error);
    // Continue with empty array - component will handle it
  }

  return (
    <Box>
      <InteractiveHeroBanner />
      <ModernFeaturedCategories categories={featuredCategories} />
      <ModernWhyChooseUs />
      <ModernCustomerReviews />
    </Box>
  );
}
