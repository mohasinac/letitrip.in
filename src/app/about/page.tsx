import Link from "next/link";
import { parseMarkdownFile } from "@/lib/utils/markdown";

interface AboutPageProps {}

// This function runs at build time (SSG)
async function getAboutContent() {
  try {
    const companyData = await parseMarkdownFile("about/company.md");
    const teamData = await parseMarkdownFile("about/team.md");

    return {
      company: companyData,
      team: teamData,
    };
  } catch (error) {
    console.error("Error loading about content:", error);
    return {
      company: { content: "", metadata: {} },
      team: { content: "", metadata: {} },
    };
  }
}

export default async function AboutPage() {
  const { company, team } = await getAboutContent();

  return (
    <main className="flex-1">
      {/* Hero Section */}
      <section className="bg-theme-primary text-white">
        <div className="container py-20 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            {company.metadata?.title || "About JustForView"}
          </h1>
          <p className="text-lg md:text-xl opacity-90 max-w-3xl mx-auto">
            {company.metadata?.description ||
              "Your trusted destination for authentic hobby products, rare collectibles, and premium gaming accessories since 2020."}
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 bg-theme-background">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6 text-theme-text">
                Our Story
              </h2>
              <div className="prose text-theme-muted space-y-4">
                {company.content ? (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: company.content
                        .replace(/\n/g, "</p><p>")
                        .replace(/^/, "<p>")
                        .replace(/$/, "</p>"),
                    }}
                  />
                ) : (
                  <>
                    <p>
                      JustForView was born from a passion for authentic hobby
                      products and the frustration of finding genuine items in
                      the market. What started as a small collection grew into
                      India's premier destination for Beyblades, collectibles,
                      and gaming accessories.
                    </p>
                    <p>
                      We understand the excitement of unboxing a new product,
                      the thrill of finding that rare item you've been searching
                      for, and the importance of authenticity in collectibles.
                      That's why we've built our entire business around these
                      core values.
                    </p>
                  </>
                )}
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-theme-accent to-theme-secondary rounded-2xl overflow-hidden">
                <img
                  src={company.metadata?.image || "/images/about-story.jpg"}
                  alt="Our Story"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-theme-accent">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="card bg-theme-background p-8 text-center border border-theme-primary hover-glow-theme">
              <div className="w-16 h-16 bg-theme-accent rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-8 h-8 text-theme-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-theme-text">
                Our Mission
              </h3>
              <p className="text-theme-muted">
                To provide authentic, high-quality hobby products while building
                a passionate community of collectors and enthusiasts across
                India.
              </p>
            </div>
            <div className="card bg-theme-background p-8 text-center border border-theme-secondary hover-glow-theme">
              <div className="w-16 h-16 bg-theme-accent rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-8 h-8 text-theme-secondary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-theme-text">
                Our Vision
              </h3>
              <p className="text-theme-muted">
                To become the most trusted and comprehensive platform for hobby
                enthusiasts, expanding globally while maintaining our commitment
                to authenticity.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-theme-background">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12 text-theme-text">
            Our Values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-theme-accent rounded-full flex items-center justify-center mx-auto mb-6 hover-glow-theme">
                <svg
                  className="w-10 h-10 text-theme-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4 text-theme-text">
                Authenticity
              </h3>
              <p className="text-theme-muted">
                Every product is 100% genuine and verified. We work directly
                with authorized distributors and brands to ensure authenticity.
              </p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-theme-accent rounded-full flex items-center justify-center mx-auto mb-6 hover-glow-theme">
                <svg
                  className="w-10 h-10 text-theme-secondary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4 text-theme-text">
                Community
              </h3>
              <p className="text-theme-muted">
                We're more than a store - we're a community. We connect
                enthusiasts, share knowledge, and celebrate the passion for
                collecting.
              </p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-theme-accent rounded-full flex items-center justify-center mx-auto mb-6 hover-glow-theme">
                <svg
                  className="w-10 h-10 text-theme-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4 text-theme-text">
                Excellence
              </h3>
              <p className="text-theme-muted">
                From product quality to customer service, we strive for
                excellence in everything we do. Your satisfaction is our
                priority.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-theme-accent">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12 text-theme-text">
            Meet Our Team
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Arjun Sharma",
                role: "Founder & CEO",
                image: "/team/founder.jpg",
                bio: "Passionate collector with 15+ years in the hobby industry",
              },
              {
                name: "Priya Patel",
                role: "Head of Operations",
                image: "/team/operations.jpg",
                bio: "Expert in supply chain and ensuring product authenticity",
              },
              {
                name: "Rahul Kumar",
                role: "Community Manager",
                image: "/team/community.jpg",
                bio: "Connecting enthusiasts and building our vibrant community",
              },
            ].map((member, index) => (
              <div
                key={index}
                className="card bg-theme-background p-6 text-center border border-theme-primary hover-glow-theme"
              >
                <div className="w-24 h-24 rounded-full bg-theme-muted mx-auto mb-4 overflow-hidden">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="font-bold mb-1 text-theme-text">
                  {member.name}
                </h3>
                <p className="text-theme-primary font-medium mb-2">
                  {member.role}
                </p>
                <p className="text-sm text-theme-muted">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-theme-background">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-theme-primary mb-2">
                50K+
              </div>
              <div className="text-theme-muted">Happy Customers</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-theme-primary mb-2">
                10K+
              </div>
              <div className="text-theme-muted">Products Sold</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-theme-primary mb-2">
                500+
              </div>
              <div className="text-theme-muted">Live Auctions</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-theme-primary mb-2">
                99%
              </div>
              <div className="text-theme-muted">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-4">Join Our Community</h2>
          <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
            Ready to discover authentic products and connect with fellow
            enthusiasts?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/products"
              className="inline-flex items-center justify-center px-8 py-4 bg-theme-primary text-white rounded-xl font-bold hover:bg-theme-secondary transition-all duration-300 shadow-xl border-4 border-theme-primary"
            >
              Shop Now
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-theme-primary rounded-xl font-bold hover:bg-gray-100 transition-all duration-300 shadow-xl border-4 border-white"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
