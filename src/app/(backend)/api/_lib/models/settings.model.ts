/**
 * Settings Model
 * Handles site settings, hero settings, and theme settings
 */

import { getAdminDb } from '../database/admin';
import { NotFoundError } from '../middleware/error-handler';

const SETTINGS_COLLECTION = 'settings';
const SETTINGS_DOC_ID = 'site_settings';
const HERO_SETTINGS_DOC_ID = 'hero-settings';
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
   * Get hero settings
   */
  async getHeroSettings(): Promise<any> {
    const doc = await this.collection.doc(HERO_SETTINGS_DOC_ID).get();

    if (!doc.exists) {
      return {
        products: [],
        carousels: [],
      };
    }

    return doc.data();
  }

  /**
   * Update hero settings
   */
  async updateHeroSettings(type: 'products' | 'carousels', data: any, userId: string): Promise<any> {
    const updateData: any = {
      [type]: data,
      updatedAt: new Date().toISOString(),
      updatedBy: userId,
    };

    await this.collection.doc(HERO_SETTINGS_DOC_ID).set(updateData, { merge: true });

    return updateData;
  }

  /**
   * Modify hero settings item
   */
  async modifyHeroSettingsItem(
    type: 'products' | 'carousels',
    action: 'add' | 'update' | 'delete',
    item: any,
    itemId: string | null,
    userId: string
  ): Promise<any[]> {
    const doc = await this.collection.doc(HERO_SETTINGS_DOC_ID).get();
    const savedData = doc.exists ? doc.data() : null;
    const currentData = savedData || { products: [], carousels: [] };
    const items = currentData[type] || [];

    let updatedItems;

    if (action === 'add') {
      updatedItems = [...items, { ...item, id: item.id || `${type}_${Date.now()}` }];
    } else if (action === 'update' && itemId) {
      updatedItems = items.map((i: any) => (i.id === itemId ? { ...i, ...item } : i));
    } else if (action === 'delete' && itemId) {
      updatedItems = items.filter((i: any) => i.id !== itemId);
    } else {
      throw new Error('Invalid action');
    }

    const updateData: any = {
      [type]: updatedItems,
      updatedAt: new Date().toISOString(),
      updatedBy: userId,
    };

    await this.collection.doc(HERO_SETTINGS_DOC_ID).set(updateData, { merge: true });

    return updatedItems;
  }

  /**
   * Get hero slides
   */
  async getHeroSlides(): Promise<any[]> {
    const doc = await this.collection.doc('hero-slides').get();

    if (!doc.exists) {
      return this.getDefaultHeroSlides();
    }

    const data = doc.data();
    return data?.slides || [];
  }

  /**
   * Create hero slide
   */
  async createHeroSlide(slide: any): Promise<any> {
    const newSlide = {
      ...slide,
      id: slide.id || Date.now().toString(),
      createdAt: slide.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const doc = await this.collection.doc('hero-slides').get();
    const slides = doc.exists ? doc.data()?.slides || [] : [];
    
    slides.push(newSlide);

    await this.collection.doc('hero-slides').set({ slides }, { merge: true });

    return newSlide;
  }

  /**
   * Update hero slide
   */
  async updateHeroSlide(id: string, slide: any): Promise<any> {
    const doc = await this.collection.doc('hero-slides').get();
    
    if (!doc.exists) {
      throw new NotFoundError('Hero slides not found');
    }

    const slides = doc.data()?.slides || [];
    const index = slides.findIndex((s: any) => s.id === id);

    if (index === -1) {
      throw new NotFoundError('Hero slide not found');
    }

    const updatedSlide = {
      ...slides[index],
      ...slide,
      id,
      createdAt: slides[index].createdAt,
      updatedAt: new Date().toISOString(),
    };

    slides[index] = updatedSlide;

    await this.collection.doc('hero-slides').set({ slides }, { merge: true });

    return updatedSlide;
  }

  /**
   * Delete hero slide
   */
  async deleteHeroSlide(id: string): Promise<void> {
    const doc = await this.collection.doc('hero-slides').get();
    
    if (!doc.exists) {
      throw new NotFoundError('Hero slides not found');
    }

    const slides = doc.data()?.slides || [];
    const filteredSlides = slides.filter((s: any) => s.id !== id);

    if (slides.length === filteredSlides.length) {
      throw new NotFoundError('Hero slide not found');
    }

    await this.collection.doc('hero-slides').set({ slides: filteredSlides }, { merge: true });
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

  /**
   * Get default hero slides
   */
  private getDefaultHeroSlides(): any[] {
    return [
      {
        id: 'classic-plastic',
        title: 'Classic Plastic Generation',
        description: 'Discover the original Beyblades that started the legend',
        backgroundImage:
          'https://images.unsplash.com/photo-1534972195531-d756b9bfa9f2?auto=format&fit=crop&w=1920&q=80',
        backgroundColor: '#1a1a1a',
        theme: {
          primary: '#4A90E2',
          secondary: '#7BB3F0',
          accent: '#2E5BBA',
          gradient: 'linear-gradient(135deg, #4A90E2 0%, #7BB3F0 100%)',
          textPrimary: '#FFFFFF',
          textSecondary: '#E3F2FD',
          overlay: 'rgba(74, 144, 226, 0.15)',
          cardBackground: 'rgba(255, 255, 255, 0.95)',
          borderColor: 'rgba(74, 144, 226, 0.3)',
        },
        featuredProductIds: ['dragoon-gt', 'valkyrie-x', 'spriggan-burst'],
        isActive: true,
        displayOrder: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'metal-fight',
        title: 'Metal Fight Series',
        description: 'Experience the power of metal-based Beyblades',
        backgroundImage:
          'https://images.unsplash.com/photo-1518709268805-4e9042af2176?auto=format&fit=crop&w=1920&q=80',
        backgroundColor: '#1a1a1a',
        theme: {
          primary: '#757575',
          secondary: '#BDBDBD',
          accent: '#424242',
          gradient: 'linear-gradient(135deg, #757575 0%, #BDBDBD 100%)',
          textPrimary: '#FFFFFF',
          textSecondary: '#F5F5F5',
          overlay: 'rgba(117, 117, 117, 0.15)',
          cardBackground: 'rgba(255, 255, 255, 0.95)',
          borderColor: 'rgba(117, 117, 117, 0.3)',
        },
        featuredProductIds: ['storm-pegasus', 'rock-leone', 'flame-sagittario'],
        isActive: true,
        displayOrder: 2,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
  }
}

export const settingsModel = new SettingsModel();
