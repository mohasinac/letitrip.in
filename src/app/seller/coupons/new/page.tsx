"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Chip,
  IconButton,
  Alert,
  Divider,
  Tab,
  Tabs,
  InputAdornment,
  Autocomplete,
  FormGroup,
  Checkbox,
  FormHelperText,
  CircularProgress,
  Snackbar,
} from "@mui/material";
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Info as InfoIcon,
  Casino as RandomIcon,
} from "@mui/icons-material";
import RoleGuard from "@/components/features/auth/RoleGuard";
import { useBreadcrumbTracker } from "@/hooks/useBreadcrumbTracker";
import { SELLER_ROUTES } from "@/constants/routes";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiPost } from "@/lib/api/seller";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`coupon-tabpanel-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

function CouponFormContent() {
  const router = useRouter();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  useBreadcrumbTracker([
    {
      label: "Seller",
      href: SELLER_ROUTES.DASHBOARD,
    },
    {
      label: "Coupons",
      href: SELLER_ROUTES.COUPONS,
    },
    {
      label: "Create Coupon",
      href: SELLER_ROUTES.COUPONS_NEW,
      active: true,
    },
  ]);

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    type: "percentage" as
      | "percentage"
      | "fixed"
      | "free_shipping"
      | "bogo"
      | "cart_discount",
    value: 0,
    minimumAmount: 0,
    maximumAmount: 0,
    maxUses: 0,
    maxUsesPerUser: 0,
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    isPermanent: false,
    status: "active" as "active" | "inactive" | "scheduled",

    // Product/Category Selection
    applicableProducts: [] as string[],
    applicableCategories: [] as string[],
    excludeProducts: [] as string[],
    excludeCategories: [] as string[],

    // Restrictions
    restrictions: {
      firstTimeOnly: false,
      newCustomersOnly: false,
      existingCustomersOnly: false,
      minQuantity: 0,
      maxQuantity: 0,
      allowedPaymentMethods: [] as ("cod" | "prepaid")[],
      allowedUserEmails: [] as string[],
      excludedUserEmails: [] as string[],
    },

    // Stacking
    combinable: false,
    priority: 1,
  });

  const [emailInput, setEmailInput] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Mock data for products and categories
  const mockProducts = [
    { id: "1", name: "Product 1" },
    { id: "2", name: "Product 2" },
    { id: "3", name: "Product 3" },
  ];

  const mockCategories = [
    { id: "cat1", name: "Category 1" },
    { id: "cat2", name: "Category 2" },
    { id: "cat3", name: "Category 3" },
  ];

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleRestrictionChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      restrictions: { ...prev.restrictions, [field]: value },
    }));
  };

  const generateRandomCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    handleChange("code", code);
  };

  const handleAddEmail = (type: "allowed" | "excluded") => {
    if (emailInput.trim() && emailInput.includes("@")) {
      const field =
        type === "allowed" ? "allowedUserEmails" : "excludedUserEmails";
      handleRestrictionChange(field, [
        ...formData.restrictions[field],
        emailInput.trim(),
      ]);
      setEmailInput("");
    }
  };

  const handleRemoveEmail = (type: "allowed" | "excluded", email: string) => {
    const field =
      type === "allowed" ? "allowedUserEmails" : "excludedUserEmails";
    handleRestrictionChange(
      field,
      formData.restrictions[field].filter((e) => e !== email)
    );
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.code.trim()) {
      newErrors.code = "Coupon code is required";
    }
    if (!formData.name.trim()) {
      newErrors.name = "Coupon name is required";
    }
    if (formData.type !== "free_shipping" && formData.value <= 0) {
      newErrors.value = "Value must be greater than 0";
    }
    if (formData.type === "percentage" && formData.value > 100) {
      newErrors.value = "Percentage cannot exceed 100";
    }
    if (!formData.isPermanent && !formData.endDate) {
      newErrors.endDate = "End date is required for non-permanent coupons";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      setTabValue(0); // Go to first tab if validation fails
      return;
    }

    setLoading(true);

    try {
      // Prepare API payload
      const payload = {
        code: formData.code.toUpperCase(),
        name: formData.name,
        description: formData.description,
        type: formData.type,
        discountValue: formData.value,
        maxDiscountAmount: formData.maximumAmount || null,
        minOrderAmount: formData.minimumAmount || 0,
        maxTotalUses: formData.maxUses || null,
        maxUsesPerUser: formData.maxUsesPerUser || null,
        applicableProducts: formData.applicableProducts,
        applicableCategories: formData.applicableCategories,
        excludedProducts: formData.excludeProducts,
        excludedCategories: formData.excludeCategories,
        firstTimeOnly: formData.restrictions.firstTimeOnly,
        newCustomersOnly: formData.restrictions.newCustomersOnly,
        existingCustomersOnly: formData.restrictions.existingCustomersOnly,
        minQuantity: formData.restrictions.minQuantity || null,
        maxQuantity: formData.restrictions.maxQuantity || null,
        allowedPaymentMethods:
          formData.restrictions.allowedPaymentMethods || [],
        allowedUserEmails: formData.restrictions.allowedUserEmails || [],
        excludedUserEmails: formData.restrictions.excludedUserEmails || [],
        canStackWithOthers: formData.combinable,
        priority: formData.priority,
        startDate: formData.startDate,
        endDate: formData.isPermanent ? null : formData.endDate,
        isPermanent: formData.isPermanent,
        status: "active",
      };

      const response = await apiPost("/api/seller/coupons", payload);

      setSnackbar({
        open: true,
        message: "Coupon created successfully!",
        severity: "success",
      });

      // Navigate after a short delay to show the success message
      setTimeout(() => {
        router.push(SELLER_ROUTES.COUPONS);
      }, 1500);
    } catch (error: any) {
      console.error("Error saving coupon:", error);
      setSnackbar({
        open: true,
        message: error.message || "Failed to create coupon. Please try again.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ py: 4 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Button
            component={Link}
            href={SELLER_ROUTES.COUPONS}
            startIcon={<ArrowBackIcon />}
            sx={{ mb: 2, textTransform: "none" }}
          >
            Back to Coupons
          </Button>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Create Coupon
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Create a discount coupon to attract customers
          </Typography>
        </Box>

        <Card>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant="scrollable"
            >
              <Tab label="Basic Info" />
              <Tab label="Usage Restrictions" />
              <Tab label="Products & Categories" />
              <Tab label="Advanced Restrictions" />
              <Tab label="Stacking & Priority" />
            </Tabs>
          </Box>

          {/* Tab 1: Basic Info */}
          <TabPanel value={tabValue} index={0}>
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    <Typography variant="body2">
                      Create unique coupon codes that customers can use to get
                      discounts on their orders.
                    </Typography>
                  </Alert>
                </Grid>

                <Grid item xs={12} md={8}>
                  <TextField
                    fullWidth
                    label="Coupon Code"
                    value={formData.code}
                    onChange={(e) =>
                      handleChange("code", e.target.value.toUpperCase())
                    }
                    required
                    error={!!errors.code}
                    helperText={
                      errors.code || "Uppercase letters and numbers only"
                    }
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={generateRandomCode} edge="end">
                            <RandomIcon />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <FormControl fullWidth required error={!!errors.status}>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={formData.status}
                      label="Status"
                      onChange={(e) => handleChange("status", e.target.value)}
                    >
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="inactive">Inactive</MenuItem>
                      <MenuItem value="scheduled">Scheduled</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Coupon Name"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    required
                    error={!!errors.name}
                    helperText={
                      errors.name || "Internal name for your reference"
                    }
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    value={formData.description}
                    onChange={(e) =>
                      handleChange("description", e.target.value)
                    }
                    multiline
                    rows={2}
                    helperText="Describe what this coupon does"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Discount Type</InputLabel>
                    <Select
                      value={formData.type}
                      label="Discount Type"
                      onChange={(e) => handleChange("type", e.target.value)}
                    >
                      <MenuItem value="percentage">
                        Percentage Discount
                      </MenuItem>
                      <MenuItem value="fixed">Fixed Amount Discount</MenuItem>
                      <MenuItem value="free_shipping">Free Shipping</MenuItem>
                      <MenuItem value="bogo">Buy One Get One</MenuItem>
                      <MenuItem value="cart_discount">Cart Discount</MenuItem>
                    </Select>
                    <FormHelperText>Select the type of discount</FormHelperText>
                  </FormControl>
                </Grid>

                {formData.type !== "free_shipping" && (
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Discount Value"
                      value={formData.value}
                      onChange={(e) =>
                        handleChange("value", parseFloat(e.target.value) || 0)
                      }
                      required
                      error={!!errors.value}
                      helperText={
                        errors.value ||
                        (formData.type === "percentage"
                          ? "Percentage (0-100)"
                          : "Amount in ₹")
                      }
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            {formData.type === "percentage" ? "%" : "₹"}
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                )}

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Minimum Order Amount"
                    value={formData.minimumAmount}
                    onChange={(e) =>
                      handleChange(
                        "minimumAmount",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    helperText="Minimum cart value required"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">₹</InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                {formData.type === "percentage" && (
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Maximum Discount Amount"
                      value={formData.maximumAmount}
                      onChange={(e) =>
                        handleChange(
                          "maximumAmount",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      helperText="Cap the discount amount"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">₹</InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                )}

                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                    Validity Period
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Start Date"
                    value={formData.startDate}
                    onChange={(e) => handleChange("startDate", e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="date"
                    label="End Date"
                    value={formData.endDate}
                    onChange={(e) => handleChange("endDate", e.target.value)}
                    disabled={formData.isPermanent}
                    error={!!errors.endDate}
                    helperText={errors.endDate}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.isPermanent}
                        onChange={(e) =>
                          handleChange("isPermanent", e.target.checked)
                        }
                      />
                    }
                    label="This coupon never expires"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </TabPanel>

          {/* Tab 2: Usage Restrictions */}
          <TabPanel value={tabValue} index={1}>
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Alert severity="info" icon={<InfoIcon />}>
                    Set limits on how many times this coupon can be used
                  </Alert>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Maximum Total Uses"
                    value={formData.maxUses || ""}
                    onChange={(e) =>
                      handleChange("maxUses", parseInt(e.target.value) || 0)
                    }
                    helperText="Total times this coupon can be used (0 = unlimited)"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Maximum Uses Per User"
                    value={formData.maxUsesPerUser || ""}
                    onChange={(e) =>
                      handleChange(
                        "maxUsesPerUser",
                        parseInt(e.target.value) || 0
                      )
                    }
                    helperText="Times each customer can use this (0 = unlimited)"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </TabPanel>

          {/* Tab 3: Products & Categories */}
          <TabPanel value={tabValue} index={2}>
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Alert severity="info">
                    Leave empty to apply to all products. Select specific
                    products or categories to restrict the coupon.
                  </Alert>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                    Applicable To
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Autocomplete
                    multiple
                    options={mockProducts}
                    getOptionLabel={(option) => option.name}
                    value={mockProducts.filter((p) =>
                      formData.applicableProducts.includes(p.id)
                    )}
                    onChange={(e, value) =>
                      handleChange(
                        "applicableProducts",
                        value.map((v) => v.id)
                      )
                    }
                    renderInput={(params) => (
                      <TextField {...params} label="Applicable Products" />
                    )}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <Autocomplete
                    multiple
                    options={mockCategories}
                    getOptionLabel={(option) => option.name}
                    value={mockCategories.filter((c) =>
                      formData.applicableCategories.includes(c.id)
                    )}
                    onChange={(e, value) =>
                      handleChange(
                        "applicableCategories",
                        value.map((v) => v.id)
                      )
                    }
                    renderInput={(params) => (
                      <TextField {...params} label="Applicable Categories" />
                    )}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                    Exclude From
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Autocomplete
                    multiple
                    options={mockProducts}
                    getOptionLabel={(option) => option.name}
                    value={mockProducts.filter((p) =>
                      formData.excludeProducts.includes(p.id)
                    )}
                    onChange={(e, value) =>
                      handleChange(
                        "excludeProducts",
                        value.map((v) => v.id)
                      )
                    }
                    renderInput={(params) => (
                      <TextField {...params} label="Exclude Products" />
                    )}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <Autocomplete
                    multiple
                    options={mockCategories}
                    getOptionLabel={(option) => option.name}
                    value={mockCategories.filter((c) =>
                      formData.excludeCategories.includes(c.id)
                    )}
                    onChange={(e, value) =>
                      handleChange(
                        "excludeCategories",
                        value.map((v) => v.id)
                      )
                    }
                    renderInput={(params) => (
                      <TextField {...params} label="Exclude Categories" />
                    )}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </TabPanel>

          {/* Tab 4: Advanced Restrictions */}
          <TabPanel value={tabValue} index={3}>
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                    Customer Restrictions
                  </Typography>
                  <FormGroup>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.restrictions.firstTimeOnly}
                          onChange={(e) =>
                            handleRestrictionChange(
                              "firstTimeOnly",
                              e.target.checked
                            )
                          }
                        />
                      }
                      label="First-time orders only"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.restrictions.newCustomersOnly}
                          onChange={(e) =>
                            handleRestrictionChange(
                              "newCustomersOnly",
                              e.target.checked
                            )
                          }
                        />
                      }
                      label="New customers only"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.restrictions.existingCustomersOnly}
                          onChange={(e) =>
                            handleRestrictionChange(
                              "existingCustomersOnly",
                              e.target.checked
                            )
                          }
                        />
                      }
                      label="Existing customers only"
                    />
                  </FormGroup>
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                    Quantity Restrictions
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Minimum Quantity"
                    value={formData.restrictions.minQuantity || ""}
                    onChange={(e) =>
                      handleRestrictionChange(
                        "minQuantity",
                        parseInt(e.target.value) || 0
                      )
                    }
                    helperText="Minimum items in cart"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Maximum Quantity"
                    value={formData.restrictions.maxQuantity || ""}
                    onChange={(e) =>
                      handleRestrictionChange(
                        "maxQuantity",
                        parseInt(e.target.value) || 0
                      )
                    }
                    helperText="Maximum items in cart"
                  />
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                    Payment Method
                  </Typography>
                  <FormGroup row>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.restrictions.allowedPaymentMethods?.includes(
                            "cod"
                          )}
                          onChange={(e) => {
                            const methods =
                              formData.restrictions.allowedPaymentMethods || [];
                            handleRestrictionChange(
                              "allowedPaymentMethods",
                              e.target.checked
                                ? [...methods, "cod"]
                                : methods.filter((m) => m !== "cod")
                            );
                          }}
                        />
                      }
                      label="Cash on Delivery"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.restrictions.allowedPaymentMethods?.includes(
                            "prepaid"
                          )}
                          onChange={(e) => {
                            const methods =
                              formData.restrictions.allowedPaymentMethods || [];
                            handleRestrictionChange(
                              "allowedPaymentMethods",
                              e.target.checked
                                ? [...methods, "prepaid"]
                                : methods.filter((m) => m !== "prepaid")
                            );
                          }}
                        />
                      }
                      label="Prepaid (Online)"
                    />
                  </FormGroup>
                  <FormHelperText>
                    Leave unchecked to allow all payment methods
                  </FormHelperText>
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                    Email Restrictions
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Allowed User Emails (whitelist)
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="user@example.com"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddEmail("allowed");
                        }
                      }}
                    />
                    <Button
                      variant="outlined"
                      onClick={() => handleAddEmail("allowed")}
                    >
                      Add
                    </Button>
                  </Box>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {formData.restrictions.allowedUserEmails.map((email) => (
                      <Chip
                        key={email}
                        label={email}
                        onDelete={() => handleRemoveEmail("allowed", email)}
                        size="small"
                      />
                    ))}
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Excluded User Emails (blacklist)
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="user@example.com"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddEmail("excluded");
                        }
                      }}
                    />
                    <Button
                      variant="outlined"
                      onClick={() => handleAddEmail("excluded")}
                    >
                      Add
                    </Button>
                  </Box>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {formData.restrictions.excludedUserEmails.map((email) => (
                      <Chip
                        key={email}
                        label={email}
                        onDelete={() => handleRemoveEmail("excluded", email)}
                        size="small"
                        color="error"
                      />
                    ))}
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </TabPanel>

          {/* Tab 5: Stacking & Priority */}
          <TabPanel value={tabValue} index={4}>
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Alert severity="info">
                    Configure how this coupon interacts with other coupons and
                    sales
                  </Alert>
                </Grid>

                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.combinable}
                        onChange={(e) =>
                          handleChange("combinable", e.target.checked)
                        }
                      />
                    }
                    label="Can be combined with other coupons"
                  />
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                  >
                    Allow customers to use multiple coupons in a single order
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Priority"
                    value={formData.priority}
                    onChange={(e) =>
                      handleChange("priority", parseInt(e.target.value) || 1)
                    }
                    helperText="Higher priority coupons are applied first (1-10)"
                    inputProps={{ min: 1, max: 10 }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
                    <Typography
                      variant="subtitle2"
                      fontWeight={600}
                      gutterBottom
                    >
                      How Priority Works:
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      • Priority 10 = Highest (applied first)
                      <br />
                      • Priority 1 = Lowest (applied last)
                      <br />• When multiple coupons are combinable, higher
                      priority ones calculate first
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </TabPanel>

          <Divider />

          {/* Action Buttons */}
          <CardContent>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}
            >
              <Button
                component={Link}
                href={SELLER_ROUTES.COUPONS}
                variant="outlined"
              >
                Cancel
              </Button>
              <Box sx={{ display: "flex", gap: 2 }}>
                {tabValue > 0 && (
                  <Button
                    variant="outlined"
                    onClick={() => setTabValue(tabValue - 1)}
                  >
                    Previous
                  </Button>
                )}
                {tabValue < 4 ? (
                  <Button
                    variant="contained"
                    onClick={() => setTabValue(tabValue + 1)}
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    startIcon={
                      loading ? (
                        <CircularProgress size={20} color="inherit" />
                      ) : (
                        <SaveIcon />
                      )
                    }
                    onClick={handleSave}
                    disabled={loading}
                  >
                    {loading ? "Creating..." : "Create Coupon"}
                  </Button>
                )}
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Success/Error Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
}

export default function CouponForm() {
  return (
    <RoleGuard requiredRole="seller">
      <CouponFormContent />
    </RoleGuard>
  );
}
