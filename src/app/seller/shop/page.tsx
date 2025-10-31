"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Save,
  Upload,
  Loader2,
  AlertCircle,
  X,
} from "lucide-react";
import RoleGuard from "@/components/features/auth/RoleGuard";
import { useBreadcrumbTracker } from "@/hooks/useBreadcrumbTracker";
import { SELLER_ROUTES } from "@/constants/routes";
import { useAuth } from "@/contexts/AuthContext";
import { apiGet, apiPost } from "@/lib/api/seller";
import { uploadToFirebase } from "@/lib/firebase/storage";

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
      id={`shop-tabpanel-${index}`}
      aria-labelledby={`shop-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

function ShopSetupContent() {
  const { user } = useAuth();

  useBreadcrumbTracker([
    {
      label: "Seller",
      href: SELLER_ROUTES.DASHBOARD,
    },
    {
      label: "Shop Setup",
      href: SELLER_ROUTES.SHOP_SETUP,
      active: true,
    },
  ]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const [tabValue, setTabValue] = useState(0);
  const [shopData, setShopData] = useState({
    storeName: "",
    storeSlug: "",
    description: "",
    logo: "",
    coverImage: "",
    isActive: true,

    // SEO
    seoTitle: "",
    seoDescription: "",
    seoKeywords: [] as string[],

    // Business Info
    businessName: "",
    businessType: "individual" as "individual" | "company" | "partnership",
    gstNumber: "",
    panNumber: "",

    // Settings
    enableCOD: true,
    freeShippingThreshold: 0,
    processingTime: 2,
    returnPolicy: "",
    shippingPolicy: "",
  });

  const [pickupAddresses, setPickupAddresses] = useState([
    {
      id: "1",
      label: "",
      name: "",
      phone: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      pincode: "",
      country: "India",
      isDefault: true,
    },
  ]);

  const [keywordInput, setKeywordInput] = useState("");

  // Fetch shop data on mount
  useEffect(() => {
    if (user) {
      fetchShopData();
    }
  }, [user]);

  const fetchShopData = async () => {
    try {
      setLoading(true);

      // Check if user is authenticated
      if (!user) {
        setLoading(false);
        return;
      }

      const response: any = await apiGet("/api/seller/shop");

      if (response.success && response.data.exists !== false) {
        const data = response.data;

        // Map API data to form state
        setShopData({
          storeName: data.shopName || "",
          storeSlug: data.storeSlug || "",
          description: data.description || "",
          logo: data.logo || "",
          coverImage: data.coverImage || "",
          isActive: data.isActive ?? true,
          seoTitle: data.seo?.title || "",
          seoDescription: data.seo?.description || "",
          seoKeywords: data.seo?.keywords || [],
          businessName: data.businessInfo?.businessName || "",
          businessType: data.businessInfo?.businessType || "individual",
          gstNumber: data.businessInfo?.gstNumber || "",
          panNumber: data.businessInfo?.panNumber || "",
          enableCOD: data.settings?.enableCOD ?? true,
          freeShippingThreshold: data.settings?.freeShippingThreshold || 0,
          processingTime: data.settings?.processingTime || 2,
          returnPolicy: data.settings?.returnPolicy || "",
          shippingPolicy: data.settings?.shippingPolicy || "",
        });

        // Set pickup addresses
        if (data.addresses && data.addresses.length > 0) {
          setPickupAddresses(
            data.addresses.map((addr: any) => ({
              id: addr.id || Date.now().toString(),
              label: addr.label || "",
              name: addr.name || "",
              phone: addr.phone || "",
              addressLine1: addr.address || addr.addressLine1 || "",
              addressLine2: addr.addressLine2 || "",
              city: addr.city || "",
              state: addr.state || "",
              pincode: addr.pincode || "",
              country: addr.country || "India",
              isDefault: addr.isDefault || false,
            }))
          );
        }
      }
    } catch (error: any) {
      console.error("Error fetching shop data:", error);

      // Only show error if it's not an authentication issue
      if (error.message !== "Invalid token") {
        setSnackbar({
          open: true,
          message: "Failed to load shop data",
          severity: "error",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleChange = (field: string, value: any) => {
    setShopData((prev) => ({ ...prev, [field]: value }));

    // Auto-generate slug from store name
    if (field === "storeName") {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setShopData((prev) => ({ ...prev, storeSlug: slug }));
    }
  };

  const handleAddKeyword = () => {
    if (
      keywordInput.trim() &&
      !shopData.seoKeywords.includes(keywordInput.trim())
    ) {
      setShopData((prev) => ({
        ...prev,
        seoKeywords: [...prev.seoKeywords, keywordInput.trim()],
      }));
      setKeywordInput("");
    }
  };

  const handleDeleteKeyword = (keyword: string) => {
    setShopData((prev) => ({
      ...prev,
      seoKeywords: prev.seoKeywords.filter((k) => k !== keyword),
    }));
  };

  const handleAddAddress = () => {
    setPickupAddresses((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        label: "",
        name: "",
        phone: "",
        addressLine1: "",
        addressLine2: "",
        city: "",
        state: "",
        pincode: "",
        country: "India",
        isDefault: false,
      },
    ]);
  };

  const handleDeleteAddress = (id: string) => {
    if (pickupAddresses.length > 1) {
      setPickupAddresses((prev) => prev.filter((addr) => addr.id !== id));
    }
  };

  const handleAddressChange = (id: string, field: string, value: any) => {
    setPickupAddresses((prev) =>
      prev.map((addr) => (addr.id === id ? { ...addr, [field]: value } : addr))
    );
  };

  const handleSetDefaultAddress = (id: string) => {
    setPickupAddresses((prev) =>
      prev.map((addr) => ({
        ...addr,
        isDefault: addr.id === id,
      }))
    );
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Validate required fields
      if (!shopData.storeName.trim()) {
        setSnackbar({
          open: true,
          message: "Store name is required",
          severity: "error",
        });
        return;
      }

      if (pickupAddresses.length === 0 || !pickupAddresses[0].addressLine1) {
        setSnackbar({
          open: true,
          message: "At least one pickup address is required",
          severity: "error",
        });
        return;
      }

      // Prepare data for API
      const requestData = {
        shopName: shopData.storeName,
        storeSlug: shopData.storeSlug,
        description: shopData.description,
        logo: shopData.logo,
        coverImage: shopData.coverImage,
        isActive: shopData.isActive,
        addresses: pickupAddresses.map((addr) => ({
          id: addr.id,
          label: addr.label,
          name: addr.name,
          phone: addr.phone,
          address: addr.addressLine1,
          addressLine2: addr.addressLine2,
          city: addr.city,
          state: addr.state,
          pincode: addr.pincode,
          country: addr.country,
          isDefault: addr.isDefault,
        })),
        businessInfo: {
          businessName: shopData.businessName,
          businessType: shopData.businessType,
          gstNumber: shopData.gstNumber,
          panNumber: shopData.panNumber,
        },
        seo: {
          title: shopData.seoTitle || shopData.storeName,
          description: shopData.seoDescription || shopData.description,
          keywords: shopData.seoKeywords,
        },
        settings: {
          enableCOD: shopData.enableCOD,
          freeShippingThreshold: shopData.freeShippingThreshold,
          processingTime: shopData.processingTime,
          returnPolicy: shopData.returnPolicy,
          shippingPolicy: shopData.shippingPolicy,
        },
      };

      const response: any = await apiPost("/api/seller/shop", requestData);

      if (response.success) {
        setSnackbar({
          open: true,
          message: "Shop settings saved successfully!",
          severity: "success",
        });
      } else {
        throw new Error(response.error || "Failed to save shop settings");
      }
    } catch (error: any) {
      console.error("Error saving shop data:", error);
      setSnackbar({
        open: true,
        message: error.message || "Failed to save shop settings",
        severity: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      setUploadingLogo(true);
      const path = `sellers/${user.uid}/shop/logo-${Date.now()}`;
      const url = await uploadToFirebase(file, path);

      setShopData((prev) => ({ ...prev, logo: url }));
      setSnackbar({
        open: true,
        message: "Logo uploaded successfully",
        severity: "success",
      });
    } catch (error) {
      console.error("Error uploading logo:", error);
      setSnackbar({
        open: true,
        message: "Failed to upload logo",
        severity: "error",
      });
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      setUploadingCover(true);
      const path = `sellers/${user.uid}/shop/cover-${Date.now()}`;
      const url = await uploadToFirebase(file, path);

      setShopData((prev) => ({ ...prev, coverImage: url }));
      setSnackbar({
        open: true,
        message: "Cover image uploaded successfully",
        severity: "success",
      });
    } catch (error) {
      console.error("Error uploading cover:", error);
      setSnackbar({
        open: true,
        message: "Failed to upload cover image",
        severity: "error",
      });
    } finally {
      setUploadingCover(false);
    }
  };

  return (
    <Box sx={{ py: 4 }}>
      <Container maxWidth="lg">
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Shop Setup
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Configure your shop information, pickup addresses, and SEO settings
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Card>
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <Tabs value={tabValue} onChange={handleTabChange}>
                <Tab label="Basic Info" />
                <Tab label="Pickup Addresses" />
                <Tab label="Business Details" />
                <Tab label="SEO" />
                <Tab label="Settings" />
              </Tabs>
            </Box>

            {/* Tab 1: Basic Info */}
            <TabPanel value={tabValue} index={0}>
              <CardContent>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Store Name"
                      value={shopData.storeName}
                      onChange={(e) =>
                        handleChange("storeName", e.target.value)
                      }
                      required
                      helperText="This will be displayed on your store page"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Store Slug"
                      value={shopData.storeSlug}
                      onChange={(e) =>
                        handleChange("storeSlug", e.target.value)
                      }
                      required
                      helperText="URL-friendly name (auto-generated from store name)"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Store Description"
                      value={shopData.description}
                      onChange={(e) =>
                        handleChange("description", e.target.value)
                      }
                      multiline
                      rows={4}
                      helperText="Describe what your store sells"
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        Store Logo
                      </Typography>
                      {shopData.logo && (
                        <Box
                          sx={{
                            mb: 2,
                            display: "flex",
                            justifyContent: "center",
                          }}
                        >
                          <Avatar
                            src={shopData.logo}
                            sx={{ width: 120, height: 120 }}
                            variant="rounded"
                          />
                        </Box>
                      )}
                      <Button
                        variant="outlined"
                        component="label"
                        startIcon={
                          uploadingLogo ? (
                            <CircularProgress size={20} />
                          ) : (
                            <UploadIcon />
                          )
                        }
                        fullWidth
                        disabled={uploadingLogo}
                      >
                        {uploadingLogo
                          ? "Uploading..."
                          : shopData.logo
                          ? "Change Logo"
                          : "Upload Logo"}
                        <input
                          type="file"
                          hidden
                          accept="image/*"
                          onChange={handleLogoUpload}
                        />
                      </Button>
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        Cover Image
                      </Typography>
                      {shopData.coverImage && (
                        <Box
                          sx={{
                            mb: 2,
                            width: "100%",
                            height: 120,
                            backgroundImage: `url(${shopData.coverImage})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            borderRadius: 1,
                          }}
                        />
                      )}
                      <Button
                        variant="outlined"
                        component="label"
                        startIcon={
                          uploadingCover ? (
                            <CircularProgress size={20} />
                          ) : (
                            <UploadIcon />
                          )
                        }
                        fullWidth
                        disabled={uploadingCover}
                      >
                        {uploadingCover
                          ? "Uploading..."
                          : shopData.coverImage
                          ? "Change Cover"
                          : "Upload Cover"}
                        <input
                          type="file"
                          hidden
                          accept="image/*"
                          onChange={handleCoverUpload}
                        />
                      </Button>
                    </Box>
                  </Grid>

                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={shopData.isActive}
                          onChange={(e) =>
                            handleChange("isActive", e.target.checked)
                          }
                        />
                      }
                      label="Store is Active"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </TabPanel>

            {/* Tab 2: Pickup Addresses */}
            <TabPanel value={tabValue} index={1}>
              <CardContent>
                <Alert severity="info" sx={{ mb: 3 }}>
                  Add at least one pickup address. This is where customers'
                  orders will be shipped from. The first address is mandatory
                  and will be used as default.
                </Alert>

                {pickupAddresses.map((address, index) => (
                  <Card
                    key={address.id}
                    sx={{ mb: 3, p: 2, bgcolor: "grey.50" }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 2,
                      }}
                    >
                      <Typography variant="subtitle1" fontWeight={600}>
                        Pickup Address #{index + 1}
                        {address.isDefault && (
                          <Chip
                            label="Default"
                            size="small"
                            color="primary"
                            sx={{ ml: 1 }}
                          />
                        )}
                      </Typography>
                      <Box>
                        {!address.isDefault && (
                          <Button
                            size="small"
                            onClick={() => handleSetDefaultAddress(address.id)}
                            sx={{ mr: 1 }}
                          >
                            Set as Default
                          </Button>
                        )}
                        {pickupAddresses.length > 1 && (
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteAddress(address.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        )}
                      </Box>
                    </Box>

                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Address Label"
                          value={address.label}
                          onChange={(e) =>
                            handleAddressChange(
                              address.id,
                              "label",
                              e.target.value
                            )
                          }
                          placeholder="e.g., Main Warehouse, Store Location"
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Contact Name"
                          value={address.name}
                          onChange={(e) =>
                            handleAddressChange(
                              address.id,
                              "name",
                              e.target.value
                            )
                          }
                          required
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Phone"
                          value={address.phone}
                          onChange={(e) =>
                            handleAddressChange(
                              address.id,
                              "phone",
                              e.target.value
                            )
                          }
                          required
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Address Line 1"
                          value={address.addressLine1}
                          onChange={(e) =>
                            handleAddressChange(
                              address.id,
                              "addressLine1",
                              e.target.value
                            )
                          }
                          required
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Address Line 2"
                          value={address.addressLine2}
                          onChange={(e) =>
                            handleAddressChange(
                              address.id,
                              "addressLine2",
                              e.target.value
                            )
                          }
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="City"
                          value={address.city}
                          onChange={(e) =>
                            handleAddressChange(
                              address.id,
                              "city",
                              e.target.value
                            )
                          }
                          required
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="State"
                          value={address.state}
                          onChange={(e) =>
                            handleAddressChange(
                              address.id,
                              "state",
                              e.target.value
                            )
                          }
                          required
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Pincode"
                          value={address.pincode}
                          onChange={(e) =>
                            handleAddressChange(
                              address.id,
                              "pincode",
                              e.target.value
                            )
                          }
                          required
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Country"
                          value={address.country}
                          onChange={(e) =>
                            handleAddressChange(
                              address.id,
                              "country",
                              e.target.value
                            )
                          }
                          required
                          size="small"
                        />
                      </Grid>
                    </Grid>
                  </Card>
                ))}

                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={handleAddAddress}
                  fullWidth
                >
                  Add Another Pickup Address
                </Button>
              </CardContent>
            </TabPanel>

            {/* Tab 3: Business Details */}
            <TabPanel value={tabValue} index={2}>
              <CardContent>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Business Name"
                      value={shopData.businessName}
                      onChange={(e) =>
                        handleChange("businessName", e.target.value)
                      }
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel>Business Type</InputLabel>
                      <Select
                        value={shopData.businessType}
                        label="Business Type"
                        onChange={(e) =>
                          handleChange("businessType", e.target.value)
                        }
                      >
                        <MenuItem value="individual">Individual</MenuItem>
                        <MenuItem value="company">Company</MenuItem>
                        <MenuItem value="partnership">Partnership</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="GST Number"
                      value={shopData.gstNumber}
                      onChange={(e) =>
                        handleChange("gstNumber", e.target.value)
                      }
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="PAN Number"
                      value={shopData.panNumber}
                      onChange={(e) =>
                        handleChange("panNumber", e.target.value)
                      }
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </TabPanel>

            {/* Tab 4: SEO */}
            <TabPanel value={tabValue} index={3}>
              <CardContent>
                <Alert severity="info" sx={{ mb: 3 }}>
                  These details will help your store rank better in search
                  engines
                </Alert>

                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="SEO Title"
                      value={shopData.seoTitle}
                      onChange={(e) => handleChange("seoTitle", e.target.value)}
                      helperText="55-60 characters recommended"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="SEO Description"
                      value={shopData.seoDescription}
                      onChange={(e) =>
                        handleChange("seoDescription", e.target.value)
                      }
                      multiline
                      rows={3}
                      helperText="150-160 characters recommended"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom>
                      SEO Keywords
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="Add keyword"
                        value={keywordInput}
                        onChange={(e) => setKeywordInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddKeyword();
                          }
                        }}
                      />
                      <Button variant="outlined" onClick={handleAddKeyword}>
                        Add
                      </Button>
                    </Box>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                      {shopData.seoKeywords.map((keyword) => (
                        <Chip
                          key={keyword}
                          label={keyword}
                          onDelete={() => handleDeleteKeyword(keyword)}
                        />
                      ))}
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </TabPanel>

            {/* Tab 5: Settings */}
            <TabPanel value={tabValue} index={4}>
              <CardContent>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={shopData.enableCOD}
                          onChange={(e) =>
                            handleChange("enableCOD", e.target.checked)
                          }
                        />
                      }
                      label="Enable Cash on Delivery (COD)"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Free Shipping Threshold (₹)"
                      value={shopData.freeShippingThreshold}
                      onChange={(e) =>
                        handleChange(
                          "freeShippingThreshold",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      helperText="Orders above this amount get free shipping (0 to disable)"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Processing Time (days)"
                      value={shopData.processingTime}
                      onChange={(e) =>
                        handleChange(
                          "processingTime",
                          parseInt(e.target.value) || 0
                        )
                      }
                      helperText="Number of days to process an order before shipping"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Return Policy"
                      value={shopData.returnPolicy}
                      onChange={(e) =>
                        handleChange("returnPolicy", e.target.value)
                      }
                      multiline
                      rows={4}
                      helperText="Describe your return/refund policy"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Shipping Policy"
                      value={shopData.shippingPolicy}
                      onChange={(e) =>
                        handleChange("shippingPolicy", e.target.value)
                      }
                      multiline
                      rows={4}
                      helperText="Describe your shipping policy and delivery times"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </TabPanel>

            <Divider />

            <CardContent>
              <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
                <Button variant="outlined">Cancel</Button>
                <Button
                  variant="contained"
                  startIcon={
                    saving ? <CircularProgress size={20} /> : <SaveIcon />
                  }
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Shop Settings"}
                </Button>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
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

export default function ShopSetup() {
  return (
    <RoleGuard requiredRole="seller">
      <ShopSetupContent />
    </RoleGuard>
  );
}
