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
  Accordion,
  AccordionItem,
  AdminPageHeader,
  Card,
  Button,
  FormField,
  FormGroup,
  Alert,
  Text,
  Heading,
  Badge,
  SideDrawer,
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
      <FormGroup columns={2}>
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
      </FormGroup>
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
      <FormGroup columns={3}>
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
      </FormGroup>
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
    <SideDrawer
      isOpen={open}
      onClose={onClose}
      title={t("otpModalTitle")}
      mode="edit"
    >
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
        <div className={`${flex.start} gap-2`}>
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
    </SideDrawer>
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
        <Accordion
          type="multiple"
          defaultValue={[
            "seller-shipping-method",
            activeMethod === "custom"
              ? "seller-shipping-custom"
              : "seller-shipping-shiprocket",
          ]}
          className="rounded-2xl border border-zinc-200 dark:border-slate-700 overflow-hidden"
        >
          <AccordionItem
            value="seller-shipping-method"
            title={<Text className="font-semibold">{t("methodHeading")}</Text>}
          >
            <FormGroup columns={2} className="pt-3">
              {(["custom", "shiprocket"] as const).map((method) => (
                <Button
                  key={method}
                  type="button"
                  variant="ghost"
                  onClick={() => setSelectedMethod(method)}
                  className={`p-4 h-auto items-start flex-col text-left whitespace-normal border-2 w-full gap-0 ${
                    activeMethod === method
                      ? "border-primary bg-primary/5 dark:bg-primary/10"
                      : `${themed.border} ${themed.bgPrimary} hover:border-primary/50`
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
            </FormGroup>
          </AccordionItem>

          {activeMethod === "custom" && (
            <AccordionItem
              value="seller-shipping-custom"
              title={<Text className="font-semibold">{t("customHeading")}</Text>}
            >
              <div className="pt-3">
                <CustomShippingForm
                  defaultCarrier={shippingConfig?.customCarrierName ?? ""}
                  defaultPrice={shippingConfig?.customShippingPrice ?? 0}
                  isSaving={isSaving}
                  onSave={(data) => updateShipping(data)}
                />
              </div>
            </AccordionItem>
          )}

          {activeMethod === "shiprocket" && (
            <AccordionItem
              value="seller-shipping-shiprocket"
              title={<Text className="font-semibold">{t("srCredsHeading")}</Text>}
            >
              <div className="pt-3 space-y-5">
                <div>
                  <Text variant="secondary" size="sm" className="mb-3">
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
                </div>

                {isTokenValid && (
                  <div className={`pt-4 border-t ${themed.border}`}>
                    <Heading level={4} className="mb-1">
                      {t("pickupHeading")}
                    </Heading>
                    <Text variant="secondary" size="sm" className="mb-3">
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
                        setOtpModal({ open: true, locationId: null });
                      }}
                    />
                  </div>
                )}
              </div>
            </AccordionItem>
          )}
        </Accordion>
      </Card>

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
