import HeroBanner from "@/components/home/HeroBanner";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import FeaturedCategories from "@/components/home/FeaturedCategories";
import CustomerReviews from "@/components/home/CustomerReviews";
import SpecialCollections from "@/components/home/SpecialCollections";
import SpecialOffers from "@/components/home/SpecialOffers";
import Newsletter from "@/components/home/Newsletter";
import ContactSection from "@/components/home/ContactSection";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-theme-background">
      <HeroBanner />
      <WhyChooseUs />
      <FeaturedCategories />
      <CustomerReviews />
      <SpecialCollections />
      <SpecialOffers />
      <Newsletter />
      <ContactSection />
    </div>
  );
}
