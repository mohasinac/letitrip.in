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

export default function TermsPage() {
  // Add breadcrumb
  useBreadcrumbTracker([
    {
      label: "Terms of Service",
      href: "/terms",
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
              Terms of Service
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
                title: "1. Acceptance of Terms",
                content: (
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ lineHeight: 1.7 }}
                  >
                    By accessing and using JustForView.in (the "Service"), you
                    accept and agree to be bound by the terms and provision of
                    this agreement. If you do not agree to abide by the above,
                    please do not use this service.
                  </Typography>
                ),
              },
              {
                title: "2. Use License",
                content: (
                  <Box>
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      sx={{ lineHeight: 1.7, mb: 2 }}
                    >
                      Permission is granted to temporarily download one copy of
                      the materials on JustForView.in for personal,
                      non-commercial transitory viewing only. This is the grant
                      of a license, not a transfer of title, and under this
                      license you may not:
                    </Typography>
                    <Box component="ul" sx={{ pl: 3, color: "text.secondary" }}>
                      <li>modify or copy the materials</li>
                      <li>
                        use the materials for any commercial purpose or for any
                        public display (commercial or non-commercial)
                      </li>
                      <li>
                        attempt to decompile or reverse engineer any software
                        contained on JustForView.in
                      </li>
                      <li>
                        remove any copyright or other proprietary notations from
                        the materials
                      </li>
                    </Box>
                  </Box>
                ),
              },
              {
                title: "3. Account Terms",
                content: (
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                  >
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
                        Account Creation:
                      </Typography>{" "}
                      You must provide accurate and complete information when
                      creating an account. You are responsible for maintaining
                      the security of your account and password.
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
                        Account Responsibility:
                      </Typography>{" "}
                      You are responsible for all activities that occur under
                      your account. You must notify us immediately of any
                      unauthorized use of your account.
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
                        Age Requirement:
                      </Typography>{" "}
                      You must be at least 18 years old to create an account and
                      make purchases.
                    </Typography>
                  </Box>
                ),
              },
              {
                title: "4. Product Information and Availability",
                content: (
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                  >
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      sx={{ lineHeight: 1.7 }}
                    >
                      We strive to provide accurate product descriptions,
                      images, and pricing. However, we do not guarantee that
                      product descriptions or other content is accurate,
                      complete, reliable, current, or error-free.
                    </Typography>
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      sx={{ lineHeight: 1.7 }}
                    >
                      All products are subject to availability. We reserve the
                      right to discontinue any product at any time without
                      notice. Prices are subject to change without notice.
                    </Typography>
                  </Box>
                ),
              },
              {
                title: "5. Orders and Payments",
                content: (
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                  >
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
                        Order Acceptance:
                      </Typography>{" "}
                      Your receipt of an email order confirmation does not
                      signify our acceptance of your order. We reserve the right
                      to accept or decline your order for any reason.
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
                        Pricing:
                      </Typography>{" "}
                      All prices are in Indian Rupees (INR) and include
                      applicable taxes unless otherwise stated.
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
                        Payment:
                      </Typography>{" "}
                      Payment must be made at the time of purchase through our
                      approved payment methods. We use secure payment processing
                      services.
                    </Typography>
                  </Box>
                ),
              },
              {
                title: "6. Auction Terms",
                content: (
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                  >
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
                        Bidding:
                      </Typography>{" "}
                      By placing a bid, you agree to purchase the item at that
                      price if you are the winning bidder. All bids are final
                      and cannot be retracted.
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
                        Auction End:
                      </Typography>{" "}
                      Auctions end at the specified time. The highest bidder at
                      the end of the auction wins the item.
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
                        Payment:
                      </Typography>{" "}
                      Winning bidders must complete payment within 24 hours of
                      auction end.
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
                        Reserve Prices:
                      </Typography>{" "}
                      Some auctions may have reserve prices. If the reserve is
                      not met, the item will not be sold.
                    </Typography>
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
                  <ClientLinkButton href="/" variant="outlined" sx={{ px: 3 }}>
                    ← Back to Home
                  </ClientLinkButton>
                  <ClientLinkButton
                    href="/privacy"
                    variant="outlined"
                    sx={{ px: 3 }}
                  >
                    Privacy Policy →
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
