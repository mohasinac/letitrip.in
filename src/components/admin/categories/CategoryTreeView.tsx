"use client";

import React, { useMemo, useState } from "react";
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
  TableRow as MuiTableRow,
  TextField,
  InputAdornment,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Storage as StorageIcon,
  Search as SearchIcon,
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
  searchTerm?: string;
}

function CategoryNode({
  category,
  allCategories,
  level,
  onEdit,
  onDelete,
  searchTerm = "",
}: CategoryNodeProps) {
  const [expanded, setExpanded] = React.useState(true);

  const children = useMemo(
    () => allCategories.filter((cat) => cat.parentIds?.includes(category.id)),
    [allCategories, category.id]
  );

  // Filter children based on search term
  const filteredChildren = useMemo(() => {
    if (!searchTerm) return children;
    return children.filter(
      (cat) =>
        cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cat.slug.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [children, searchTerm]);

  const hasChildren = filteredChildren.length > 0;

  // Check if current category or any descendant matches search
  const matchesSearch = useMemo(() => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    const directMatch =
      category.name.toLowerCase().includes(searchLower) ||
      category.slug.toLowerCase().includes(searchLower);
    
    if (directMatch) return true;
    
    // Check if any descendant matches
    const hasMatchingDescendant = (cats: Category[]): boolean => {
      return cats.some((cat) => {
        const matches =
          cat.name.toLowerCase().includes(searchLower) ||
          cat.slug.toLowerCase().includes(searchLower);
        if (matches) return true;
        
        const subChildren = allCategories.filter((c) =>
          c.parentIds?.includes(cat.id)
        );
        return hasMatchingDescendant(subChildren);
      });
    };
    
    return hasMatchingDescendant(children);
  }, [category, searchTerm, children, allCategories]);

  // Auto-expand if search is active and has matching descendants
  React.useEffect(() => {
    if (searchTerm && hasChildren) {
      setExpanded(true);
    }
  }, [searchTerm, hasChildren]);

  if (!matchesSearch) return null;

  return (
    <>
      <TableRow
        sx={{
          backgroundColor:
            level % 2 === 0 ? "background.paper" : "action.hover",
          "&:hover": {
            backgroundColor: "action.selected",
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
            {category.image && (
              <Box
                component="img"
                src={category.image}
                alt={category.name}
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: 1,
                  objectFit: "cover",
                }}
              />
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
          {filteredChildren.map((child) => (
            <CategoryNode
              key={child.id}
              category={child}
              allCategories={allCategories}
              level={level + 1}
              onEdit={onEdit}
              onDelete={onDelete}
              searchTerm={searchTerm}
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
  return <MuiTableRow sx={sx}>{children}</MuiTableRow>;
}

export default function CategoryTreeView({
  categories,
  onEdit,
  onDelete,
}: CategoryTreeViewProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const rootCategories = useMemo(
    () =>
      categories
        .filter((cat) => !cat.parentIds || cat.parentIds.length === 0)
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [categories]
  );

  return (
    <Box>
      {/* Search Bar */}
      <Box sx={{ mb: 3 }}>
        <TextField
          placeholder="Search categories by name or slug..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          fullWidth
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <TableContainer
      component={Paper}
      sx={{
        backgroundColor: "background.paper",
        "& thead tr": {
          backgroundColor: "action.hover",
        },
        "& th": {
          color: "text.primary",
          fontWeight: 600,
        },
        "& td": {
          color: "text.primary",
          borderColor: "divider",
        },
      }}
    >
      <table style={{ width: "100%" }}>
        <thead>
          <tr
            style={{
              borderBottom: "1px solid var(--palette-divider, #e0e0e0)",
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
              searchTerm={searchTerm}
            />
          ))}
        </tbody>
      </table>
    </TableContainer>
    </Box>
  );
}
