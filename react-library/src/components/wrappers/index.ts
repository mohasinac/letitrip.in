/**
 * Wrapper & Layout Components
 *
 * Framework-agnostic wrapper components for consistent page layouts.
 */

// Resource wrappers
export { ResourceDetailWrapper } from "./ResourceDetailWrapper";
export { ResourceListWrapper } from "./ResourceListWrapper";

// Settings components
export { SettingsGroup, SettingsRow, SettingsSection } from "./SettingsSection";

// Forms
export { SmartAddressForm } from "./SmartAddressForm";
export type {
  AddressFormData,
  GPSService,
  PincodeService,
  SmartAddressFormProps,
} from "./SmartAddressForm";
// Note: GeoCoordinates and PincodeLookupResult are already exported from ui and forms
