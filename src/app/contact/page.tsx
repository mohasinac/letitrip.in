"use client";

import { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  useTheme,
} from "@mui/material";
import {
  CheckCircle,
  LocationOn,
  Phone,
  Email,
  Schedule,
} from "@mui/icons-material";
import { apiClient } from "@/lib/api/client";
import toast from "react-hot-toast";
import { useBreadcrumbTracker } from "@/hooks/useBreadcrumbTracker";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const theme = useTheme();

  // Add breadcrumb
  useBreadcrumbTracker([
    {
      label: "Contact",
      href: "/contact",
      active: true,
    },
  ]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | any
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name as string]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Submit to contact API
      await apiClient.post("/contact", formData);

      setSent(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
      toast.success("Message sent successfully!");
    } catch (error: any) {
      console.error("Contact form error:", error);
      toast.error(error.message || "Failed to send message. Please try again.");
    }

    setLoading(false);
  };

  if (sent) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          py: 8,
        }}
      >
        <Container maxWidth="md">
          <Card sx={{ p: 6, textAlign: "center", borderRadius: 3 }}>
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                backgroundColor: "success.main",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mx: "auto",
                mb: 3,
              }}
            >
              <CheckCircle sx={{ fontSize: 32, color: "white" }} />
            </Box>
            <Typography variant="h4" fontWeight={600} gutterBottom>
              Message Sent!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Thank you for contacting us. We'll get back to you within 24
              hours.
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => setSent(false)}
              sx={{ px: 4 }}
            >
              Send Another Message
            </Button>
          </Card>
        </Container>
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
              Get in Touch
            </Typography>
            <Typography
              variant="h6"
              sx={{ maxWidth: 600, mx: "auto", color: "white", opacity: 0.9 }}
            >
              Have questions? We'd love to hear from you. Send us a message and
              we'll respond as soon as possible.
            </Typography>
          </Box>
        </Container>
      </Box>

      <Box sx={{ py: 8 }}>
        <Container maxWidth="xl">
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
              gap: 8,
            }}
          >
            {/* Contact Form */}
            <Card sx={{ p: 4, borderRadius: 3 }}>
              <Typography variant="h4" fontWeight={600} gutterBottom>
                Send us a Message
              </Typography>
              <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                    gap: 3,
                    mb: 3,
                  }}
                >
                  <TextField
                    fullWidth
                    label="Full Name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                  />
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                  />
                </Box>

                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel>Subject *</InputLabel>
                  <Select
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    label="Subject *"
                  >
                    <MenuItem value="">Select a subject</MenuItem>
                    <MenuItem value="general">General Inquiry</MenuItem>
                    <MenuItem value="order">Order Support</MenuItem>
                    <MenuItem value="product">Product Question</MenuItem>
                    <MenuItem value="auction">Auction Inquiry</MenuItem>
                    <MenuItem value="partnership">Partnership</MenuItem>
                    <MenuItem value="feedback">Feedback</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  label="Message"
                  name="message"
                  required
                  multiline
                  rows={6}
                  placeholder="Tell us how we can help you..."
                  value={formData.message}
                  onChange={handleChange}
                  sx={{ mb: 3 }}
                />

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  disabled={loading}
                  sx={{ py: 1.5, fontWeight: 600 }}
                >
                  {loading ? "Sending..." : "Send Message"}
                </Button>
              </Box>
            </Card>

            {/* Contact Information */}
            <Box>
              <Typography variant="h4" fontWeight={600} gutterBottom>
                Contact Information
              </Typography>

              <Box sx={{ mt: 4, space: 4 }}>
                {/* Address */}
                <Card sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                  <Box
                    sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}
                  >
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 2,
                        backgroundColor: "primary.main",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <LocationOn sx={{ color: "white" }} />
                    </Box>
                    <Box>
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        Our Office
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        123 Business Park, 2nd Floor
                        <br />
                        Andheri East, Mumbai - 400069
                        <br />
                        Maharashtra, India
                      </Typography>
                    </Box>
                  </Box>
                </Card>

                {/* Phone */}
                <Card sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                  <Box
                    sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}
                  >
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 2,
                        backgroundColor: "primary.main",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Phone sx={{ color: "white" }} />
                    </Box>
                    <Box>
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        Phone Support
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <Typography
                          component="a"
                          href="tel:+919876543210"
                          sx={{ color: "primary.main", textDecoration: "none" }}
                        >
                          +91 98765 43210
                        </Typography>
                        <br />
                        Mon-Sat, 9 AM - 6 PM IST
                      </Typography>
                    </Box>
                  </Box>
                </Card>

                {/* Email */}
                <Card sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                  <Box
                    sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}
                  >
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 2,
                        backgroundColor: "primary.main",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Email sx={{ color: "white" }} />
                    </Box>
                    <Box>
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        Email Us
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <Typography
                          component="a"
                          href="mailto:support@justforview.in"
                          sx={{ color: "primary.main", textDecoration: "none" }}
                        >
                          support@justforview.in
                        </Typography>
                        <br />
                        <Typography
                          component="a"
                          href="mailto:hello@justforview.in"
                          sx={{ color: "primary.main", textDecoration: "none" }}
                        >
                          hello@justforview.in
                        </Typography>
                      </Typography>
                    </Box>
                  </Box>
                </Card>

                {/* Business Hours */}
                <Card sx={{ p: 3, borderRadius: 2 }}>
                  <Box
                    sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}
                  >
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 2,
                        backgroundColor: "primary.main",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Schedule sx={{ color: "white" }} />
                    </Box>
                    <Box sx={{ width: "100%" }}>
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        Business Hours
                      </Typography>
                      <Box sx={{ space: 1 }}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            mb: 1,
                          }}
                        >
                          <Typography variant="body2" color="text.secondary">
                            Monday - Friday
                          </Typography>
                          <Typography variant="body2" fontWeight={500}>
                            9:00 AM - 6:00 PM
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            mb: 1,
                          }}
                        >
                          <Typography variant="body2" color="text.secondary">
                            Saturday
                          </Typography>
                          <Typography variant="body2" fontWeight={500}>
                            10:00 AM - 4:00 PM
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <Typography variant="body2" color="text.secondary">
                            Sunday
                          </Typography>
                          <Typography
                            variant="body2"
                            color="error.main"
                            fontWeight={500}
                          >
                            Closed
                          </Typography>
                        </Box>
                      </Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ mt: 2, display: "block" }}
                      >
                        All times are in Indian Standard Time (IST)
                      </Typography>
                    </Box>
                  </Box>
                </Card>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* FAQ Section */}
      <Box sx={{ py: 8, backgroundColor: "background.paper" }}>
        <Container maxWidth="xl">
          <Typography
            variant="h3"
            sx={{ textAlign: "center", mb: 6, fontWeight: 700 }}
          >
            Frequently Asked Questions
          </Typography>
          <Box sx={{ maxWidth: 800, mx: "auto" }}>
            {[
              {
                question: "How long does shipping take?",
                answer:
                  "We offer free shipping on orders above ₹1000. Standard delivery takes 3-5 business days, while express delivery takes 1-2 business days.",
              },
              {
                question: "Do you sell authentic products?",
                answer:
                  "Yes, we guarantee 100% authentic products. We work directly with authorized distributors and provide certificates of authenticity where applicable.",
              },
              {
                question: "How do auctions work?",
                answer:
                  "Our live auctions allow you to bid on rare and exclusive items. You can place bids during the auction period, and the highest bidder wins when the auction ends.",
              },
              {
                question: "What is your return policy?",
                answer:
                  "We offer easy returns within 7 days of delivery for unopened items in original condition. For auction items, returns are subject to specific terms mentioned in the auction.",
              },
              {
                question: "How can I track my order?",
                answer:
                  "Once your order ships, you'll receive a tracking number via email and SMS. You can also check your order status in your account dashboard.",
              },
            ].map((faq, index) => (
              <Card
                key={index}
                sx={{
                  mb: 2,
                  borderRadius: 2,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: theme.shadows[4],
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    {faq.question}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {faq.answer}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
