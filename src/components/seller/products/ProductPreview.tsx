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
} from "@mui/material";
import { ShoppingCart } from "@mui/icons-material";

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

          {data.condition && (
            <Chip
              label={data.condition.replace("_", " ").toUpperCase()}
              size="small"
              sx={{ mb: 2 }}
            />
          )}

          <Button
            variant="contained"
            fullWidth
            startIcon={<ShoppingCart />}
            disabled
          >
            Add to Cart
          </Button>

          {data.shipping?.isFree && (
            <Chip
              label="Free Shipping"
              color="success"
              size="small"
              sx={{ mt: 1 }}
            />
          )}
        </CardContent>
      </Card>
    </Paper>
  );
}
