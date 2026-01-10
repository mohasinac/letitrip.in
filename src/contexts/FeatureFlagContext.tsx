"use client";

import { logError } from "@/lib/firebase-error-logger";
import { getApps, initializeApp } from "firebase/app";
import {
  fetchAndActivate,
  getBoolean,
  getNumber,
  getRemoteConfig,
  getString,
  getValue,
  type RemoteConfig,
} from "firebase/remote-config";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

/**
 * Feature flag value types
 */
export type FeatureFlagValue = string | number | boolean;

/**
 * Feature flag context value
 */
interface FeatureFlagContextValue {
  /** Whether flags are loaded and ready */
  isLoading: boolean;
  /** Whether flags have been successfully fetched */
  isReady: boolean;
  /** Get a boolean feature flag */
  getBoolean: (key: string, defaultValue?: boolean) => boolean;
  /** Get a number feature flag */
  getNumber: (key: string, defaultValue?: number) => number;
  /** Get a string feature flag */
  getString: (key: string, defaultValue?: string) => string;
  /** Check if a feature is enabled */
  isFeatureEnabled: (featureName: string) => boolean;
  /** Get A/B test variant */
  getVariant: (experimentName: string) => string | null;
  /** Refresh feature flags from remote */
  refresh: () => Promise<void>;
  /** Get all current flag values (for debugging) */
  getAllFlags: () => Record<string, FeatureFlagValue>;
}

const FeatureFlagContext = createContext<FeatureFlagContextValue | undefined>(
  undefined
);

/**
 * Feature Flag Provider Props
 */
interface FeatureFlagProviderProps {
  children: ReactNode;
  /** Custom Remote Config instance (for testing) */
  remoteConfigInstance?: RemoteConfig;
}

/**
 * Feature Flag Provider
 * Manages feature flags using Firebase Remote Config
 *
 * @example
 * ```tsx
 * function App() {
 *   return (
 *     <FeatureFlagProvider>
 *       <YourApp />
 *     </FeatureFlagProvider>
 *   );
 * }
 * ```
 */
export function FeatureFlagProvider({
  children,
  remoteConfigInstance,
}: FeatureFlagProviderProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [remoteConfig, setRemoteConfig] = useState<RemoteConfig | null>(null);
  const [flagCache, setFlagCache] = useState<Record<string, FeatureFlagValue>>(
    {}
  );

  // Initialize Firebase Remote Config
  useEffect(() => {
    if (remoteConfigInstance) {
      setRemoteConfig(remoteConfigInstance);
      return;
    }

    try {
      // Initialize Firebase app if not already initialized
      if (getApps().length === 0) {
        const firebaseConfig = {
          apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
          authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
          messagingSenderId:
            process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
          appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
          measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
        };

        initializeApp(firebaseConfig);
      }

      const config = getRemoteConfig(getApps()[0]);

      // Configure Remote Config settings
      config.settings.minimumFetchIntervalMillis = 3600000; // 1 hour
      config.settings.fetchTimeoutMillis = 60000; // 60 seconds

      // Set default values for feature flags
      config.defaultConfig = {
        // Feature toggles
        enable_dark_mode: true,
        enable_notifications: true,
        enable_search: true,
        enable_comparison: true,
        enable_favorites: true,
        enable_reviews: true,
        enable_social_share: true,
        enable_analytics: true,

        // Feature limits
        max_comparison_products: 4,
        max_favorites: 100,
        max_cart_items: 50,

        // A/B testing variants
        homepage_layout: "default",
        product_card_style: "default",
        checkout_flow: "default",
      };

      setRemoteConfig(config);
    } catch (error) {
      logError(
        error,
        "FEATURE_FLAGS",
        "Failed to initialize Firebase Remote Config"
      );
      setIsLoading(false);
    }
  }, [remoteConfigInstance]);

  // Fetch and activate remote config on mount
  useEffect(() => {
    if (!remoteConfig) return;

    const fetchFlags = async () => {
      try {
        await fetchAndActivate(remoteConfig);
        setIsReady(true);
      } catch (error) {
        logError(
          error,
          "FEATURE_FLAGS",
          "Failed to fetch feature flags from Remote Config"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchFlags();
  }, [remoteConfig]);

  /**
   * Get a boolean feature flag
   */
  const getBooleanFlag = useCallback(
    (key: string, defaultValue: boolean = false): boolean => {
      if (!remoteConfig) return defaultValue;

      try {
        const value = getBoolean(remoteConfig, key);
        setFlagCache((prev) => ({ ...prev, [key]: value }));
        return value;
      } catch (error) {
        logError(error, "FEATURE_FLAGS", `Failed to get boolean flag: ${key}`);
        return defaultValue;
      }
    },
    [remoteConfig]
  );

  /**
   * Get a number feature flag
   */
  const getNumberFlag = useCallback(
    (key: string, defaultValue: number = 0): number => {
      if (!remoteConfig) return defaultValue;

      try {
        const value = getNumber(remoteConfig, key);
        setFlagCache((prev) => ({ ...prev, [key]: value }));
        return value;
      } catch (error) {
        logError(error, "FEATURE_FLAGS", `Failed to get number flag: ${key}`);
        return defaultValue;
      }
    },
    [remoteConfig]
  );

  /**
   * Get a string feature flag
   */
  const getStringFlag = useCallback(
    (key: string, defaultValue: string = ""): string => {
      if (!remoteConfig) return defaultValue;

      try {
        const value = getString(remoteConfig, key);
        setFlagCache((prev) => ({ ...prev, [key]: value }));
        return value;
      } catch (error) {
        logError(error, "FEATURE_FLAGS", `Failed to get string flag: ${key}`);
        return defaultValue;
      }
    },
    [remoteConfig]
  );

  /**
   * Check if a feature is enabled
   */
  const isFeatureEnabled = useCallback(
    (featureName: string): boolean => {
      const flagKey = `enable_${featureName}`;
      return getBooleanFlag(flagKey, false);
    },
    [getBooleanFlag]
  );

  /**
   * Get A/B test variant
   */
  const getVariant = useCallback(
    (experimentName: string): string | null => {
      if (!remoteConfig) return null;

      try {
        const value = getValue(remoteConfig, experimentName);
        const variant = value.asString();
        setFlagCache((prev) => ({ ...prev, [experimentName]: variant }));
        return variant || null;
      } catch (error) {
        logError(
          error,
          "FEATURE_FLAGS",
          `Failed to get variant for: ${experimentName}`
        );
        return null;
      }
    },
    [remoteConfig]
  );

  /**
   * Refresh feature flags from remote
   */
  const refresh = useCallback(async () => {
    if (!remoteConfig) return;

    setIsLoading(true);
    try {
      await fetchAndActivate(remoteConfig);
      // Clear cache to force re-fetching all flags
      setFlagCache({});
    } catch (error) {
      logError(error, "FEATURE_FLAGS", "Failed to refresh feature flags");
    } finally {
      setIsLoading(false);
    }
  }, [remoteConfig]);

  /**
   * Get all current flag values (for debugging)
   */
  const getAllFlags = useCallback((): Record<string, FeatureFlagValue> => {
    return { ...flagCache };
  }, [flagCache]);

  const value: FeatureFlagContextValue = {
    isLoading,
    isReady,
    getBoolean: getBooleanFlag,
    getNumber: getNumberFlag,
    getString: getStringFlag,
    isFeatureEnabled,
    getVariant,
    refresh,
    getAllFlags,
  };

  return (
    <FeatureFlagContext.Provider value={value}>
      {children}
    </FeatureFlagContext.Provider>
  );
}

/**
 * Hook to access feature flags
 *
 * @throws {Error} If used outside of FeatureFlagProvider
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { isFeatureEnabled, getVariant } = useFeatureFlags();
 *
 *   if (isFeatureEnabled('dark_mode')) {
 *     return <DarkModeUI />;
 *   }
 *
 *   const variant = getVariant('homepage_layout');
 *   if (variant === 'experimental') {
 *     return <ExperimentalLayout />;
 *   }
 *
 *   return <DefaultLayout />;
 * }
 * ```
 */
export function useFeatureFlags(): FeatureFlagContextValue {
  const context = useContext(FeatureFlagContext);

  if (!context) {
    throw new Error(
      "useFeatureFlags must be used within a FeatureFlagProvider"
    );
  }

  return context;
}
