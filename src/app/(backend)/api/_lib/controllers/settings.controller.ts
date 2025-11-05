/**
 * Settings Controller
 * Handles business logic for settings operations
 */

import { settingsModel } from '../models/settings.model';
import { AuthorizationError, ValidationError } from '../middleware/error-handler';

interface UserContext {
  uid: string;
  role: 'user' | 'seller' | 'admin';
  email?: string;
}

class SettingsController {
  /**
   * Get site settings (public)
   */
  async getSiteSettings(): Promise<any> {
    return await settingsModel.getSiteSettings();
  }

  /**
   * Update site settings (admin only)
   */
  async updateSiteSettings(section: string, data: any, user: UserContext): Promise<void> {
    // RBAC check
    if (user.role !== 'admin') {
      throw new AuthorizationError('Admin access required');
    }

    if (!section || !data) {
      throw new ValidationError('Section and data are required');
    }

    await settingsModel.updateSiteSettings(section, data);
  }

  /**
   * Partial update site settings (admin only)
   */
  async patchSiteSettings(data: any, user: UserContext): Promise<void> {
    // RBAC check
    if (user.role !== 'admin') {
      throw new AuthorizationError('Admin access required');
    }

    await settingsModel.patchSiteSettings(data);
  }

  /**
   * Get theme settings (public)
   */
  async getThemeSettings(): Promise<any> {
    return await settingsModel.getThemeSettings();
  }

  /**
   * Update theme settings (admin only)
   */
  async updateThemeSettings(data: any, user: UserContext): Promise<any> {
    // RBAC check
    if (user.role !== 'admin') {
      throw new AuthorizationError('Admin access required');
    }

    return await settingsModel.updateThemeSettings(data);
  }
}

export const settingsController = new SettingsController();
