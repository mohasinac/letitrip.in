"use client";

import Link from "next/link";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
} from "@mui/material";
import {
  HeroSection,
  ThemeAwareBox,
} from "@/components/shared/ThemeAwareComponents";
import { ClientLinkButton } from "@/components/shared/ClientLinkButton";
import { useBreadcrumbTracker } from "@/hooks/useBreadcrumbTracker";

export default function PrivacyPage() {
  // Add breadcrumb
  useBreadcrumbTracker([
    {
      label: "Privacy Policy",
      href: "/privacy",
      active: true,
    },
  ]);

  return (
    <ThemeAwareBox>
      {/* Hero Section */}
      <HeroSection>
        <Container maxWidth="xl">
          <Box sx={{ textAlign: "center" }}>
            <Typography
              variant="h1"
              sx={{ fontWeight: 700, mb: 3, color: "white" }}
            >
              Privacy Policy
            </Typography>
            <Typography variant="h6" sx={{ color: "white", opacity: 0.9 }}>
              Last updated: January 1, 2024
            </Typography>
          </Box>
        </Container>
      </HeroSection>

      <Box sx={{ py: 8 }}>
        <Container maxWidth="lg">
          <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {[
              {
                title: "1. Introduction",
                content: (
                  <Box>
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      sx={{ lineHeight: 1.7, mb: 2 }}
                    >
                      JustForView.in ("we," "our," or "us") is committed to
                      protecting your privacy. This Privacy Policy explains how
                      we collect, use, disclose, and safeguard your information
                      when you visit our website and use our services.
                    </Typography>
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      sx={{ lineHeight: 1.7 }}
                    >
                      Please read this Privacy Policy carefully. By using our
                      Service, you agree to the collection and use of
                      information in accordance with this policy.
                    </Typography>
                  </Box>
                ),
              },
              {
                title: "2. Information We Collect",
                content: (
                  <Box>
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      sx={{ lineHeight: 1.7, mb: 2 }}
                    >
                      <Typography
                        component="span"
                        fontWeight={600}
                        color="text.primary"
                      >
                        Personal Information:
                      </Typography>{" "}
                      Name, email address, phone number, shipping address,
                      billing address, and payment information.
                    </Typography>
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      sx={{ lineHeight: 1.7, mb: 2 }}
                    >
                      <Typography
                        component="span"
                        fontWeight={600}
                        color="text.primary"
                      >
                        Usage Information:
                      </Typography>{" "}
                      Information about how you use our website, including pages
                      visited, time spent, and interactions.
                    </Typography>
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      sx={{ lineHeight: 1.7 }}
                    >
                      <Typography
                        component="span"
                        fontWeight={600}
                        color="text.primary"
                      >
                        Device Information:
                      </Typography>{" "}
                      IP address, browser type, device type, and operating
                      system.
                    </Typography>
                  </Box>
                ),
              },
              {
                title: "3. How We Use Your Information",
                content: (
                  <Box component="ul" sx={{ pl: 3, color: "text.secondary" }}>
                    <li>Process orders and manage your account</li>
                    <li>
                      Communicate with you about orders, promotions, and updates
                    </li>
                    <li>Improve our website and services</li>
                    <li>Prevent fraud and ensure security</li>
                    <li>Comply with legal obligations</li>
                    <li>Send marketing communications (with your consent)</li>
                  </Box>
                ),
              },
              {
                title: "4. Information Sharing",
                content: (
                  <Box>
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      sx={{ lineHeight: 1.7, mb: 2 }}
                    >
                      We do not sell, trade, or rent your personal information
                      to third parties. We may share your information in the
                      following circumstances:
                    </Typography>
                    <Box component="ul" sx={{ pl: 3, color: "text.secondary" }}>
                      <li>
                        With service providers who help us operate our business
                      </li>
                      <li>When required by law or to protect our rights</li>
                      <li>In connection with a business transfer or merger</li>
                      <li>With your explicit consent</li>
                    </Box>
                  </Box>
                ),
              },
              {
                title: "5. Data Security",
                content: (
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ lineHeight: 1.7 }}
                  >
                    We implement appropriate security measures to protect your
                    personal information against unauthorized access,
                    alteration, disclosure, or destruction. However, no method
                    of transmission over the internet is 100% secure.
                  </Typography>
                ),
              },
              {
                title: "6. Your Rights",
                content: (
                  <Box component="ul" sx={{ pl: 3, color: "text.secondary" }}>
                    <li>Access and review your personal information</li>
                    <li>Request correction of inaccurate information</li>
                    <li>
                      Request deletion of your information (subject to legal
                      requirements)
                    </li>
                    <li>Opt-out of marketing communications</li>
                    <li>Data portability (where applicable)</li>
                  </Box>
                ),
              },
            ].map((section, index) => (
              <Card key={index} sx={{ borderRadius: 3 }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h5" fontWeight={600} gutterBottom>
                    {section.title}
                  </Typography>
                  {section.content}
                </CardContent>
              </Card>
            ))}

            {/* Navigation */}
            <Card sx={{ borderRadius: 3, mt: 4 }}>
              <CardContent sx={{ p: 4 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <ClientLinkButton
                    href="/terms"
                    variant="outlined"
                    sx={{ px: 3 }}
                  >
                    ← Terms of Service
                  </ClientLinkButton>
                  <ClientLinkButton
                    href="/cookies"
                    variant="outlined"
                    sx={{ px: 3 }}
                  >
                    Cookie Policy →
                  </ClientLinkButton>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Container>
      </Box>
    </ThemeAwareBox>
  );
}
