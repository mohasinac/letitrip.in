/**
 * Utils Barrel Export
 *
 * App-specific utilities live locally. Generic helpers come from @mohasinac/appkit.
 */

// ------- Validators (delegated to appkit) -------
export {
  isValidEmail,
  isValidEmailDomain,
  normalizeEmail,
  isDisposableEmail,
  meetsPasswordRequirements,
  calculatePasswordStrength,
  isCommonPassword,
  isValidPhone,
  normalizePhone,
  formatPhone,
  extractCountryCode,
  isValidIndianMobile,
  isValidIndianPincode,
  isValidUrl,
  isValidUrlWithProtocol,
  isExternalUrl,
  sanitizeUrl,
  isRequired,
  minLength,
  maxLength,
  exactLength,
  isNumeric,
  inRange,
  matchesPattern,
  isInList,
} from "@mohasinac/appkit/validation";
export type {
  PasswordStrength,
  PasswordRequirements,
} from "@mohasinac/appkit/validation";

// ------- Formatters (delegated to appkit) -------
export {
  resolveDate,
  formatDate,
  formatDateTime,
  formatTime,
  formatRelativeTime,
  formatMonthYear,
  formatDateRange,
  isToday,
  isPast,
  isFuture,
  nowMs,
  isSameMonth,
  currentYear,
  nowISO,
  formatCustomDate,
  formatCurrency,
  formatNumber,
  formatPercentage,
  formatFileSize,
  formatCompactNumber,
  formatDecimal,
  formatOrdinal,
  parseFormattedNumber,
  capitalize,
  capitalizeWords,
  truncate,
  truncateWords,
  stripHtml,
  escapeHtml,
  slugify,
  maskString,
  randomString,
  isEmptyString,
  proseMirrorToHtml,
} from "@mohasinac/appkit/utils";

// ------- Converters (delegated to appkit) -------
export {
  stringToBoolean,
  booleanToString,
  arrayToObject,
  objectToArray,
  queryStringToObject,
  objectToQueryString,
  firestoreTimestampToDate,
  dateToISOString,
  parseCookies,
  getCookie,
  hasCookie,
  deleteCookie,
} from "@mohasinac/appkit/utils";

// ------- Event Management (delegated to appkit) -------
export {
  GlobalEventManager,
  globalEventManager,
  throttle,
  debounce,
  addGlobalScrollHandler,
  addGlobalResizeHandler,
  addGlobalClickHandler,
  addGlobalKeyHandler,
  removeGlobalHandler,
  isMobileDevice,
  hasTouchSupport,
  getViewportDimensions,
  isInViewport,
  smoothScrollTo,
  preventBodyScroll,
} from "@mohasinac/appkit/utils";

// ------- App-specific utilities -------
// ID Generators — app-specific superset of @mohasinac/utils generators
export * from "./id-generators";
// Guest Cart (localStorage storage for unauthenticated users)
export * from "./guest-cart";
// Order Splitter (cart → order group segmentation)
export * from "./order-splitter";
// Business Day (10:00 AM IST day-boundary logic)
export * from "./business-day";
