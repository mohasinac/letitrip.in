import InteractiveHeroBanner from "@/components/home/InteractiveHeroBanner";
import ModernFeaturedCategories from "@/components/home/ModernFeaturedCategories";
import ModernWhyChooseUs from "@/components/home/ModernWhyChooseUs";
import ModernCustomerReviews from "@/components/home/ModernCustomerReviews";
import { Box } from "@mui/material";

export default function HomePage() {
  return (
    <Box>
      <InteractiveHeroBanner />
      <ModernFeaturedCategories />
      <ModernWhyChooseUs />
      <ModernCustomerReviews />
    </Box>
  );
}
