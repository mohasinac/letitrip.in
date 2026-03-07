/**
 * SellerShippingView
 *
 * Lets a seller configure their shipping method:
 *   1. Custom — fixed price + carrier name
 *   2. Shiprocket — credentials + pickup address + OTP verification
 */

"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  AdminPageHeader,
  Card,
  Button,
  FormField,
  Alert,
  Text,
  Heading,
  Badge,
  Modal,
  Spinner,
} from "@/components";
import { THEME_CONSTANTS } from "@/constants";
import { useSellerShipping } from "@/features/seller";

const { spacing, flex, themed } = THEME_CONSTANTS;

// ─── Custom shipping form ─────────────────────────────────────────────────────

interface CustomShippingFormProps {
  defaultCarrier: string;
  defaultPrice: number;
  isSaving: boolean;
  onSave: (data: {
    method: "custom";
    customCarrierName: string;
    customShippingPrice: number;
  }) => void;
}

function CustomShippingForm({
  defaultCarrier,
  defaultPrice,
  isSaving,
  onSave,
}: CustomShippingFormProps) {
  const t = useTranslations("sellerShipping");
  const [carrier, setCarrier] = useState(defaultCarrier);
  const [price, setPrice] = useState(String(defaultPrice || ""));

  return (
    <div className={spacing.stack}>
      <FormField
        type="text"
        name="customCarrierName"
        label={t("customCarrierLabel")}
        value={carrier}
        onChange={(v) => setCarrier(v)}
        placeholder={t("customCarrierPlaceholder")}
      />
      <FormField
        type="number"
        name="customShippingPrice"
        label={t("customPriceLabel")}
        value={price}
        onChange={(v) => setPrice(v)}
        placeholder="0"
        helpText={t("customPriceHelper")}
      />
      <Button
        variant="primary"
        isLoading={isSaving}
        onClick={() =>
          onSave({
            method: "custom",
            customCarrierName: carrier,
            customShippingPrice: Number(price) || 0,
          })
        }
      >
        {t("saveCustomShipping")}
      </Button>
    </div>
  );
}

// ─── Shiprocket credentials form ──────────────────────────────────────────────

interface SrCredsFormProps {
  isTokenValid: boolean;
  isSaving: boolean;
  onSave: (creds: { email: string; password: string }) => void;
}

function SrCredsForm({ isTokenValid, isSaving, onSave }: SrCredsFormProps) {
  const t = useTranslations("sellerShipping");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  if (isTokenValid) {
    return (
      <Alert variant="success" title={t("shiprocketConnected")}>
        {t("shiprocketConnectedDesc")}
      </Alert>
    );
  }

  return (
    <div className={spacing.stack}>
      <FormField
        type="email"
        name="shiprocketEmail"
        label={t("srEmailLabel")}
        value={email}
        onChange={(v) => setEmail(v)}
        placeholder={t("srEmailPlaceholder")}
      />
      <FormField
        type="password"
        name="shiprocketPassword"
        label={t("srPasswordLabel")}
        value={password}
        onChange={(v) => setPassword(v)}
        placeholder="••••••••"
        helpText={t("srPasswordHelper")}
      />
      <Button
        variant="primary"
        isLoading={isSaving}
        onClick={() => onSave({ email, password })}
      >
        {t("connectShiprocket")}
      </Button>
    </div>
  );
}

// ─── Pickup address form ──────────────────────────────────────────────────────

interface PickupAddressFormProps {
  isSaving: boolean;
  isVerified: boolean;
  onSave: (address: {
    locationName: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    address2?: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  }) => void;
}

function PickupAddressForm({
  isSaving,
  isVerified,
  onSave,
}: PickupAddressFormProps) {
  const t = useTranslations("sellerShipping");
  const [form, setForm] = useState({
    locationName: "",
    name: "",
    email: "",
    phone: "",
    address: "",
    address2: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
  });
  const set = (key: string, v: string) => setForm((f) => ({ ...f, [key]: v }));

  if (isVerified) {
    return (
      <Alert variant="success" title={t("pickupVerified")}>
        {t("pickupVerifiedDesc")}
      </Alert>
    );
  }

  return (
    <div className={spacing.stack}>
      <FormField
        type="text"
        name="locationName"
        label={t("pickupLocationName")}
        value={form.locationName}
        onChange={(v) => set("locationName", v)}
      />
      <FormField
        type="text"
        name="contactName"
        label={t("pickupContactName")}
        value={form.name}
        onChange={(v) => set("name", v)}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          type="email"
          name="pickupEmail"
          label={t("pickupEmail")}
          value={form.email}
          onChange={(v) => set("email", v)}
        />
        <FormField
          type="tel"
          name="pickupPhone"
          label={t("pickupPhone")}
          value={form.phone}
          onChange={(v) => set("phone", v)}
        />
      </div>
      <FormField
        type="text"
        name="address"
        label={t("pickupAddress")}
        value={form.address}
        onChange={(v) => set("address", v)}
      />
      <FormField
        type="text"
        name="address2"
        label={t("pickupAddress2")}
        value={form.address2}
        onChange={(v) => set("address2", v)}
      />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <FormField
          type="text"
          name="city"
          label={t("pickupCity")}
          value={form.city}
          onChange={(v) => set("city", v)}
        />
        <FormField
          type="text"
          name="state"
          label={t("pickupState")}
          value={form.state}
          onChange={(v) => set("state", v)}
        />
        <FormField
          type="text"
          name="pincode"
          label={t("pickupPincode")}
          value={form.pincode}
          onChange={(v) => set("pincode", v)}
        />
      </div>
      <Button
        variant="primary"
        isLoading={isSaving}
        onClick={() => onSave(form)}
      >
        {t("addPickupAddress")}
      </Button>
    </div>
  );
}

// ─── OTP verify modal ─────────────────────────────────────────────────────────

interface OtpModalProps {
  open: boolean;
  pickupLocationId: number | null;
  isVerifying: boolean;
  onVerify: (otp: number, pickupLocationId: number) => void;
  onClose: () => void;
}

function OtpModal({
  open,
  pickupLocationId,
  isVerifying,
  onVerify,
  onClose,
}: OtpModalProps) {
  const t = useTranslations("sellerShipping");
  const [otp, setOtp] = useState("");

  return (
    <Modal isOpen={open} onClose={onClose} title={t("otpModalTitle")} size="sm">
      <div className={spacing.stack}>
        <Text variant="secondary" size="sm">
          {t("otpModalDesc")}
        </Text>
        <FormField
          type="number"
          name="otp"
          label={t("otpLabel")}
          value={otp}
          onChange={(v) => setOtp(v)}
          placeholder="000000"
        />
        <div className={`${flex.end} gap-2`}>
          <Button variant="outline" onClick={onClose} disabled={isVerifying}>
            {t("cancel")}
          </Button>
          <Button
            variant="primary"
            isLoading={isVerifying}
            onClick={() => {
              if (pickupLocationId) onVerify(Number(otp), pickupLocationId);
            }}
          >
            {t("verifyOtp")}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Main view ────────────────────────────────────────────────────────────────

export function SellerShippingView() {
  const t = useTranslations("sellerShipping");
  const [selectedMethod, setSelectedMethod] = useState<
    "custom" | "shiprocket" | null
  >(null);
  const [otpModal, setOtpModal] = useState<{
    open: boolean;
    locationId: number | null;
  }>({
    open: false,
    locationId: null,
  });

  const {
    shippingConfig,
    isConfigured,
    isTokenValid,
    isLoading,
    isSaving,
    isVerifying,
    updateShipping,
    verifyOtp,
  } = useSellerShipping();

  const activeMethod = selectedMethod ?? shippingConfig?.method ?? null;

  if (isLoading) {
    return (
      <div className={`${flex.center} py-16`}>
        <Spinner size="xl" variant="primary" />
      </div>
    );
  }

  return (
    <div className={spacing.stack}>
      <AdminPageHeader
        title={t("pageTitle")}
        subtitle={t("pageSubtitle")}
        badge={
          isConfigured ? (
            <Badge variant="success">{t("configured")}</Badge>
          ) : undefined
        }
      />

      {/* Method selector */}
      <Card className="p-6">
        <Heading level={3} className="mb-4">
          {t("methodHeading")}
        </Heading>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(["custom", "shiprocket"] as const).map((method) => (
            <Button
              key={method}
              type="button"
              variant="ghost"
              onClick={() => setSelectedMethod(method)}
              className={`p-4 h-auto items-start flex-col text-left whitespace-normal border-2 w-full gap-0 ${
                activeMethod === method
                  ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
                  : `${themed.border} ${themed.bgPrimary} hover:border-indigo-300`
              }`}
            >
              <Text weight="semibold" className="mb-1">
                {method === "custom"
                  ? t("methodCustomTitle")
                  : t("methodShiprocketTitle")}
              </Text>
              <Text variant="secondary" size="sm">
                {method === "custom"
                  ? t("methodCustomDesc")
                  : t("methodShiprocketDesc")}
              </Text>
            </Button>
          ))}
        </div>
      </Card>

      {/* Custom shipping config */}
      {activeMethod === "custom" && (
        <Card className="p-6">
          <Heading level={3} className="mb-4">
            {t("customHeading")}
          </Heading>
          <CustomShippingForm
            defaultCarrier={shippingConfig?.customCarrierName ?? ""}
            defaultPrice={shippingConfig?.customShippingPrice ?? 0}
            isSaving={isSaving}
            onSave={(data) => updateShipping(data)}
          />
        </Card>
      )}

      {/* Shiprocket config */}
      {activeMethod === "shiprocket" && (
        <>
          <Card className="p-6">
            <Heading level={3} className="mb-1">
              {t("srCredsHeading")}
            </Heading>
            <Text variant="secondary" size="sm" className="mb-4">
              {t("srCredsDesc")}
            </Text>
            <SrCredsForm
              isTokenValid={isTokenValid}
              isSaving={isSaving}
              onSave={(creds) =>
                updateShipping({
                  method: "shiprocket",
                  shiprocketCredentials: creds,
                })
              }
            />
          </Card>

          {isTokenValid && (
            <Card className="p-6">
              <Heading level={3} className="mb-1">
                {t("pickupHeading")}
              </Heading>
              <Text variant="secondary" size="sm" className="mb-4">
                {t("pickupDesc")}
              </Text>
              <PickupAddressForm
                isSaving={isSaving}
                isVerified={shippingConfig?.pickupAddress?.isVerified ?? false}
                onSave={(address) => {
                  updateShipping({
                    method: "shiprocket",
                    pickupAddress: address,
                  });
                  // After saving, server will return otpPending — open modal
                  setOtpModal({ open: true, locationId: null }); // locationId comes from response
                }}
              />
            </Card>
          )}
        </>
      )}

      {/* OTP verification modal */}
      <OtpModal
        open={otpModal.open}
        pickupLocationId={otpModal.locationId}
        isVerifying={isVerifying}
        onVerify={(otp, locationId) =>
          verifyOtp({ otp, pickupLocationId: locationId })
        }
        onClose={() => setOtpModal({ open: false, locationId: null })}
      />
    </div>
  );
}
