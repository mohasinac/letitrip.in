"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  CheckCircle,
  Shield,
  Rocket,
  MessageCircle,
  Star,
  ArrowRight,
  Users,
  Package2,
  Mail,
} from "lucide-react";

interface SiteSettings {
  homePageSections: HomePageSection[];
  [key: string]: any;
}

interface HomePageSection {
  id: string;
  type: string;
  title: string;
  enabled: boolean;
  order: number;
  content: any;
}

interface Review {
  id: string;
  name: string;
  text: string;
  rating: number;
  avatar: string;
}

export default function ConfigurableHomePage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Newsletter section state
  const [email, setEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch settings
        const settingsRes = await fetch("/api/settings");
        if (!settingsRes.ok) {
          throw new Error("Failed to fetch settings");
        }
        const settingsData = await settingsRes.json();
        setSettings(settingsData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        setError("Failed to load page data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Enhanced data fetching with loading states
  useEffect(() => {
    const fetchDynamicData = async () => {
      if (!settings?.homePageSections) return;

      try {
        // No dynamic data to fetch currently
      } catch (error) {
        console.error("Failed to fetch dynamic data:", error);
      }
    };

    fetchDynamicData();
  }, [settings]);

  // Memoize expensive computations
  const timeBasedGreeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 6)
      return {
        greeting: "🌙 Late night browsing?",
        color: "from-indigo-900 to-purple-900",
      };
    if (hour < 12)
      return {
        greeting: "🌅 Good morning!",
        color: "from-orange-400 to-pink-400",
      };
    if (hour < 17)
      return {
        greeting: "☀️ Good afternoon!",
        color: "from-blue-400 to-cyan-400",
      };
    if (hour < 21)
      return {
        greeting: "🌆 Good evening!",
        color: "from-purple-400 to-pink-400",
      };
    return {
      greeting: "🌃 Good night!",
      color: "from-indigo-600 to-purple-600",
    };
  }, []);

  const renderHeroSection = (section: HomePageSection) => {
    const { mainBanner, sideBanner } = section.content;

    return (
      <section
        key={section.id}
        className={`bg-gradient-to-r ${timeBasedGreeting.color} text-white relative overflow-hidden`}
      >
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        <div className="container py-20 md:py-32 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            {/* Main Banner */}
            <div className="lg:col-span-2">
              <div className="inline-block mb-4 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium animate-pulse">
                {timeBasedGreeting.greeting} Premium Quality Reviews
              </div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                {mainBanner?.title || "Discover Amazing Stores & Reviews"}
              </h1>
              <p className="text-lg md:text-xl mb-8 text-blue-100 leading-relaxed">
                {mainBanner?.subtitle ||
                  "Your one-stop platform for discovering the best stores and reading authentic reviews"}
              </p>

              {/* Stats */}
              <div className="flex flex-wrap gap-6 mb-8">
                <div className="text-center">
                  <div className="text-2xl font-bold">100+</div>
                  <div className="text-sm text-blue-200">Stores</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">5000+</div>
                  <div className="text-sm text-blue-200">Happy Customers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">1000+</div>
                  <div className="text-sm text-blue-200">Reviews</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/stores"
                  className="btn bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 text-lg transition-all duration-300 hover:shadow-lg hover:scale-105"
                >
                  Browse Stores &rarr;
                </Link>
                <Link
                  href="/reviews"
                  className="btn bg-transparent border-2 border-white hover:bg-white/10 px-8 py-3 text-lg transition-all duration-300 hover:shadow-lg"
                >
                  View Reviews �
                </Link>
                <Link
                  href="/stores"
                  className="btn bg-transparent border-2 border-white hover:bg-white/10 px-8 py-3 text-lg transition-all duration-300 hover:shadow-lg"
                >
                  Browse Stores 🏪
                </Link>
              </div>
            </div>

            {/* Side Banner Carousel removed as requested */}
          </div>
        </div>
      </section>
    );
  };

  const renderSaleCarouselSection = (section: HomePageSection) => {
    return (
      <section
        key={section.id}
        className="py-16 bg-gradient-to-br from-orange-50 via-red-50 to-pink-50"
      >
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">🔥 {section.title}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explore our amazing offers and discover great deals
            </p>
          </div>
        </div>
      </section>
    );
  };

  const renderFeaturesSection = (section: HomePageSection) => {
    const features = [
      {
        icon: <CheckCircle className="w-8 h-8" />,
        title: "Verified Reviews",
        description: "100% authentic customer reviews",
        color: "bg-green-500",
      },
      {
        icon: <Shield className="w-8 h-8" />,
        title: "Trusted Platform",
        description: "Safe & reliable store discovery",
        color: "bg-blue-500",
      },
      {
        icon: <Users className="w-8 h-8" />,
        title: "Community Driven",
        description: "Real feedback from real users",
        color: "bg-purple-500",
      },
      {
        icon: <MessageCircle className="w-8 h-8" />,
        title: "24/7 Support",
        description: "Always here to help you",
        color: "bg-orange-500",
      },
    ];

    return (
      <section
        key={section.id}
        className="py-16 bg-gradient-to-b from-gray-50 to-white"
      >
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose JustForView?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We're committed to providing the best store discovery experience
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="text-center group hover:transform hover:scale-105 transition-all duration-300"
              >
                <div
                  className={`w-16 h-16 ${feature.color} rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-shadow text-white`}
                >
                  {feature.icon}
                </div>
                <h3 className="font-semibold mb-2 text-lg">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  };

  const renderCategoriesSection = (section: HomePageSection) => {
    return (
      <section key={section.id} className="py-16">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">{section.title}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explore our wide range of features to find exactly what you're
              looking for
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <Link
              href="/stores"
              className="card p-6 text-center hover:shadow-lg transition-all duration-300 group hover:transform hover:scale-105"
            >
              <div className="mb-4 group-hover:animate-bounce flex justify-center">
                <Package2 className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="font-semibold group-hover:text-primary transition-colors text-sm">
                Stores
              </h3>
            </Link>
            <Link
              href="/reviews"
              className="card p-6 text-center hover:shadow-lg transition-all duration-300 group hover:transform hover:scale-105"
            >
              <div className="mb-4 group-hover:animate-bounce flex justify-center">
                <Star className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="font-semibold group-hover:text-primary transition-colors text-sm">
                Reviews
              </h3>
            </Link>
            <Link
              href="/about"
              className="card p-6 text-center hover:shadow-lg transition-all duration-300 group hover:transform hover:scale-105"
            >
              <div className="mb-4 group-hover:animate-bounce flex justify-center">
                <Users className="w-8 h-8 text-purple-500" />
              </div>
              <h3 className="font-semibold group-hover:text-primary transition-colors text-sm">
                About Us
              </h3>
            </Link>
            <Link
              href="/contact"
              className="card p-6 text-center hover:shadow-lg transition-all duration-300 group hover:transform hover:scale-105"
            >
              <div className="mb-4 group-hover:animate-bounce flex justify-center">
                <Mail className="w-8 h-8 text-orange-500" />
              </div>
              <h3 className="font-semibold group-hover:text-primary transition-colors text-sm">
                Contact
              </h3>
            </Link>
          </div>
        </div>
      </section>
    );
  };

  // Newsletter section handler
  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubscribing(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubscribing(false);
      setSubscribed(true);
      setEmail("");
    }, 1500);
  };

  const renderNewsletterReviewsSection = (section: HomePageSection) => {
    const {
      showReviews = true,
      showNewsletter = true,
      reviews = [],
    } = section.content;

    return (
      <section
        key={section.id}
        className="py-16 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50"
      >
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Reviews Section */}
            {showReviews && (
              <div>
                <div className="text-center lg:text-left mb-8">
                  <h2 className="text-3xl font-bold mb-4">
                    💬 See What Others Say About Us
                  </h2>
                  <p className="text-muted-foreground text-lg">
                    Join thousands of satisfied customers who trust us for store
                    discovery and reviews
                  </p>
                </div>

                <div className="space-y-6">
                  {reviews.map((review: Review) => (
                    <div
                      key={review.id}
                      className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
                    >
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold">
                          {review.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-semibold">{review.name}</h4>
                            <div className="flex text-yellow-400">
                              {Array.from({ length: review.rating }, (_, i) => (
                                <span key={i}>⭐</span>
                              ))}
                            </div>
                          </div>
                          <p className="text-muted-foreground italic">
                            "{review.text}"
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-center lg:text-left mt-8">
                  <Link
                    href="/reviews"
                    className="btn btn-outline hover:transform hover:scale-105 transition-all duration-300"
                  >
                    Read More Reviews 📖
                  </Link>
                </div>
              </div>
            )}

            {/* Newsletter Section */}
            {showNewsletter && (
              <div>
                <div className="text-center lg:text-left mb-8">
                  <Mail className="w-16 h-16 mb-6 mx-auto lg:mx-0 text-purple-500" />
                  <h2 className="text-3xl font-bold mb-4">Stay Updated!</h2>
                  <p className="text-muted-foreground text-lg mb-6">
                    Subscribe to our newsletter for the latest store
                    discoveries, reviews, and platform updates.
                  </p>
                </div>

                {subscribed ? (
                  <div className="bg-green-100 text-green-800 p-6 rounded-lg">
                    <div className="text-4xl mb-2">🎉</div>
                    <h3 className="font-bold text-lg mb-2">
                      Welcome to the family!
                    </h3>
                    <p>
                      You'll receive our latest updates and exclusive offers.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubscribe} className="space-y-4">
                    <input
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input w-full text-lg py-3"
                      required
                    />
                    <button
                      type="submit"
                      disabled={isSubscribing}
                      className="btn btn-primary w-full py-3 text-lg disabled:opacity-50 transition-all duration-300 hover:transform hover:scale-105 flex items-center justify-center"
                    >
                      {isSubscribing ? (
                        "Subscribing..."
                      ) : (
                        <>
                          Subscribe Now <Rocket className="ml-2 w-5 h-5" />
                        </>
                      )}
                    </button>
                  </form>
                )}

                <p className="text-sm text-muted-foreground mt-4 text-center lg:text-left">
                  No spam, unsubscribe at any time. We respect your privacy.
                </p>

                <div className="mt-8 p-6 bg-white rounded-lg shadow-lg">
                  <h3 className="font-bold text-lg mb-4">
                    💡 Ready to Join Us?
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Create an account and start your store discovery journey
                    with us!
                  </p>
                  <Link
                    href="/auth/register"
                    className="btn btn-secondary w-full transition-all duration-300 hover:transform hover:scale-105"
                  >
                    Register Now 🎯
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    );
  };

  const renderSection = (section: HomePageSection) => {
    if (!section.enabled) return null;

    switch (section.type) {
      case "hero":
        return renderHeroSection(section);
      case "features":
        return renderFeaturesSection(section);
      case "categories":
        return renderCategoriesSection(section);
      case "newsletter":
      case "newsletter-reviews":
        return renderNewsletterReviewsSection(section);
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-4"></div>
          <p className="text-lg font-medium text-muted-foreground">
            Loading amazing content...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-r from-red-50 to-pink-50">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold mb-4">
            Oops! Something went wrong
          </h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn btn-primary"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  if (!settings) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚙️</div>
          <p className="text-lg">Failed to load page settings</p>
        </div>
      </main>
    );
  }

  // Sort sections by order and move newsletter to bottom
  const sortedSections = [...settings.homePageSections].sort((a, b) => {
    if (a.type === "newsletter") return 1;
    if (b.type === "newsletter") return -1;
    return a.order - b.order;
  });

  return (
    <>
      <main className="flex-1">{sortedSections.map(renderSection)}</main>
    </>
  );
}
