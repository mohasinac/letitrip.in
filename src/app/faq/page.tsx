"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  InputAdornment,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  useTheme,
} from "@mui/material";
import {
  Search,
  ExpandMore,
  Email,
  Chat,
  Phone,
  HelpOutline,
} from "@mui/icons-material";
import { useBreadcrumbTracker } from "@/hooks/useBreadcrumbTracker";

interface FAQItem {
  question: string;
  answer: string;
  category?: string;
}

export default function FAQPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [faqData, setFAQData] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

  // Add breadcrumb
  useBreadcrumbTracker([
    {
      label: "FAQ",
      href: "/faq",
      active: true,
    },
  ]);

  useEffect(() => {
    async function loadFAQData() {
      try {
        // Simulate loading FAQ data
        await new Promise((resolve) => setTimeout(resolve, 500));

        const faqs: FAQItem[] = [
          {
            question: "How can I contact customer support?",
            answer:
              "You can reach us through our contact form, email us at support@justforview.in, or call us during business hours at +91 98765 43210.",
            category: "Support",
          },
          {
            question: "How long does shipping take?",
            answer:
              "We offer free shipping on orders above ₹1000. Standard delivery takes 3-5 business days, while express delivery takes 1-2 business days within India.",
            category: "Shipping",
          },
          {
            question: "Do you sell authentic Beyblades?",
            answer:
              "Yes, we guarantee 100% authentic products. We work directly with authorized distributors and provide certificates of authenticity where applicable.",
            category: "Products",
          },
          {
            question: "How do Beyblade auctions work?",
            answer:
              "Our live auctions allow you to bid on rare and exclusive Beyblades. You can place bids during the auction period, and the highest bidder wins when the auction ends.",
            category: "Auctions",
          },
          {
            question: "What is your return policy?",
            answer:
              "We offer easy returns within 7 days of delivery for unopened items in original condition. For auction items, returns are subject to specific terms mentioned in the auction.",
            category: "Returns",
          },
          {
            question: "How can I track my order?",
            answer:
              "Once your order ships, you'll receive a tracking number via email and SMS. You can also check your order status in your account dashboard.",
            category: "Orders",
          },
          {
            question: "Do you offer international shipping?",
            answer:
              "Currently, we only ship within India. We're working on expanding our shipping to international locations. Please check back for updates.",
            category: "Shipping",
          },
          {
            question: "What payment methods do you accept?",
            answer:
              "We accept all major credit/debit cards, UPI, net banking, and cash on delivery for orders within India. All payments are processed securely.",
            category: "Payment",
          },
          {
            question: "How do I participate in tournaments?",
            answer:
              "We regularly host Beyblade tournaments. Follow our social media or subscribe to our newsletter to get notified about upcoming events and registration details.",
            category: "Tournaments",
          },
          {
            question: "Do you offer bulk discounts?",
            answer:
              "Yes, we offer special pricing for bulk orders and retailers. Please contact our sales team at sales@justforview.in for bulk pricing information.",
            category: "Pricing",
          },
        ];

        setFAQData(faqs);
      } catch (error) {
        console.error("Error loading FAQ data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadFAQData();
  }, []);

  // Get unique categories from FAQ data
  const categories = [
    { id: "all", name: "All Categories", count: faqData.length },
    ...Array.from(
      new Set(faqData.map((item) => item.category || "General")),
    ).map((category) => ({
      id: category.toLowerCase(),
      name: category,
      count: faqData.filter((item) => (item.category || "General") === category)
        .length,
    })),
  ];

  const filteredFAQs = faqData.filter((item) => {
    const itemCategory = (item.category || "General").toLowerCase();
    const matchesCategory =
      selectedCategory === "all" || itemCategory === selectedCategory;
    const matchesSearch =
      searchQuery === "" ||
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box sx={{ textAlign: "center" }}>
          <CircularProgress size={48} sx={{ mb: 2 }} />
          <Typography variant="body1" color="text.secondary">
            Loading FAQ...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          py: { xs: 8, md: 12 },
          color: "white",
        }}
      >
        <Container maxWidth="xl">
          <Box sx={{ textAlign: "center" }}>
            <Typography
              variant="h1"
              sx={{ fontWeight: 700, mb: 3, color: "white" }}
            >
              Frequently Asked Questions
            </Typography>
            <Typography
              variant="h6"
              sx={{ maxWidth: 800, mx: "auto", color: "white", opacity: 0.9 }}
            >
              Find answers to common questions about our Beyblade products,
              shipping, returns, and more. Can't find what you're looking for?
              Contact our support team.
            </Typography>
          </Box>
        </Container>
      </Box>

      <Box sx={{ py: 8 }}>
        <Container maxWidth="xl">
          {/* Search Bar */}
          <Box sx={{ maxWidth: 600, mx: "auto", mb: 6 }}>
            <TextField
              fullWidth
              placeholder="Search FAQ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 3,
                },
              }}
            />
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", lg: "300px 1fr" },
              gap: 6,
            }}
          >
            {/* Categories Sidebar */}
            <Box>
              <Card sx={{ p: 3, borderRadius: 3, position: "sticky", top: 24 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Categories
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  {categories.map((category) => (
                    <Chip
                      key={category.id}
                      label={`${category.name} (${category.count})`}
                      onClick={() => setSelectedCategory(category.id)}
                      variant={
                        selectedCategory === category.id ? "filled" : "outlined"
                      }
                      color={
                        selectedCategory === category.id ? "primary" : "default"
                      }
                      sx={{
                        justifyContent: "space-between",
                        px: 2,
                        py: 1,
                        height: "auto",
                        "& .MuiChip-label": {
                          width: "100%",
                          textAlign: "left",
                        },
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          transform: "translateX(4px)",
                        },
                      }}
                    />
                  ))}
                </Box>
              </Card>
            </Box>

            {/* FAQ Content */}
            <Box>
              {filteredFAQs.length > 0 ? (
                <Box>
                  {filteredFAQs.map((item, index) => (
                    <Accordion
                      key={`${item.question}-${index}`}
                      sx={{
                        mb: 2,
                        borderRadius: 2,
                        "&:before": { display: "none" },
                        boxShadow: theme.shadows[2],
                        "&.Mui-expanded": {
                          boxShadow: theme.shadows[4],
                        },
                      }}
                    >
                      <AccordionSummary
                        expandIcon={<ExpandMore />}
                        sx={{
                          px: 3,
                          py: 2,
                          "&.Mui-expanded": {
                            borderBottom: `1px solid ${theme.palette.divider}`,
                          },
                        }}
                      >
                        <Typography variant="h6" fontWeight={500}>
                          {item.question}
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails sx={{ px: 3, py: 2 }}>
                        <Typography
                          variant="body1"
                          color="text.secondary"
                          sx={{ lineHeight: 1.7 }}
                        >
                          {item.answer}
                        </Typography>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </Box>
              ) : (
                <Card sx={{ p: 8, textAlign: "center", borderRadius: 3 }}>
                  <HelpOutline
                    sx={{ fontSize: 64, color: "text.secondary", mb: 2 }}
                  />
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    No results found
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Try adjusting your search or browse different categories.
                  </Typography>
                </Card>
              )}
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Still Need Help Section */}
      <Box sx={{ py: 8, backgroundColor: "background.paper" }}>
        <Container maxWidth="xl">
          <Card sx={{ p: 6, textAlign: "center", borderRadius: 3 }}>
            <Typography variant="h3" fontWeight={700} gutterBottom>
              Still need help?
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ mb: 6, maxWidth: 600, mx: "auto" }}
            >
              Can't find the answer you're looking for? Our customer support
              team is here to help. Get in touch with us through any of the
              following methods.
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
                gap: 4,
                maxWidth: 900,
                mx: "auto",
              }}
            >
              <Card
                sx={{
                  p: 4,
                  textAlign: "center",
                  borderRadius: 3,
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: theme.shadows[8],
                  },
                }}
                component="a"
                href="mailto:support@justforview.in"
              >
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: 2,
                    backgroundColor: "primary.main",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mx: "auto",
                    mb: 2,
                  }}
                >
                  <Email sx={{ fontSize: 32, color: "white" }} />
                </Box>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Email Support
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 3 }}
                >
                  Get detailed help via email
                </Typography>
                <Button variant="outlined" size="small">
                  Email Us
                </Button>
              </Card>

              <Card
                sx={{
                  p: 4,
                  textAlign: "center",
                  borderRadius: 3,
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: theme.shadows[8],
                  },
                }}
              >
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: 2,
                    backgroundColor: "primary.main",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mx: "auto",
                    mb: 2,
                  }}
                >
                  <Chat sx={{ fontSize: 32, color: "white" }} />
                </Box>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Live Chat
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 3 }}
                >
                  Chat with us in real-time
                </Typography>
                <Button variant="outlined" size="small">
                  Start Chat
                </Button>
              </Card>

              <Card
                sx={{
                  p: 4,
                  textAlign: "center",
                  borderRadius: 3,
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: theme.shadows[8],
                  },
                }}
                component="a"
                href="tel:+919876543210"
              >
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: 2,
                    backgroundColor: "primary.main",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mx: "auto",
                    mb: 2,
                  }}
                >
                  <Phone sx={{ fontSize: 32, color: "white" }} />
                </Box>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Phone Support
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 3 }}
                >
                  Call us during business hours
                </Typography>
                <Button variant="outlined" size="small">
                  Call Us
                </Button>
              </Card>
            </Box>
          </Card>
        </Container>
      </Box>
    </Box>
  );
}
