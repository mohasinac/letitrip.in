"use client";

import { useState } from "react";
import {
  Box,
  Typography,
  Stack,
  Card,
  Tab,
  Tabs,
  Button,
  TextField,
  MenuItem,
} from "@mui/material";
import Link from "next/link";

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  category: string;
  message: string;
  orderNumber: string;
}

interface SupportCategory {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  links: {
    title: string;
    href: string;
    description: string;
  }[];
}

export default function HelpPage() {
  const [activeTab, setActiveTab] = useState("help");
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    subject: "",
    category: "general",
    message: "",
    orderNumber: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const supportCategories: SupportCategory[] = [
    {
      id: "orders",
      title: "Orders & Shipping",
      description: "Track orders, shipping info, and delivery questions",
      icon: (
        <svg
          className="h-8 w-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          />
        </svg>
      ),
      links: [
        {
          title: "Track Your Order",
          href: "/orders",
          description: "View order status and tracking information",
        },
        {
          title: "Shipping Information",
          href: "/shipping-info",
          description: "Delivery times and shipping costs",
        },
        {
          title: "Order Changes",
          href: "/faq#orders",
          description: "Modify or cancel your order",
        },
        {
          title: "International Shipping",
          href: "/faq#shipping",
          description: "Global delivery options",
        },
      ],
    },
    {
      id: "returns",
      title: "Returns & Refunds",
      description: "Return items, refunds, and exchange policies",
      icon: (
        <svg
          className="h-8 w-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
          />
        </svg>
      ),
      links: [
        {
          title: "Return Policy",
          href: "/returns",
          description: "Learn about our 30-day return policy",
        },
        {
          title: "Start a Return",
          href: "/orders",
          description: "Initiate a return from your order history",
        },
        {
          title: "Refund Status",
          href: "/orders",
          description: "Check the status of your refund",
        },
        {
          title: "Exchange Items",
          href: "/faq#orders",
          description: "Exchange for different size or color",
        },
      ],
    },
    {
      id: "products",
      title: "Product Information",
      description: "Beyblade specs, compatibility, and authenticity",
      icon: (
        <svg
          className="h-8 w-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      links: [
        {
          title: "Product Authenticity",
          href: "/faq#products",
          description: "Verify authentic Beyblade products",
        },
        {
          title: "Compatibility Guide",
          href: "/compatibility",
          description: "Check Beyblade part compatibility",
        },
        {
          title: "Battle Rules",
          href: "/battle-rules",
          description: "Official Beyblade battle regulations",
        },
        {
          title: "Care Instructions",
          href: "/care-guide",
          description: "Maintain your Beyblades properly",
        },
      ],
    },
    {
      id: "account",
      title: "Account & Payment",
      description: "Login issues, payment methods, and account settings",
      icon: (
        <svg
          className="h-8 w-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
      links: [
        {
          title: "Account Settings",
          href: "/account",
          description: "Update your profile and preferences",
        },
        {
          title: "Password Reset",
          href: "/forgot-password",
          description: "Reset your account password",
        },
        {
          title: "Payment Methods",
          href: "/account/payment",
          description: "Manage saved payment methods",
        },
        {
          title: "Address Book",
          href: "/addresses",
          description: "Manage shipping addresses",
        },
      ],
    },
  ];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSubmitting(false);
    alert("Message sent successfully!");
    setFormData({
      name: "",
      email: "",
      subject: "",
      category: "general",
      message: "",
      orderNumber: "",
    });
  };

  return (
    <Box sx={{ minHeight: "100vh", py: 4 }}>
      <Box sx={{ maxWidth: "1200px", mx: "auto", px: 2 }}>
        <Stack spacing={4}>
          {/* Header */}
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="h3" component="h1" gutterBottom>
              Help Center
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Get help with your Beyblade orders, products, and account
            </Typography>
          </Box>

          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs
              value={activeTab}
              onChange={(e, value) => setActiveTab(value)}
            >
              <Tab label="Browse Help Topics" value="help" />
              <Tab label="Contact Us" value="contact" />
            </Tabs>
          </Box>

          {/* Help Topics Tab */}
          {activeTab === "help" && (
            <Box>
              <Typography variant="h5" gutterBottom>
                Browse Help Topics
              </Typography>
              <Stack spacing={3}>
                {supportCategories.map((category) => (
                  <Card key={category.id} sx={{ p: 3 }}>
                    <Stack direction="row" spacing={2} alignItems="flex-start">
                      <Box sx={{ color: "primary.main", mt: 1 }}>
                        {category.icon}
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" gutterBottom>
                          {category.title}
                        </Typography>
                        <Typography color="text.secondary" sx={{ mb: 2 }}>
                          {category.description}
                        </Typography>
                        <Stack spacing={1}>
                          {category.links.map((link, index) => (
                            <Box key={index}>
                              <Link
                                href={link.href}
                                style={{ textDecoration: "none" }}
                              >
                                <Typography
                                  variant="body1"
                                  sx={{
                                    color: "primary.main",
                                    "&:hover": { textDecoration: "underline" },
                                  }}
                                >
                                  {link.title}
                                </Typography>
                              </Link>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                {link.description}
                              </Typography>
                            </Box>
                          ))}
                        </Stack>
                      </Box>
                    </Stack>
                  </Card>
                ))}
              </Stack>
            </Box>
          )}

          {/* Contact Tab */}
          {activeTab === "contact" && (
            <Box>
              <Typography variant="h5" gutterBottom>
                Contact Support
              </Typography>
              <Stack direction={{ xs: "column", md: "row" }} spacing={4}>
                {/* Contact Form */}
                <Box sx={{ flex: 1 }}>
                  <Card sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Send us a message
                    </Typography>
                    <Box component="form" onSubmit={handleSubmit}>
                      <Stack spacing={3}>
                        <TextField
                          label="Name *"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          fullWidth
                        />
                        <TextField
                          label="Email *"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          fullWidth
                        />
                        <TextField
                          select
                          label="Category"
                          name="category"
                          value={formData.category}
                          onChange={handleInputChange}
                          fullWidth
                        >
                          <MenuItem value="general">General Question</MenuItem>
                          <MenuItem value="order">Order Issue</MenuItem>
                          <MenuItem value="shipping">
                            Shipping & Delivery
                          </MenuItem>
                          <MenuItem value="return">Returns & Refunds</MenuItem>
                          <MenuItem value="product">
                            Product Information
                          </MenuItem>
                          <MenuItem value="account">Account & Payment</MenuItem>
                          <MenuItem value="auction">
                            Auctions & Bidding
                          </MenuItem>
                          <MenuItem value="technical">
                            Technical Support
                          </MenuItem>
                        </TextField>
                        <TextField
                          label="Subject *"
                          name="subject"
                          value={formData.subject}
                          onChange={handleInputChange}
                          required
                          fullWidth
                        />
                        {(formData.category === "order" ||
                          formData.category === "shipping" ||
                          formData.category === "return") && (
                          <TextField
                            label="Order Number (Optional)"
                            name="orderNumber"
                            value={formData.orderNumber}
                            onChange={handleInputChange}
                            placeholder="e.g., #12345"
                            fullWidth
                          />
                        )}
                        <TextField
                          label="Message *"
                          name="message"
                          value={formData.message}
                          onChange={handleInputChange}
                          multiline
                          rows={6}
                          placeholder="Please describe your question or issue in detail..."
                          required
                          fullWidth
                        />
                        <Button
                          type="submit"
                          variant="contained"
                          disabled={isSubmitting}
                          fullWidth
                        >
                          {isSubmitting ? "Sending..." : "Send Message"}
                        </Button>
                      </Stack>
                    </Box>
                  </Card>
                </Box>

                {/* Contact Information */}
                <Box sx={{ flex: 1 }}>
                  <Stack spacing={3}>
                    <Card sx={{ p: 3 }}>
                      <Typography variant="h6" gutterBottom>
                        Other ways to reach us
                      </Typography>
                      <Stack spacing={3}>
                        <Box>
                          <Typography variant="subtitle1" gutterBottom>
                            Email
                          </Typography>
                          <Typography color="text.secondary">
                            support@justforview.in
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            We typically respond within 24 hours
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="subtitle1" gutterBottom>
                            Phone
                          </Typography>
                          <Typography color="text.secondary">
                            1-800-BEYBLADE
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Mon-Fri, 9 AM - 6 PM EST
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="subtitle1" gutterBottom>
                            Live Chat
                          </Typography>
                          <Typography color="text.secondary">
                            Available on our website
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Mon-Fri, 9 AM - 6 PM EST
                          </Typography>
                        </Box>
                      </Stack>
                    </Card>

                    <Card sx={{ p: 3, bgcolor: "primary.lighter" }}>
                      <Typography variant="h6" gutterBottom>
                        Before contacting us
                      </Typography>
                      <Stack
                        spacing={1}
                        component="ul"
                        sx={{ pl: 0, listStyle: "none" }}
                      >
                        <Box component="li">
                          <Typography variant="body2">
                            • Check our{" "}
                            <Link href="/faq" style={{ color: "inherit" }}>
                              FAQ page
                            </Link>{" "}
                            for quick answers
                          </Typography>
                        </Box>
                        <Box component="li">
                          <Typography variant="body2">
                            • Have your order number ready if asking about an
                            order
                          </Typography>
                        </Box>
                        <Box component="li">
                          <Typography variant="body2">
                            • Include photos if reporting a product issue
                          </Typography>
                        </Box>
                        <Box component="li">
                          <Typography variant="body2">
                            • Be specific about the problem you're experiencing
                          </Typography>
                        </Box>
                      </Stack>
                    </Card>
                  </Stack>
                </Box>
              </Stack>
            </Box>
          )}
        </Stack>
      </Box>
    </Box>
  );
}
