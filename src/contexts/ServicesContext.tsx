/**
 * Services Context - Dependency Injection
 * Provides services throughout the application
 */

"use client";

import { logError as firebaseLogError } from "@/lib/firebase-error-logger";
import { services, type Services } from "@/lib/services/factory";
import { ErrorLogger, LoggerAdapter } from "@letitrip/react-library";
import { createContext, useContext, type ReactNode } from "react";

/**
 * Firebase Logger Adapter for ErrorLogger
 */
class FirebaseLoggerAdapter implements LoggerAdapter {
  async log(
    error: Error | string,
    context: Record<string, any>,
    severity: string
  ): Promise<void> {
    await firebaseLogError(error, context, severity as any);
  }
}

// Register Firebase as a logger adapter
ErrorLogger.registerAdapter(new FirebaseLoggerAdapter());

// Create context
const ServicesContext = createContext<Services | null>(null);

/**
 * Services Provider Props
 */
export interface ServicesProviderProps {
  children: ReactNode;
  services?: Partial<Services>;
}

/**
 * Services Provider Component
 * Wraps the app to provide services via context
 */
export function ServicesProvider({
  children,
  services: customServices,
}: ServicesProviderProps) {
  const value = {
    ...services,
    ...customServices,
  } as Services;

  return (
    <ServicesContext.Provider value={value}>
      {children}
    </ServicesContext.Provider>
  );
}

/**
 * Hook to access services
 * @throws Error if used outside ServicesProvider
 */
export function useServices(): Services {
  const context = useContext(ServicesContext);

  if (!context) {
    throw new Error("useServices must be used within ServicesProvider");
  }

  return context;
}

/**
 * Hook to access upload service
 */
export function useUploadService(
  type: "api" | "storage" | "default" = "default"
) {
  const { upload } = useServices();

  return upload[type];
}

/**
 * Hook to access database adapter
 */
export function useDatabaseAdapter() {
  const { database } = useServices();

  return database;
}

/**
 * Hook to access storage adapter
 */
export function useStorageAdapter() {
  const { storage } = useServices();

  return storage;
}

/**
 * Hook to access auth adapter
 */
export function useAuthAdapter() {
  const { auth } = useServices();

  return auth;
}

/**
 * Hook to access service config
 */
export function useServiceConfig() {
  const { config } = useServices();

  return config;
}

/**
 * Example usage:
 *
 * ```tsx
 * // In app layout or root:
 * import { ServicesProvider } from '@/contexts/ServicesContext';
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <ServicesProvider>
 *       {children}
 *     </ServicesProvider>
 *   );
 * }
 *
 * // In components:
 * import { useUploadService } from '@/contexts/ServicesContext';
 * import { ImageUploadWithCrop } from '@letitrip/react-library';
 *
 * function ProductForm() {
 *   const uploadService = useUploadService('api');
 *
 *   return (
 *     <ImageUploadWithCrop
 *       uploadService={uploadService}
 *       onUploadComplete={(data) => console.log(data.url)}
 *     />
 *   );
 * }
 * ```
 */
