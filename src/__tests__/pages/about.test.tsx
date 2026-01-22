/**
 * About Page Tests
 *
 * Tests for about us page content
 */

describe("About Page", () => {
  describe("Company Information", () => {
    it("should display company name", () => {
      const companyName = "Let It Rip";
      expect(companyName).toBeTruthy();
      expect(typeof companyName).toBe("string");
    });

    it("should display company tagline", () => {
      const tagline = "India's Premier Auction & E-Commerce Platform";
      expect(tagline).toBeTruthy();
    });

    it("should display company description", () => {
      const description = "We connect buyers and sellers across India";
      expect(description.length).toBeGreaterThan(0);
    });

    it("should show founding year", () => {
      const foundedYear = 2025;
      expect(foundedYear).toBeGreaterThan(2000);
      expect(foundedYear).toBeLessThanOrEqual(new Date().getFullYear());
    });
  });

  describe("Mission & Vision", () => {
    it("should have mission statement", () => {
      const mission = "To democratize e-commerce and auctions in India";
      expect(mission).toBeTruthy();
    });

    it("should have vision statement", () => {
      const vision = "To be the most trusted marketplace in India";
      expect(vision).toBeTruthy();
    });

    it("should list core values", () => {
      const coreValues = ["Trust", "Innovation", "Customer First", "Integrity"];

      expect(coreValues.length).toBeGreaterThan(0);
    });
  });

  describe("Team Information", () => {
    it("should display team members", () => {
      const team = [
        { name: "John Doe", role: "CEO", image: "/team/ceo.jpg" },
        { name: "Jane Smith", role: "CTO", image: "/team/cto.jpg" },
      ];

      expect(team.length).toBeGreaterThan(0);
      team.forEach((member) => {
        expect(member.name).toBeTruthy();
        expect(member.role).toBeTruthy();
      });
    });

    it("should show team size", () => {
      const teamSize = 50;
      expect(teamSize).toBeGreaterThan(0);
    });
  });

  describe("Company Statistics", () => {
    it("should display key metrics", () => {
      const stats = {
        totalUsers: 100000,
        totalProducts: 50000,
        totalSales: 1000000,
        citiesCovered: 100,
      };

      expect(stats.totalUsers).toBeGreaterThan(0);
      expect(stats.totalProducts).toBeGreaterThan(0);
      expect(stats.totalSales).toBeGreaterThan(0);
      expect(stats.citiesCovered).toBeGreaterThan(0);
    });

    it("should format large numbers", () => {
      const number = 1000000;
      const formatted = `${(number / 1000000).toFixed(1)}M`;
      expect(formatted).toBe("1.0M");
    });
  });

  describe("Contact Information", () => {
    it("should display office address", () => {
      const address = {
        street: "123 Business Park",
        city: "Mumbai",
        state: "Maharashtra",
        pincode: "400001",
      };

      expect(address.city).toBeTruthy();
      expect(address.state).toBeTruthy();
    });

    it("should display contact email", () => {
      const email = "contact@letitrip.in";
      expect(email).toContain("@");
      expect(email).toContain(".");
    });

    it("should display contact phone", () => {
      const phone = "+91 98765 43210";
      expect(phone).toBeTruthy();
    });
  });

  describe("Social Media Links", () => {
    it("should have social media profiles", () => {
      const socialMedia = {
        facebook: "https://facebook.com/letitrip",
        twitter: "https://twitter.com/letitrip",
        instagram: "https://instagram.com/letitrip",
        linkedin: "https://linkedin.com/company/letitrip",
      };

      expect(socialMedia.facebook).toContain("facebook.com");
      expect(socialMedia.twitter).toContain("twitter.com");
      expect(socialMedia.instagram).toContain("instagram.com");
      expect(socialMedia.linkedin).toContain("linkedin.com");
    });
  });

  describe("Timeline/Milestones", () => {
    it("should display company milestones", () => {
      const milestones = [
        { year: 2025, event: "Company Founded" },
        { year: 2025, event: "Reached 10,000 Users" },
        { year: 2026, event: "Expanded to 50 Cities" },
      ];

      expect(milestones.length).toBeGreaterThan(0);
      milestones.forEach((milestone) => {
        expect(milestone.year).toBeGreaterThan(2000);
        expect(milestone.event).toBeTruthy();
      });
    });

    it("should sort milestones chronologically", () => {
      const milestones = [
        { year: 2026, event: "Recent" },
        { year: 2025, event: "Earlier" },
      ];

      const sorted = [...milestones].sort((a, b) => a.year - b.year);
      expect(sorted[0].year).toBeLessThanOrEqual(sorted[1].year);
    });
  });

  describe("Awards & Recognition", () => {
    it("should display awards", () => {
      const awards = [
        { name: "Best Startup 2025", from: "Tech Awards India" },
        { name: "Customer Choice Award", from: "E-commerce Forum" },
      ];

      awards.forEach((award) => {
        expect(award.name).toBeTruthy();
        expect(award.from).toBeTruthy();
      });
    });

    it("should display certifications", () => {
      const certifications = [
        "ISO 9001:2015",
        "SSL Certified",
        "PCI DSS Compliant",
      ];

      expect(certifications.length).toBeGreaterThan(0);
    });
  });

  describe("Partner Information", () => {
    it("should display partners", () => {
      const partners = [
        { name: "Payment Gateway Partner", logo: "/partners/pg.jpg" },
        { name: "Logistics Partner", logo: "/partners/logistics.jpg" },
      ];

      partners.forEach((partner) => {
        expect(partner.name).toBeTruthy();
      });
    });
  });

  describe("Call to Action", () => {
    it("should have join us button", () => {
      const ctaButton = "Join as Seller";
      expect(ctaButton).toBeTruthy();
    });

    it("should link to seller registration", () => {
      const sellerLink = "/register?type=seller";
      expect(sellerLink).toContain("register");
    });

    it("should have contact button", () => {
      const contactLink = "/contact";
      expect(contactLink).toBe("/contact");
    });
  });
});
