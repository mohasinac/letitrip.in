/**
 * Device Management Service
 *
 * Manages user devices for security and session management.
 * Tracks devices used to access accounts and allows users to revoke access.
 */

import { db } from "@/lib/firebase-client";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import { z } from "zod";

// ============================================================================
// Types
// ============================================================================

export interface DeviceInfo {
  deviceId: string;
  userId: string;
  deviceName: string;
  deviceType: "desktop" | "mobile" | "tablet" | "unknown";
  browser?: string;
  browserVersion?: string;
  os?: string;
  osVersion?: string;
  ipAddress?: string;
  location?: string;
  isTrusted: boolean;
  lastActiveAt: Date;
  createdAt: Date;
  userAgent?: string;
}

export interface AddDeviceRequest {
  userId: string;
  deviceName?: string;
  userAgent?: string;
  ipAddress?: string;
  location?: string;
  isTrusted?: boolean;
}

export interface UpdateDeviceRequest {
  deviceId: string;
  userId: string;
  deviceName?: string;
  isTrusted?: boolean;
}

export interface RevokeDeviceRequest {
  deviceId: string;
  userId: string;
}

// ============================================================================
// Validation Schemas
// ============================================================================

const AddDeviceSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  deviceName: z.string().optional(),
  userAgent: z.string().optional(),
  ipAddress: z.string().optional(),
  location: z.string().optional(),
  isTrusted: z.boolean().optional(),
});

const UpdateDeviceSchema = z.object({
  deviceId: z.string().min(1, "Device ID is required"),
  userId: z.string().min(1, "User ID is required"),
  deviceName: z.string().optional(),
  isTrusted: z.boolean().optional(),
});

const RevokeDeviceSchema = z.object({
  deviceId: z.string().min(1, "Device ID is required"),
  userId: z.string().min(1, "User ID is required"),
});

// ============================================================================
// Error Classes
// ============================================================================

export class DeviceError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = "DeviceError";
  }
}

export class DeviceValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DeviceValidationError";
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Parse user agent string to extract device information
 */
function parseUserAgent(userAgent?: string): {
  deviceType: DeviceInfo["deviceType"];
  browser?: string;
  browserVersion?: string;
  os?: string;
  osVersion?: string;
} {
  if (!userAgent) {
    return { deviceType: "unknown" };
  }

  const ua = userAgent.toLowerCase();
  let deviceType: DeviceInfo["deviceType"] = "unknown";
  let browser: string | undefined;
  let browserVersion: string | undefined;
  let os: string | undefined;
  let osVersion: string | undefined;

  // Detect device type
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    deviceType = "tablet";
  } else if (
    /mobile|iphone|ipod|blackberry|opera mini|iemobile|wpdesktop/i.test(ua)
  ) {
    deviceType = "mobile";
  } else {
    deviceType = "desktop";
  }

  // Detect browser
  if (ua.includes("firefox")) {
    browser = "Firefox";
    const match = ua.match(/firefox\/([0-9.]+)/);
    browserVersion = match ? match[1] : undefined;
  } else if (ua.includes("edg")) {
    browser = "Edge";
    const match = ua.match(/edg\/([0-9.]+)/);
    browserVersion = match ? match[1] : undefined;
  } else if (ua.includes("chrome")) {
    browser = "Chrome";
    const match = ua.match(/chrome\/([0-9.]+)/);
    browserVersion = match ? match[1] : undefined;
  } else if (ua.includes("safari")) {
    browser = "Safari";
    const match = ua.match(/version\/([0-9.]+)/);
    browserVersion = match ? match[1] : undefined;
  } else if (ua.includes("msie") || ua.includes("trident")) {
    browser = "Internet Explorer";
    const match = ua.match(/(?:msie |rv:)([0-9.]+)/);
    browserVersion = match ? match[1] : undefined;
  }

  // Detect OS
  if (ua.includes("win")) {
    os = "Windows";
    if (ua.includes("windows nt 10")) osVersion = "10";
    else if (ua.includes("windows nt 6.3")) osVersion = "8.1";
    else if (ua.includes("windows nt 6.2")) osVersion = "8";
    else if (ua.includes("windows nt 6.1")) osVersion = "7";
  } else if (ua.includes("mac")) {
    os = "macOS";
    const match = ua.match(/mac os x ([0-9._]+)/);
    osVersion = match ? match[1].replace(/_/g, ".") : undefined;
  } else if (ua.includes("linux")) {
    os = "Linux";
  } else if (ua.includes("android")) {
    os = "Android";
    const match = ua.match(/android ([0-9.]+)/);
    osVersion = match ? match[1] : undefined;
  } else if (ua.includes("iphone") || ua.includes("ipad")) {
    os = "iOS";
    const match = ua.match(/os ([0-9._]+)/);
    osVersion = match ? match[1].replace(/_/g, ".") : undefined;
  }

  return { deviceType, browser, browserVersion, os, osVersion };
}

/**
 * Generate device name from device info
 */
function generateDeviceName(
  deviceType: DeviceInfo["deviceType"],
  browser?: string,
  os?: string
): string {
  const parts = [];

  if (os) parts.push(os);
  if (browser) parts.push(browser);
  if (deviceType !== "unknown") {
    parts.push(deviceType.charAt(0).toUpperCase() + deviceType.slice(1));
  }

  return parts.length > 0 ? parts.join(" - ") : "Unknown Device";
}

/**
 * Convert Firestore document to DeviceInfo
 */
function convertToDeviceInfo(doc: any): DeviceInfo {
  const data = doc.data();
  return {
    deviceId: doc.id,
    userId: data.userId,
    deviceName: data.deviceName,
    deviceType: data.deviceType,
    browser: data.browser,
    browserVersion: data.browserVersion,
    os: data.os,
    osVersion: data.osVersion,
    ipAddress: data.ipAddress,
    location: data.location,
    isTrusted: data.isTrusted ?? false,
    lastActiveAt: data.lastActiveAt?.toDate() ?? new Date(),
    createdAt: data.createdAt?.toDate() ?? new Date(),
    userAgent: data.userAgent,
  };
}

// ============================================================================
// Device Service
// ============================================================================

class DeviceService {
  private collectionName = "devices";

  /**
   * Add a new device
   */
  async addDevice(request: AddDeviceRequest): Promise<DeviceInfo> {
    // Validate request
    const validated = AddDeviceSchema.parse(request);

    try {
      // Parse user agent
      const parsedUA = parseUserAgent(validated.userAgent);

      // Generate device name if not provided
      const deviceName =
        validated.deviceName ||
        generateDeviceName(parsedUA.deviceType, parsedUA.browser, parsedUA.os);

      // Generate device ID from user agent + timestamp
      const deviceId = await this.generateDeviceId(
        validated.userId,
        validated.userAgent
      );

      // Check if device already exists
      const existingDevice = await this.getDevice(deviceId, validated.userId);
      if (existingDevice) {
        // Update last active timestamp
        await this.updateLastActive(deviceId, validated.userId);
        return existingDevice;
      }

      // Create device document
      const deviceRef = doc(db, this.collectionName, deviceId);
      const now = serverTimestamp();

      const deviceData = {
        userId: validated.userId,
        deviceName,
        deviceType: parsedUA.deviceType,
        browser: parsedUA.browser,
        browserVersion: parsedUA.browserVersion,
        os: parsedUA.os,
        osVersion: parsedUA.osVersion,
        ipAddress: validated.ipAddress,
        location: validated.location,
        userAgent: validated.userAgent,
        isTrusted: validated.isTrusted ?? false,
        lastActiveAt: now,
        createdAt: now,
      };

      await setDoc(deviceRef, deviceData);

      // Get the created device
      const deviceDoc = await getDoc(deviceRef);
      return convertToDeviceInfo(deviceDoc);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new DeviceValidationError(error.errors[0].message);
      }
      throw new DeviceError(
        error instanceof Error ? error.message : "Failed to add device",
        "DEVICE_ADD_FAILED"
      );
    }
  }

  /**
   * Get a device by ID
   */
  async getDevice(
    deviceId: string,
    userId: string
  ): Promise<DeviceInfo | null> {
    try {
      const deviceRef = doc(db, this.collectionName, deviceId);
      const deviceDoc = await getDoc(deviceRef);

      if (!deviceDoc.exists()) {
        return null;
      }

      const device = convertToDeviceInfo(deviceDoc);

      // Verify the device belongs to the user
      if (device.userId !== userId) {
        throw new DeviceError("Device not found", "DEVICE_NOT_FOUND");
      }

      return device;
    } catch (error) {
      if (error instanceof DeviceError) {
        throw error;
      }
      throw new DeviceError(
        error instanceof Error ? error.message : "Failed to get device",
        "DEVICE_GET_FAILED"
      );
    }
  }

  /**
   * List all devices for a user
   */
  async listDevices(userId: string): Promise<DeviceInfo[]> {
    try {
      const devicesRef = collection(db, this.collectionName);
      const q = query(
        devicesRef,
        where("userId", "==", userId),
        orderBy("lastActiveAt", "desc")
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(convertToDeviceInfo);
    } catch (error) {
      throw new DeviceError(
        error instanceof Error ? error.message : "Failed to list devices",
        "DEVICE_LIST_FAILED"
      );
    }
  }

  /**
   * Update device information
   */
  async updateDevice(request: UpdateDeviceRequest): Promise<DeviceInfo> {
    // Validate request
    const validated = UpdateDeviceSchema.parse(request);

    try {
      const deviceRef = doc(db, this.collectionName, validated.deviceId);
      const deviceDoc = await getDoc(deviceRef);

      if (!deviceDoc.exists()) {
        throw new DeviceError("Device not found", "DEVICE_NOT_FOUND");
      }

      const device = convertToDeviceInfo(deviceDoc);

      // Verify the device belongs to the user
      if (device.userId !== validated.userId) {
        throw new DeviceError("Device not found", "DEVICE_NOT_FOUND");
      }

      // Update device
      const updateData: any = {
        lastActiveAt: serverTimestamp(),
      };

      if (validated.deviceName !== undefined) {
        updateData.deviceName = validated.deviceName;
      }

      if (validated.isTrusted !== undefined) {
        updateData.isTrusted = validated.isTrusted;
      }

      await setDoc(deviceRef, updateData, { merge: true });

      // Get updated device
      const updatedDoc = await getDoc(deviceRef);
      return convertToDeviceInfo(updatedDoc);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new DeviceValidationError(error.errors[0].message);
      }
      if (error instanceof DeviceError) {
        throw error;
      }
      throw new DeviceError(
        error instanceof Error ? error.message : "Failed to update device",
        "DEVICE_UPDATE_FAILED"
      );
    }
  }

  /**
   * Revoke a device (delete it)
   */
  async revokeDevice(request: RevokeDeviceRequest): Promise<void> {
    // Validate request
    const validated = RevokeDeviceSchema.parse(request);

    try {
      const deviceRef = doc(db, this.collectionName, validated.deviceId);
      const deviceDoc = await getDoc(deviceRef);

      if (!deviceDoc.exists()) {
        throw new DeviceError("Device not found", "DEVICE_NOT_FOUND");
      }

      const device = convertToDeviceInfo(deviceDoc);

      // Verify the device belongs to the user
      if (device.userId !== validated.userId) {
        throw new DeviceError("Device not found", "DEVICE_NOT_FOUND");
      }

      // Delete device
      await deleteDoc(deviceRef);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new DeviceValidationError(error.errors[0].message);
      }
      if (error instanceof DeviceError) {
        throw error;
      }
      throw new DeviceError(
        error instanceof Error ? error.message : "Failed to revoke device",
        "DEVICE_REVOKE_FAILED"
      );
    }
  }

  /**
   * Update last active timestamp
   */
  async updateLastActive(deviceId: string, userId: string): Promise<void> {
    try {
      const deviceRef = doc(db, this.collectionName, deviceId);
      const deviceDoc = await getDoc(deviceRef);

      if (!deviceDoc.exists()) {
        return; // Device doesn't exist, ignore
      }

      const device = convertToDeviceInfo(deviceDoc);

      // Verify the device belongs to the user
      if (device.userId !== userId) {
        return; // Not user's device, ignore
      }

      // Update last active
      await setDoc(
        deviceRef,
        {
          lastActiveAt: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (error) {
      // Silently fail - this is not critical
      console.error("Failed to update last active:", error);
    }
  }

  /**
   * Get trusted devices for a user
   */
  async getTrustedDevices(userId: string): Promise<DeviceInfo[]> {
    try {
      const devicesRef = collection(db, this.collectionName);
      const q = query(
        devicesRef,
        where("userId", "==", userId),
        where("isTrusted", "==", true),
        orderBy("lastActiveAt", "desc")
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(convertToDeviceInfo);
    } catch (error) {
      throw new DeviceError(
        error instanceof Error
          ? error.message
          : "Failed to get trusted devices",
        "DEVICE_LIST_FAILED"
      );
    }
  }

  /**
   * Revoke all devices except current
   */
  async revokeAllExcept(
    userId: string,
    currentDeviceId: string
  ): Promise<number> {
    try {
      const devices = await this.listDevices(userId);
      const devicesToRevoke = devices.filter(
        (d) => d.deviceId !== currentDeviceId
      );

      let revokedCount = 0;
      for (const device of devicesToRevoke) {
        try {
          await this.revokeDevice({
            deviceId: device.deviceId,
            userId,
          });
          revokedCount++;
        } catch (error) {
          console.error(`Failed to revoke device ${device.deviceId}:`, error);
        }
      }

      return revokedCount;
    } catch (error) {
      throw new DeviceError(
        error instanceof Error ? error.message : "Failed to revoke all devices",
        "DEVICE_REVOKE_ALL_FAILED"
      );
    }
  }

  /**
   * Generate consistent device ID
   */
  private async generateDeviceId(
    userId: string,
    userAgent?: string
  ): Promise<string> {
    // Simple hash function for generating device ID
    const str = `${userId}-${userAgent || "unknown"}`;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return `device_${Math.abs(hash).toString(36)}`;
  }
}

// Export singleton instance
export const deviceService = new DeviceService();
export default deviceService;
