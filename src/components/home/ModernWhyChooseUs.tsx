"use client";

import React from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  InputAdornment,
  useTheme,
} from "@mui/material";
import {
  Email,
  LocalShipping,
  Security,
  SupportAgent,
  Verified,
  TrendingUp,
} from "@mui/icons-material";

const features = [
  {
    icon: <Verified />,
    title: "100% Authentic",
    description: "All products are genuine and verified for authenticity",
    color: "#22c55e", // success.main
  },
  {
    icon: <LocalShipping />,
    title: "Fast Shipping",
    description: "Quick delivery across India with secure packaging",
    color: "#4f46e5", // primary.main
  },
  {
    icon: <Security />,
    title: "Secure Payment",
    description: "Safe and secure payment methods with buyer protection",
    color: "#ec4899", // secondary.main
  },
  {
    icon: <SupportAgent />,
    title: "Expert Support",
    description: "Dedicated customer support for all your queries",
    color: "#ef4444", // error.main
  },
];

export default function ModernWhyChooseUs() {
  const theme = useTheme();

  return (
    <Box sx={{ py: 8, backgroundColor: "background.default" }}>
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
            Why Choose JustForView?
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ maxWidth: 600, mx: "auto" }}
          >
            We're committed to providing the best Beyblade shopping experience
            with quality, authenticity, and service you can trust.
          </Typography>
        </Box>

        {/* Features Grid */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              lg: "repeat(4, 1fr)",
            },
            gap: 3,
            mb: 8,
          }}
        >
          {features.map((feature, index) => (
            <Card
              key={index}
              sx={{
                borderRadius: 3,
                p: 3,
                textAlign: "center",
                transition: "all 0.3s ease",
                border: `2px solid transparent`,
                "&:hover": {
                  transform: "translateY(-8px)",
                  boxShadow: theme.shadows[8],
                  borderColor: feature.color,
                },
              }}
            >
              <Box
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  backgroundColor: `${feature.color}20`,
                  color: feature.color,
                  mb: 2,
                }}
              >
                {React.cloneElement(feature.icon, { sx: { fontSize: 32 } })}
              </Box>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                {feature.title}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                lineHeight={1.6}
              >
                {feature.description}
              </Typography>
            </Card>
          ))}
        </Box>

        {/* Newsletter Section */}
        <Card
          sx={{
            borderRadius: 4,
            p: 4,
            background: `linear-gradient(135deg, ${theme.palette.primary.main}20 0%, ${theme.palette.primary.main}10 100%)`,
            border: `1px solid ${theme.palette.primary.main}30`,
            textAlign: "center",
          }}
        >
          <Box sx={{ maxWidth: 500, mx: "auto" }}>
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 64,
                height: 64,
                borderRadius: "50%",
                backgroundColor: "primary.main",
                color: "white",
                mb: 3,
              }}
            >
              <TrendingUp sx={{ fontSize: 32 }} />
            </Box>

            <Typography variant="h4" fontWeight={700} gutterBottom>
              Stay Updated
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ mb: 4, lineHeight: 1.6 }}
            >
              Get notified about new arrivals, exclusive deals, and restocks of
              rare Beyblades. Join our newsletter for the latest updates!
            </Typography>

            <Box
              sx={{
                display: "flex",
                gap: 2,
                flexDirection: { xs: "column", sm: "row" },
                maxWidth: 400,
                mx: "auto",
              }}
            >
              <TextField
                fullWidth
                placeholder="Enter your email"
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    backgroundColor: "background.paper",
                  },
                }}
              />
              <Button
                variant="contained"
                size="large"
                sx={{
                  px: 4,
                  fontWeight: 600,
                  borderRadius: 2,
                  minWidth: { xs: "100%", sm: "auto" },
                }}
              >
                Subscribe
              </Button>
            </Box>

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mt: 2, display: "block" }}
            >
              No spam, unsubscribe at any time. We respect your privacy.
            </Typography>
          </Box>
        </Card>
      </Container>
    </Box>
  );
}
