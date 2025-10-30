"use client";

import React from "react";
import {
  Box,
  Paper,
  Typography,
  Card,
  CardMedia,
  CardContent,
  Chip,
  Rating,
  Button,
  Divider,
  Stack,
} from "@mui/material";
import {
  ShoppingCart,
  LocalShipping,
  Verified,
  Refresh,
  TrendingUp,
} from "@mui/icons-material";

interface ProductPreviewProps {
  data: any;
}

export default function ProductPreview({ data }: ProductPreviewProps) {
  const mainImage = data.media?.images?.[0]?.url || "/assets/placeholder.png";
  const price = data.pricing?.price || 0;
  const compareAt = data.pricing?.compareAtPrice || 0;
  const discount =
    compareAt > price ? Math.round(((compareAt - price) / compareAt) * 100) : 0;

  return (
    <Paper sx={{ p: 2, position: "sticky", top: 100 }}>
      <Typography variant="h6" gutterBottom>
        Product Preview
      </Typography>
      <Typography variant="caption" color="text.secondary" paragraph>
        How customers will see your product
      </Typography>

      <Card>
        <CardMedia
          component="div"
          sx={{
            height: 250,
            backgroundImage: `url(${mainImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            bgcolor: "grey.200",
            position: "relative",
          }}
        >
          {discount > 0 && (
            <Chip
              label={`-${discount}%`}
              color="error"
              size="small"
              sx={{ position: "absolute", top: 8, right: 8 }}
            />
          )}
        </CardMedia>
        <CardContent>
          <Typography variant="h6" gutterBottom noWrap>
            {data.name || "Product Name"}
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <Rating value={4.5} precision={0.5} size="small" readOnly />
            <Typography variant="caption" color="text.secondary">
              (0 reviews)
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "baseline", gap: 1, mb: 2 }}>
            <Typography variant="h5" color="primary">
              ₹{price.toLocaleString()}
            </Typography>
            {compareAt > price && (
              <Typography
                variant="body2"
                sx={{ textDecoration: "line-through", color: "text.secondary" }}
              >
                ₹{compareAt.toLocaleString()}
              </Typography>
            )}
          </Box>

          {data.shortDescription && (
            <Typography variant="body2" color="text.secondary" paragraph>
              {data.shortDescription}
            </Typography>
          )}

          {/* Product Features */}
          <Stack direction="row" spacing={1} flexWrap="wrap" gap={1} mb={2}>
            {data.condition && (
              <Chip
                label={data.condition.replace("_", " ").toUpperCase()}
                size="small"
                variant="outlined"
              />
            )}
            {data.shipping?.isFree && (
              <Chip
                icon={<LocalShipping />}
                label="Free Shipping"
                color="success"
                size="small"
              />
            )}
            {data.returnable && (
              <Chip
                icon={<Refresh />}
                label={`${data.returnPeriod || 7} Days Return`}
                color="info"
                size="small"
              />
            )}
          </Stack>

          <Button
            variant="contained"
            fullWidth
            startIcon={<ShoppingCart />}
            disabled
            sx={{ mb: 2 }}
          >
            Add to Cart
          </Button>

          {/* SEO Information */}
          {data.seo?.title && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" color="primary" gutterBottom>
                SEO Preview
              </Typography>
              <Box sx={{ p: 1.5, bgcolor: "grey.50", borderRadius: 1 }}>
                <Typography
                  variant="caption"
                  color="primary"
                  sx={{ fontWeight: 600 }}
                >
                  {data.seo.title}
                </Typography>
                <Typography
                  variant="caption"
                  display="block"
                  color="success.main"
                >
                  justforview.in › {data.seo.slug}
                </Typography>
                <Typography
                  variant="caption"
                  display="block"
                  color="text.secondary"
                  sx={{ mt: 0.5 }}
                >
                  {data.seo.description}
                </Typography>
              </Box>
            </>
          )}

          {/* Product Status & Info */}
          {(data.status || data.inventory?.quantity !== undefined) && (
            <>
              <Divider sx={{ my: 2 }} />
              <Stack spacing={0.5}>
                {data.status && (
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      Status:
                    </Typography>
                    <Chip
                      label={data.status.toUpperCase()}
                      size="small"
                      color={data.status === "active" ? "success" : "default"}
                    />
                  </Box>
                )}
                {data.inventory?.quantity !== undefined && (
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      Stock:
                    </Typography>
                    <Typography variant="caption" fontWeight={600}>
                      {data.inventory.quantity} units
                    </Typography>
                  </Box>
                )}
                {data.inventory?.sku && (
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      SKU:
                    </Typography>
                    <Typography variant="caption" fontWeight={600}>
                      {data.inventory.sku}
                    </Typography>
                  </Box>
                )}
              </Stack>
            </>
          )}
        </CardContent>
      </Card>
    </Paper>
  );
}
