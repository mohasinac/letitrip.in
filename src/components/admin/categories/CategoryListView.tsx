"use client";

import React, { useMemo, useState } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  Tooltip,
  Badge,
  TablePagination,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Search as SearchIcon,
  Storage as StorageIcon,
} from "@mui/icons-material";
import type { Category } from "@/types";

interface CategoryListViewProps {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (categoryId: string) => void;
}

export default function CategoryListView({
  categories,
  onEdit,
  onDelete,
}: CategoryListViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const categoryMap = useMemo(
    () => new Map(categories.map((cat) => [cat.id, cat])),
    [categories],
  );

  const filteredCategories = useMemo(
    () =>
      categories.filter(
        (cat) =>
          cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          cat.slug.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    [categories, searchTerm],
  );

  const sortedCategories = useMemo(
    () =>
      [...filteredCategories].sort((a, b) => {
        const aMinLevel = a.minLevel !== undefined ? a.minLevel : 0;
        const bMinLevel = b.minLevel !== undefined ? b.minLevel : 0;
        if (aMinLevel !== bMinLevel) return aMinLevel - bMinLevel;
        return a.sortOrder - b.sortOrder;
      }),
    [filteredCategories],
  );

  const paginatedCategories = useMemo(
    () =>
      sortedCategories.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage,
      ),
    [sortedCategories, page, rowsPerPage],
  );

  const getParentInfo = (
    category: Category,
  ): { names: string[]; slugs: string[] } => {
    if (!category.parentIds || category.parentIds.length === 0) {
      return { names: ["—"], slugs: [] };
    }

    const names = category.parentIds
      .map((pid) => categoryMap.get(pid)?.name)
      .filter(Boolean) as string[];

    const slugs = category.parentSlugs || [];

    return {
      names: names.length > 0 ? names : ["Unknown"],
      slugs,
    };
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box>
      {/* Search Bar */}
      <Box sx={{ mb: 3 }}>
        <TextField
          placeholder="Search categories by name or slug..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(0);
          }}
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

      {/* Table */}
      <TableContainer
        component={Paper}
        sx={{
          backgroundColor: "background.paper",
          "& .MuiTableCell-head": {
            backgroundColor: "action.hover",
            color: "text.primary",
            fontWeight: 600,
          },
          "& .MuiTableRow-root": {
            backgroundColor: "background.paper",
            "&:hover": {
              backgroundColor: "action.hover",
            },
          },
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "action.hover" }}>
              <TableCell>
                <Typography variant="subtitle2" fontWeight={600}>
                  Name
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="subtitle2" fontWeight={600}>
                  Slug
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="subtitle2" fontWeight={600}>
                  Parent
                </Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="subtitle2" fontWeight={600}>
                  Level
                </Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="subtitle2" fontWeight={600}>
                  Products
                </Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="subtitle2" fontWeight={600}>
                  Status
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="subtitle2" fontWeight={600}>
                  Actions
                </Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedCategories.map((category) => (
              <TableRow key={category.id} hover>
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
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
                <TableCell>
                  <Typography
                    variant="caption"
                    sx={{
                      fontFamily: "monospace",
                      backgroundColor: "action.hover",
                      color: "text.primary",
                      px: 1,
                      py: 0.5,
                      borderRadius: 0.5,
                      display: "inline-block",
                    }}
                  >
                    {category.slug}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box>
                    {getParentInfo(category).names.map((name, idx) => (
                      <Box
                        key={idx}
                        sx={{
                          mb:
                            idx < getParentInfo(category).names.length - 1
                              ? 0.5
                              : 0,
                        }}
                      >
                        <Typography variant="body2">{name}</Typography>
                        {getParentInfo(category).slugs[idx] && (
                          <Typography
                            variant="caption"
                            sx={{
                              fontFamily: "monospace",
                              color: "text.secondary",
                              fontSize: "0.75rem",
                            }}
                          >
                            {getParentInfo(category).slugs[idx]}
                          </Typography>
                        )}
                      </Box>
                    ))}
                  </Box>
                </TableCell>
                <TableCell align="center">
                  <Chip
                    label={`${category.minLevel || 0}-${
                      category.maxLevel || 0
                    }`}
                    size="small"
                    variant="outlined"
                    title={`Min Level: ${category.minLevel || 0}, Max Level: ${
                      category.maxLevel || 0
                    }`}
                  />
                </TableCell>
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
                <TableCell align="center">
                  <Box
                    sx={{ display: "flex", gap: 1, justifyContent: "center" }}
                  >
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
                <TableCell align="right">
                  <Box
                    sx={{
                      display: "flex",
                      gap: 0.5,
                      justifyContent: "flex-end",
                    }}
                  >
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
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <Box sx={{ backgroundColor: "background.paper", mt: 2 }}>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={sortedCategories.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{
            color: "text.primary",
            "& .MuiTablePagination-toolbar": {
              color: "text.primary",
            },
            "& .MuiSelect-icon": {
              color: "text.primary",
            },
          }}
        />
      </Box>
    </Box>
  );
}
