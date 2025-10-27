"use client";

import React from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Avatar,
  Rating,
  Chip,
  useTheme,
} from "@mui/material";
import { FormatQuote } from "@mui/icons-material";

const reviews = [
  {
    name: "Arjun Patel",
    location: "Mumbai, India",
    rating: 5,
    review:
      "Amazing quality! Got my childhood Dragoon GT in perfect condition. Fast shipping and excellent packaging.",
    product: "Dragoon GT",
    avatar: "AP",
    verified: true,
  },
  {
    name: "Priya Sharma",
    location: "Delhi, India",
    rating: 5,
    review:
      "Best Beyblade store in India! Authentic products, great prices, and super helpful customer service.",
    product: "Beyblade Burst Set",
    avatar: "PS",
    verified: true,
  },
  {
    name: "Rohit Kumar",
    location: "Bangalore, India",
    rating: 5,
    review:
      "Finally found rare Beyblades that I've been searching for years. Highly recommend to all collectors!",
    product: "Metal Fight Series",
    avatar: "RK",
    verified: true,
  },
  {
    name: "Sneha Reddy",
    location: "Hyderabad, India",
    rating: 5,
    review:
      "Bought Beyblades for my son and he absolutely loves them. Quality is top-notch and delivery was quick.",
    product: "Beyblade X Starter",
    avatar: "SR",
    verified: true,
  },
];

export default function ModernCustomerReviews() {
  const theme = useTheme();

  return (
    <Box sx={{ py: 8, backgroundColor: "background.paper" }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ textAlign: "center", mb: 6 }}>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 700,
              mb: 2,
              background: `linear-gradient(135deg, ${theme.palette.text.primary} 0%, ${theme.palette.primary.main} 100%)`,
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            What Our Customers Say
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ maxWidth: 600, mx: "auto" }}
          >
            Join thousands of satisfied customers who trust us for authentic
            Beyblades and exceptional service.
          </Typography>
        </Box>

        {/* Reviews Grid */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "repeat(2, 1fr)",
              lg: "repeat(2, 1fr)",
            },
            gap: 4,
          }}
        >
          {reviews.map((review, index) => (
            <Card
              key={index}
              sx={{
                borderRadius: 3,
                p: 3,
                position: "relative",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: theme.shadows[8],
                },
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              {/* Quote Icon */}
              <Box
                sx={{
                  position: "absolute",
                  top: 16,
                  right: 16,
                  color: "primary.main",
                  opacity: 0.3,
                }}
              >
                <FormatQuote sx={{ fontSize: 32 }} />
              </Box>

              <CardContent sx={{ p: 0 }}>
                {/* Rating */}
                <Box sx={{ mb: 2 }}>
                  <Rating value={review.rating} readOnly size="small" />
                </Box>

                {/* Review Text */}
                <Typography
                  variant="body1"
                  sx={{
                    mb: 3,
                    lineHeight: 1.6,
                    color: "text.primary",
                    fontStyle: "italic",
                  }}
                >
                  "{review.review}"
                </Typography>

                {/* Product Badge */}
                <Chip
                  label={review.product}
                  size="small"
                  sx={{
                    mb: 3,
                    backgroundColor: "primary.main",
                    color: "white",
                    fontWeight: 500,
                  }}
                />

                {/* Customer Info */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Avatar
                    sx={{
                      bgcolor: "primary.main",
                      width: 48,
                      height: 48,
                      fontWeight: 600,
                    }}
                  >
                    {review.avatar}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography variant="h6" fontWeight={600}>
                        {review.name}
                      </Typography>
                      {review.verified && (
                        <Chip
                          label="✓ Verified"
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: "0.7rem",
                            backgroundColor: "success.main",
                            color: "white",
                          }}
                        />
                      )}
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {review.location}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>

        {/* Stats */}
        <Box
          sx={{
            mt: 8,
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
            { number: "5000+", label: "Happy Customers" },
            { number: "4.9/5", label: "Average Rating" },
            { number: "2000+", label: "Products Sold" },
            { number: "99%", label: "Satisfaction Rate" },
          ].map((stat, index) => (
            <Box key={index}>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 700,
                  color: "primary.main",
                  mb: 1,
                }}
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
  );
}
