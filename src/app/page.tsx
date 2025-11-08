import FeaturedCategories from "@/components/layout/FeaturedCategories";
import FAQSection from "@/components/faq/FAQSection";
import ShopsNav from "@/components/layout/ShopsNav";

export default function Home() {
  return (
    <main id="home-page" className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        {/* Hero Section */}
        <section id="hero-section" className="relative">
          {/* TODO: make the hero carousel 
          it takes carousel hero slide from the admin and then displays it here
          each slide has an image, title, subtitle, call to action button with link
          implement using a carousel library or custom implementation
          i want to improve the design as much as possible so that it stands out and attracts users
          */}
        </section>
        {/* Heading Section */}
        {/* TODO: make the heading section consise so that user understands and out hero carousel doesnt become a duplicate */}
        <section
          id="heading-section"
          className="bg-gradient-to-r from-blue-100 via-yellow-50 to-red-50 rounded-lg p-8 md:p-12 text-center"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Let It Rip! 🎯
          </h1>
          <p className="text-xl md:text-2xl text-gray-800 mb-4 font-semibold">
            India's #1 Store for Authentic Collectibles
          </p>
          <p className="text-lg text-gray-700 mb-6 max-w-3xl mx-auto">
            Beyblades • Pokemon TCG • Yu-Gi-Oh • Transformers • Hot Wheels •
            Stickers & More!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
            <div className="flex items-center gap-2 text-green-700 font-medium">
              <span className="text-2xl">✅</span>
              <span>100% Authentic</span>
            </div>
            <div className="flex items-center gap-2 text-green-700 font-medium">
              <span className="text-2xl">✅</span>
              <span>Zero Customs Charges</span>
            </div>
            <div className="flex items-center gap-2 text-green-700 font-medium">
              <span className="text-2xl">✅</span>
              <span>Fast India Delivery</span>
            </div>
          </div>
          <button className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 px-8 py-3 rounded-lg font-bold text-lg shadow-lg hover:shadow-xl transition-all">
            Shop Now
          </button>
        </section>
        {/* 5. Featured Categories */}
        <FeaturedCategories />
        {/* Featured Categories Section */}
        {/* TODO: make the categories section */}
        <section id="featured-categories">
          {/* Placeholder for Featured Categories - Implement as needed
          uses the homepage categories flag only
           upto 5 categorie subsections 
           with each showing at most 10 products horizontally scrollable using a ProductCard component and arrow buttons to navigate with title of the cateogry
           bottom link to view all in that category
          */}
        </section>

        {/* Featured Products Section */}
        {/* TODO: make the products section */}
        <section id="featured-products">
          {/* Placeholder for Featured Products - Implement as needed
          uses the homepage product flag
           1 rows of products with horizontal scrolling using a ProductCard component and arrow buttons to navigate upto 10 across whole application
           if not met 10 then take from featured products from existing shops
           bottom link to view all products
          */}
        </section>

        {/* Featured auctions Section */}
        {/* TODO: make the auctions section */}
        <section id="featured-auctions">
          {/* Placeholder for Featured Auctions - Implement as needed
          uses the homepage auctions flag
           1 rows of auctions with horizontal scrolling using a AuctionCard component and arrow buttons to navigate upto 10 across whole application
           if not met 10 then take from featured products from existing shops
           bottom link to view all auctions
          */}
        </section>
        {/* 3. Shops Navigation */}
        {/* TODO: make the shops section */}
        <ShopsNav />
        <section id="featured-shops">
          {/* Placeholder for Featured Shops - Implement as needed
          uses the homepage shops flag only
           upto 5 shops subsections
           with each showing at most 10 products horizontally scrollable using a ProductCard component and arrow buttons to navigate with title of the cateogry
           bottom link to view all  that shop
          */}
        </section>
        {/* Featured blog posts Section */}
        {/* TODO: make the blogs posts section */}
        <section id="featured-blogs">
          {/* Placeholder for Featured Blogs - Implement as needed
          uses the homepage blogs flag
           1 rows of blogs with horizontal scrolling using a BlogCard component and arrow buttons to navigate upto 10 across whole application
           if not met 10 then take from featured blogs from existing shops
           bottom link to view all blogs
          */}
        </section>
        {/* Featured reviews posts Section */}
        {/* TODO: make the blogs posts section */}
        <section id="featured-reviews">
          {/* Placeholder for Featured Reviews - Implement as needed
          uses the homepage reviews flag
           1 rows of reviews with horizontal scrolling using a ReviewCard component and arrow buttons to navigate upto 10 across whole application
           if not met 10 then take from featured reviews from existing shops
           bottom link to view all reviews
          */}
        </section>
        {/* FAQ Section */}
        <section id="faq-section" className="py-8">
          <FAQSection
            title="Frequently Asked Questions"
            description="Quick answers about authentic collectibles, shipping, and more"
            maxItemsToShow={6}
            defaultCategory="getting-started"
          />
        </section>
      </div>
    </main>
  );
}
