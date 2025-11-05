/**
 * Settings Model
 * Handles site settings, hero settings, and theme settings
 */

import { getAdminDb } from '../database/admin';
import { NotFoundError } from '../middleware/error-handler';

const SETTINGS_COLLECTION = 'settings';
const SETTINGS_DOC_ID = 'site_settings';
const THEME_SETTINGS_DOC_ID = 'theme-settings';

export class SettingsModel {
  private collection = getAdminDb().collection(SETTINGS_COLLECTION);

  /**
   * Get site settings
   */
  async getSiteSettings(): Promise<any> {
    const doc = await this.collection.doc(SETTINGS_DOC_ID).get();
    
    if (!doc.exists) {
      return this.getDefaultSiteSettings();
    }

    return doc.data();
  }

  /**
   * Update site settings
   */
  async updateSiteSettings(section: string, data: any): Promise<void> {
    const updateData: any = {
      [section]: data,
      updatedAt: new Date().toISOString(),
    };

    await this.collection.doc(SETTINGS_DOC_ID).set(updateData, { merge: true });
  }

  /**
   * Partial update site settings
   */
  async patchSiteSettings(data: any): Promise<void> {
    const updateData = {
      ...data,
      updatedAt: new Date().toISOString(),
    };

    await this.collection.doc(SETTINGS_DOC_ID).set(updateData, { merge: true });
  }

  /**
   * Get theme settings
   */
  async getThemeSettings(): Promise<any> {
    const doc = await this.collection.doc(THEME_SETTINGS_DOC_ID).get();

    if (!doc.exists) {
      return {
        id: 'default',
        themeName: 'default',
        mode: 'light',
        updatedAt: new Date().toISOString(),
      };
    }

    return doc.data();
  }

  /**
   * Update theme settings
   */
  async updateThemeSettings(data: any): Promise<any> {
    const themeSettings = {
      ...data,
      updatedAt: new Date().toISOString(),
    };

    await this.collection.doc(THEME_SETTINGS_DOC_ID).set(themeSettings, { merge: true });

    return themeSettings;
  }

  /**
   * Get default site settings
   */
  private getDefaultSiteSettings(): any {
    return {
      general: {
        siteName: 'JustForView',
        siteDescription: 'Your trusted online marketplace',
        siteUrl: 'https://justforview.in',
        contactEmail: 'contact@justforview.in',
        supportEmail: 'support@justforview.in',
        phoneNumber: '+91 9876543210',
        address: '',
        timezone: 'Asia/Kolkata',
        currency: 'INR',
        language: 'en',
      },
      email: {
        smtpHost: '',
        smtpPort: 587,
        smtpUser: '',
        smtpPassword: '',
        fromEmail: 'noreply@justforview.in',
        fromName: 'JustForView',
        templates: {
          orderConfirmation: { subject: 'Order Confirmation - {{orderNumber}}', enabled: true },
          orderShipped: { subject: 'Your Order Has Been Shipped - {{orderNumber}}', enabled: true },
          orderDelivered: { subject: 'Your Order Has Been Delivered - {{orderNumber}}', enabled: true },
          passwordReset: { subject: 'Reset Your Password', enabled: true },
          welcomeEmail: { subject: 'Welcome to {{siteName}}', enabled: true },
        },
      },
      payment: {
        razorpay: { enabled: false, keyId: '', keySecret: '', webhookSecret: '' },
        stripe: { enabled: false, publishableKey: '', secretKey: '', webhookSecret: '' },
        paypal: { enabled: false, clientId: '', clientSecret: '', mode: 'sandbox' },
        cod: { enabled: true, maxAmount: 10000, instructions: 'Pay cash upon delivery of your order.' },
      },
      shipping: {
        freeShippingThreshold: 500,
        standardShippingCost: 50,
        expressShippingCost: 100,
        internationalShipping: false,
        estimatedDeliveryDays: { domestic: 5, international: 15 },
        shiprocket: { enabled: false, email: '', password: '', channelId: '' },
      },
      tax: {
        gstEnabled: true,
        gstNumber: '',
        gstPercentage: 18,
        internationalTaxEnabled: false,
        internationalTaxPercentage: 0,
      },
      features: {
        reviews: true,
        wishlist: true,
        compareProducts: true,
        socialLogin: false,
        guestCheckout: true,
        multiVendor: true,
        chatSupport: false,
        newsletter: true,
      },
      maintenance: {
        enabled: false,
        message: "We're currently performing scheduled maintenance. We'll be back shortly!",
        allowedIPs: [],
      },
      seo: {
        metaTitle: 'JustForView - Your Trusted Online Marketplace',
        metaDescription: 'Shop the latest products at competitive prices',
        metaKeywords: 'ecommerce, online shopping, marketplace',
        googleAnalyticsId: '',
        facebookPixelId: '',
        googleTagManagerId: '',
      },
      social: {
        facebook: '',
        twitter: '',
        instagram: '',
        linkedin: '',
        youtube: '',
        whatsapp: '',
      },
      updatedAt: new Date().toISOString(),
    };
  }
}

export const settingsModel = new SettingsModel();
