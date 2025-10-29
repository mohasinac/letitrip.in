"use client";

import Link from "next/link";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  useTheme,
} from "@mui/material";
import {
  CheckCircle,
  People,
  TrendingUp,
  Email,
  Phone,
  LocationOn,
  Verified,
  Star,
} from "@mui/icons-material";
import { useBreadcrumbTracker } from "@/hooks/useBreadcrumbTracker";

export default function AboutPage() {
  const theme = useTheme();

  // Add breadcrumb
  useBreadcrumbTracker([
    {
      label: "About",
      href: "/about",
      active: true,
    },
  ]);

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
              sx={{
                fontWeight: 700,
                mb: 3,
                color: "white",
              }}
            >
              About JustForView
            </Typography>
            <Typography
              variant="h6"
              sx={{
                maxWidth: 600,
                mx: "auto",
                color: "white",
                opacity: 0.9,
              }}
            >
              Your trusted destination for authentic hobby products, rare
              collectibles, and premium gaming accessories since 2020.
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Our Story */}
      <Box sx={{ py: 8 }}>
        <Container maxWidth="xl">
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              gap: 6,
              alignItems: "center",
            }}
          >
            <Box>
              <Typography variant="h2" sx={{ fontWeight: 700, mb: 3 }}>
                Our Story
              </Typography>
              <Box sx={{ space: 4 }}>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  JustForView was born from a passion for authentic hobby
                  products and the frustration of finding genuine items in the
                  market. What started as a small collection grew into India's
                  premier destination for Beyblades, collectibles, and gaming
                  accessories.
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  We understand the excitement of unboxing a new product, the
                  thrill of finding that rare item you've been searching for,
                  and the importance of authenticity in collectibles. That's why
                  we've built our entire business around these core values.
                </Typography>
              </Box>
            </Box>
            <Box sx={{ position: "relative" }}>
              <Card
                sx={{
                  borderRadius: 3,
                  overflow: "hidden",
                  transition: "transform 0.3s ease",
                  "&:hover": { transform: "translateY(-8px)" },
                }}
              >
                <Box
                  sx={{
                    height: 300,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}20 0%, ${theme.palette.primary.main}10 100%)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Typography variant="h4" color="primary" fontWeight={600}>
                    Our Journey
                  </Typography>
                </Box>
              </Card>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Mission & Vision */}
      <Box sx={{ py: 8, backgroundColor: "background.paper" }}>
        <Container maxWidth="xl">
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
              gap: 4,
            }}
          >
            <Card
              sx={{
                p: 4,
                textAlign: "center",
                borderRadius: 3,
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-8px)",
                  boxShadow: theme.shadows[8],
                },
              }}
            >
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  backgroundColor: "primary.main",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mx: "auto",
                  mb: 3,
                }}
              >
                <TrendingUp sx={{ fontSize: 32, color: "white" }} />
              </Box>
              <Typography variant="h4" fontWeight={600} gutterBottom>
                Our Mission
              </Typography>
              <Typography variant="body1" color="text.secondary">
                To provide authentic, high-quality hobby products while building
                a passionate community of collectors and enthusiasts across
                India.
              </Typography>
            </Card>

            <Card
              sx={{
                p: 4,
                textAlign: "center",
                borderRadius: 3,
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-8px)",
                  boxShadow: theme.shadows[8],
                },
              }}
            >
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  backgroundColor: "primary.main",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mx: "auto",
                  mb: 3,
                }}
              >
                <People sx={{ fontSize: 32, color: "white" }} />
              </Box>
              <Typography variant="h4" fontWeight={600} gutterBottom>
                Our Vision
              </Typography>
              <Typography variant="body1" color="text.secondary">
                To become the most trusted and comprehensive platform for hobby
                enthusiasts, expanding globally while maintaining our commitment
                to authenticity.
              </Typography>
            </Card>
          </Box>
        </Container>
      </Box>

      {/* Values */}
      <Box sx={{ py: 8 }}>
        <Container maxWidth="xl">
          <Typography
            variant="h2"
            sx={{ textAlign: "center", mb: 6, fontWeight: 700 }}
          >
            Our Values
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
              gap: 4,
            }}
          >
            {[
              {
                icon: <Verified sx={{ fontSize: 40 }} />,
                title: "Authenticity",
                description:
                  "Every product is 100% genuine and verified. We work directly with authorized distributors and brands to ensure authenticity.",
                color: "#00c851",
              },
              {
                icon: <People sx={{ fontSize: 40 }} />,
                title: "Community",
                description:
                  "We're more than a store - we're a community. We connect enthusiasts, share knowledge, and celebrate the passion for collecting.",
                color: "#0095f6",
              },
              {
                icon: <Star sx={{ fontSize: 40 }} />,
                title: "Excellence",
                description:
                  "From product quality to customer service, we strive for excellence in everything we do. Your satisfaction is our priority.",
                color: "#ff6900",
              },
            ].map((value, index) => (
              <Card
                key={index}
                sx={{
                  p: 4,
                  textAlign: "center",
                  borderRadius: 3,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: theme.shadows[8],
                  },
                }}
              >
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    backgroundColor: `${value.color}20`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mx: "auto",
                    mb: 3,
                    color: value.color,
                  }}
                >
                  {value.icon}
                </Box>
                <Typography variant="h5" fontWeight={600} gutterBottom>
                  {value.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {value.description}
                </Typography>
              </Card>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Team Section */}
      <Box sx={{ py: 8, backgroundColor: "background.paper" }}>
        <Container maxWidth="xl">
          <Typography
            variant="h2"
            sx={{ textAlign: "center", mb: 6, fontWeight: 700 }}
          >
            Meet Our Team
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
              gap: 4,
            }}
          >
            {[
              {
                name: "Arjun Sharma",
                role: "Founder & CEO",
                bio: "Passionate collector with 15+ years in the hobby industry",
              },
              {
                name: "Priya Patel",
                role: "Head of Operations",
                bio: "Expert in supply chain and ensuring product authenticity",
              },
              {
                name: "Rahul Kumar",
                role: "Community Manager",
                bio: "Connecting enthusiasts and building our vibrant community",
              },
            ].map((member, index) => (
              <Card
                key={index}
                sx={{
                  p: 3,
                  textAlign: "center",
                  borderRadius: 3,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: theme.shadows[8],
                  },
                }}
              >
                <Box
                  sx={{
                    width: 96,
                    height: 96,
                    borderRadius: "50%",
                    backgroundColor: "primary.main",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mx: "auto",
                    mb: 2,
                  }}
                >
                  <Typography variant="h4" color="white" fontWeight={600}>
                    {member.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </Typography>
                </Box>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  {member.name}
                </Typography>
                <Typography variant="body2" color="primary" sx={{ mb: 2 }}>
                  {member.role}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {member.bio}
                </Typography>
              </Card>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Stats */}
      <Box sx={{ py: 8 }}>
        <Container maxWidth="xl">
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "repeat(2, 1fr)",
                md: "repeat(4, 1fr)",
              },
              gap: 4,
              textAlign: "center",
            }}
          >
            {[
              { number: "50K+", label: "Happy Customers" },
              { number: "10K+", label: "Products Sold" },
              { number: "500+", label: "Live Auctions" },
              { number: "99%", label: "Satisfaction Rate" },
            ].map((stat, index) => (
              <Box key={index}>
                <Typography
                  variant="h3"
                  sx={{ fontWeight: 700, color: "primary.main", mb: 1 }}
                >
                  {stat.number}
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  fontWeight={500}
                >
                  {stat.label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          py: 8,
          color: "white",
        }}
      >
        <Container maxWidth="xl">
          <Box sx={{ textAlign: "center" }}>
            <Typography
              variant="h2"
              sx={{ fontWeight: 700, mb: 2, color: "white" }}
            >
              Join Our Community
            </Typography>
            <Typography
              variant="h6"
              sx={{
                mb: 4,
                maxWidth: 600,
                mx: "auto",
                color: "white",
                opacity: 0.9,
              }}
            >
              Ready to discover authentic products and connect with fellow
              enthusiasts?
            </Typography>
            <Box
              sx={{
                display: "flex",
                gap: 2,
                justifyContent: "center",
                flexDirection: { xs: "column", sm: "row" },
                maxWidth: 400,
                mx: "auto",
              }}
            >
              <Button
                component={Link}
                href="/products"
                variant="contained"
                size="large"
                sx={{
                  backgroundColor: "white",
                  color: "primary.main",
                  fontWeight: 600,
                  px: 4,
                  "&:hover": {
                    backgroundColor: "grey.100",
                  },
                }}
              >
                Shop Now
              </Button>
              <Button
                component={Link}
                href="/contact"
                variant="outlined"
                size="large"
                sx={{
                  color: "white",
                  borderColor: "white",
                  fontWeight: 600,
                  px: 4,
                  "&:hover": {
                    borderColor: "white",
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                  },
                }}
              >
                Contact Us
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
