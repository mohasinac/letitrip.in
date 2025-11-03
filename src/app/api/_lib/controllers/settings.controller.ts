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
   * Get hero settings (admin only)
   */
  async getHeroSettings(user: UserContext): Promise<any> {
    // RBAC check
    if (user.role !== 'admin') {
      throw new AuthorizationError('Admin access required');
    }

    return await settingsModel.getHeroSettings();
  }

  /**
   * Update hero settings (admin only)
   */
  async updateHeroSettings(
    type: 'products' | 'carousels',
    data: any,
    user: UserContext
  ): Promise<any> {
    // RBAC check
    if (user.role !== 'admin') {
      throw new AuthorizationError('Admin access required');
    }

    if (!type || !data) {
      throw new ValidationError('Type and data are required');
    }

    if (type !== 'products' && type !== 'carousels') {
      throw new ValidationError('Invalid type');
    }

    return await settingsModel.updateHeroSettings(type, data, user.uid);
  }

  /**
   * Modify hero settings item (admin only)
   */
  async modifyHeroSettingsItem(
    type: 'products' | 'carousels',
    action: 'add' | 'update' | 'delete',
    item: any,
    itemId: string | null,
    user: UserContext
  ): Promise<any[]> {
    // RBAC check
    if (user.role !== 'admin') {
      throw new AuthorizationError('Admin access required');
    }

    if (!type || !action) {
      throw new ValidationError('Type and action are required');
    }

    return await settingsModel.modifyHeroSettingsItem(type, action, item, itemId, user.uid);
  }

  /**
   * Get hero slides (public)
   */
  async getHeroSlides(): Promise<any[]> {
    const slides = await settingsModel.getHeroSlides();
    
    // Filter active slides and sort by display order
    return slides
      .filter((slide: any) => slide.isActive)
      .sort((a: any, b: any) => a.displayOrder - b.displayOrder);
  }

  /**
   * Get all hero slides (admin only)
   */
  async getAllHeroSlides(user: UserContext): Promise<any[]> {
    // RBAC check
    if (user.role !== 'admin') {
      throw new AuthorizationError('Admin access required');
    }

    return await settingsModel.getHeroSlides();
  }

  /**
   * Create hero slide (admin only)
   */
  async createHeroSlide(slide: any, user: UserContext): Promise<any> {
    // RBAC check
    if (user.role !== 'admin') {
      throw new AuthorizationError('Admin access required');
    }

    return await settingsModel.createHeroSlide(slide);
  }

  /**
   * Update hero slide (admin only)
   */
  async updateHeroSlide(id: string, slide: any, user: UserContext): Promise<any> {
    // RBAC check
    if (user.role !== 'admin') {
      throw new AuthorizationError('Admin access required');
    }

    return await settingsModel.updateHeroSlide(id, slide);
  }

  /**
   * Delete hero slide (admin only)
   */
  async deleteHeroSlide(id: string, user: UserContext): Promise<void> {
    // RBAC check
    if (user.role !== 'admin') {
      throw new AuthorizationError('Admin access required');
    }

    await settingsModel.deleteHeroSlide(id);
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
