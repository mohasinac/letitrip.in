export interface LanguageOption {
  code: string;
  label: string;
  available: boolean;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: "en", label: "English", available: true },
  { code: "hi", label: "हिन्दी (Hindi)", available: false },
  { code: "bn", label: "বাংলা (Bengali)", available: false },
  { code: "ta", label: "தமிழ் (Tamil)", available: false },
  { code: "te", label: "తెలుగు (Telugu)", available: false },
  { code: "mr", label: "मराठी (Marathi)", available: false },
  { code: "gu", label: "ગુજરાતી (Gujarati)", available: false },
  { code: "kn", label: "ಕನ್ನಡ (Kannada)", available: false },
  { code: "ml", label: "മലയാളം (Malayalam)", available: false },
  { code: "pa", label: "ਪੰਜਾਬੀ (Punjabi)", available: false },
  { code: "or", label: "ଓଡ଼ିଆ (Odia)", available: false },
  { code: "as", label: "অসমীয়া (Assamese)", available: false },
  { code: "ur", label: "اُردُو (Urdu)", available: false },
];

export const LANGUAGES_PAGE_SIZE = 5;
