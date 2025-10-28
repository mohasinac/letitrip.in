"use client";

import React, { useMemo } from "react";
import {
  Box,
  Typography,
  IconButton,
  Chip,
  Collapse,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  Paper,
  Tooltip,
  Badge,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Storage as StorageIcon,
} from "@mui/icons-material";
import type { Category } from "@/types";

interface CategoryTreeViewProps {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (categoryId: string) => void;
}

interface CategoryNodeProps {
  category: Category;
  allCategories: Category[];
  level: number;
  onEdit: (category: Category) => void;
  onDelete: (categoryId: string) => void;
}

function CategoryNode({
  category,
  allCategories,
  level,
  onEdit,
  onDelete,
}: CategoryNodeProps) {
  const [expanded, setExpanded] = React.useState(true);

  const children = useMemo(
    () => allCategories.filter((cat) => cat.parentId === category.id),
    [allCategories, category.id]
  );

  const hasChildren = children.length > 0;

  return (
    <>
      <TableRow
        sx={{
          backgroundColor:
            level % 2 === 0 ? "transparent" : "rgba(0, 0, 0, 0.02)",
          "&:hover": {
            backgroundColor: "rgba(0, 0, 0, 0.04)",
          },
        }}
      >
        <TableCell sx={{ paddingLeft: `${level * 32 + 16}px`, width: "40%" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {hasChildren ? (
              <IconButton
                size="small"
                onClick={() => setExpanded(!expanded)}
                sx={{ width: 32, height: 32 }}
              >
                {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            ) : (
              <Box sx={{ width: 32 }} />
            )}
            <Typography variant="body2" fontWeight={500}>
              {category.name}
            </Typography>
          </Box>
        </TableCell>

        {/* Slug */}
        <TableCell sx={{ fontSize: "0.875rem", color: "text.secondary" }}>
          {category.slug}
        </TableCell>

        {/* Products */}
        <TableCell align="center">
          <Tooltip
            title={`${category.inStockCount || 0} in stock, ${
              category.outOfStockCount || 0
            } out of stock`}
          >
            <Badge
              badgeContent={category.productCount || 0}
              color="primary"
              sx={{ cursor: "pointer" }}
            >
              <StorageIcon fontSize="small" />
            </Badge>
          </Tooltip>
        </TableCell>

        {/* Status */}
        <TableCell align="center">
          <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
            {category.featured && (
              <Chip
                label="Featured"
                size="small"
                color="primary"
                variant="outlined"
              />
            )}
            {category.isActive ? (
              <Tooltip title="Active">
                <VisibilityIcon
                  fontSize="small"
                  sx={{ color: "success.main" }}
                />
              </Tooltip>
            ) : (
              <Tooltip title="Inactive">
                <VisibilityOffIcon
                  fontSize="small"
                  sx={{ color: "text.disabled" }}
                />
              </Tooltip>
            )}
          </Box>
        </TableCell>

        {/* Actions */}
        <TableCell align="right" sx={{ width: "15%" }}>
          <Box sx={{ display: "flex", gap: 0.5, justifyContent: "flex-end" }}>
            <Tooltip title="Edit">
              <IconButton
                size="small"
                onClick={() => onEdit(category)}
                sx={{ color: "primary.main" }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton
                size="small"
                onClick={() => onDelete(category.id)}
                sx={{ color: "error.main" }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </TableCell>
      </TableRow>

      {/* Children */}
      {hasChildren && (
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          {children.map((child) => (
            <CategoryNode
              key={child.id}
              category={child}
              allCategories={allCategories}
              level={level + 1}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </Collapse>
      )}
    </>
  );
}

interface TableRowProps {
  children: React.ReactNode;
  sx?: any;
}

function TableRow({ children, sx }: TableRowProps) {
  return <tr style={sx}>{children}</tr>;
}

export default function CategoryTreeView({
  categories,
  onEdit,
  onDelete,
}: CategoryTreeViewProps) {
  const rootCategories = useMemo(
    () =>
      categories
        .filter((cat) => !cat.parentId)
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [categories]
  );

  return (
    <TableContainer component={Paper}>
      <table style={{ width: "100%" }}>
        <thead>
          <tr
            style={{
              backgroundColor: "#f5f5f5",
              borderBottom: "1px solid #e0e0e0",
            }}
          >
            <th
              style={{ padding: "12px 16px", textAlign: "left", width: "40%" }}
            >
              <Typography variant="subtitle2" fontWeight={600}>
                Category Name
              </Typography>
            </th>
            <th style={{ padding: "12px 16px", textAlign: "left" }}>
              <Typography variant="subtitle2" fontWeight={600}>
                Slug
              </Typography>
            </th>
            <th style={{ padding: "12px 16px", textAlign: "center" }}>
              <Typography variant="subtitle2" fontWeight={600}>
                Products
              </Typography>
            </th>
            <th style={{ padding: "12px 16px", textAlign: "center" }}>
              <Typography variant="subtitle2" fontWeight={600}>
                Status
              </Typography>
            </th>
            <th
              style={{
                padding: "12px 16px",
                textAlign: "right",
                width: "15%",
              }}
            >
              <Typography variant="subtitle2" fontWeight={600}>
                Actions
              </Typography>
            </th>
          </tr>
        </thead>
        <tbody>
          {rootCategories.map((category) => (
            <CategoryNode
              key={category.id}
              category={category}
              allCategories={categories}
              level={0}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </tbody>
      </table>
    </TableContainer>
  );
}
