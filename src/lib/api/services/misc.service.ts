/**
 * Miscellaneous API Service (Frontend)
 * Handles standalone features: contact, search, payment, consent
 */

import { apiClient } from '../client';
import { API_ENDPOINTS } from '../constants/endpoints';
import type { ApiSuccessResponse } from '../responses';

/**
 * Contact Form Types
 */
export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  phone?: string;
  category?: 'general' | 'order' | 'product' | 'auction' | 'partnership' | 'feedback';
  orderNumber?: string;
}

export interface ContactSubmissionResponse {
  id: string;
  reference: string;
  estimatedResponse: string;
}

/**
 * Search Types
 */
export interface SearchFilters {
  query: string;
  type?: 'all' | 'products' | 'categories' | 'sellers';
  limit?: number;
  page?: number;
}

export interface SearchResult {
  products: any[];
  categories: any[];
  sellers: any[];
  total: number;
}

/**
 * Payment Types
 */
export interface RazorpayOrderData {
  amount: number;
  currency?: string;
}

export interface RazorpayOrderResponse {
  orderId: string;
  amount: number;
  currency: string;
  receipt: string;
}

export interface RazorpayVerificationData {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  orderId: string;
}

export interface PayPalOrderData {
  amount: number;
  currency?: string;
  orderId?: string;
}

export interface PayPalOrderResponse {
  id: string;
  links: Array<{ href: string; rel: string }>;
}

/**
 * Consent Types
 */
export interface CookieConsent {
  consentGiven: boolean;
  analyticsStorage: 'granted' | 'denied';
  marketingStorage?: 'granted' | 'denied';
  preferences?: {
    necessary: boolean;
    analytics: boolean;
    marketing: boolean;
  };
}

/**
 * Hero Banner Types
 */
export interface HeroBannerPreferences {
  lastViewedSlide: number;
  dismissedBanners: string[];
  viewCount: number;
}

/**
 * Miscellaneous Service
 * Groups standalone API features
 */
export class MiscService {
  /**
   * CONTACT FORM
   */
  
  /**
   * Submit contact form
   */
  async submitContactForm(data: ContactFormData): Promise<ContactSubmissionResponse> {
    const response = await apiClient.post<ApiSuccessResponse<ContactSubmissionResponse>>(
      API_ENDPOINTS.CONTACT,
      data
    );

    return response.data!;
  }

  /**
   * Get contact messages (admin only)
   */
  async getContactMessages(filters?: {
    status?: 'pending' | 'responded' | 'closed';
    page?: number;
    limit?: number;
  }): Promise<any> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const response = await apiClient.get<ApiSuccessResponse<any>>(
      `${API_ENDPOINTS.CONTACT}?${params.toString()}`
    );

    return response.data.data!;
  }

  /**
   * SEARCH
   */
  
  /**
   * Global search across products, categories, sellers
   */
  async search(filters: SearchFilters): Promise<SearchResult> {
    const params = new URLSearchParams();
    params.append('query', filters.query);
    if (filters.type) params.append('type', filters.type);
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.page) params.append('page', filters.page.toString());

    const response = await apiClient.get<ApiSuccessResponse<SearchResult>>(
      `${API_ENDPOINTS.SEARCH.GLOBAL}?${params.toString()}`
    );

    return response.data!;
  }

  /**
   * PAYMENT - RAZORPAY
   */
  
  /**
   * Create Razorpay order
   */
  async createRazorpayOrder(data: RazorpayOrderData): Promise<RazorpayOrderResponse> {
    const response = await apiClient.post<ApiSuccessResponse<RazorpayOrderResponse>>(
      API_ENDPOINTS.PAYMENT.RAZORPAY.CREATE_ORDER,
      data
    );

    return response.data!;
  }

  /**
   * Verify Razorpay payment
   */
  async verifyRazorpayPayment(data: RazorpayVerificationData): Promise<{ verified: boolean }> {
    const response = await apiClient.post<ApiSuccessResponse<{ verified: boolean }>>(
      API_ENDPOINTS.PAYMENT.RAZORPAY.VERIFY,
      data
    );

    return response.data!;
  }

  /**
   * PAYMENT - PAYPAL
   */
  
  /**
   * Create PayPal order
   */
  async createPayPalOrder(data: PayPalOrderData): Promise<PayPalOrderResponse> {
    const response = await apiClient.post<ApiSuccessResponse<PayPalOrderResponse>>(
      API_ENDPOINTS.PAYMENT.PAYPAL.CREATE_ORDER,
      data
    );

    return response.data!;
  }

  /**
   * Capture PayPal payment
   */
  async capturePayPalPayment(orderId: string): Promise<{ status: string }> {
    const response = await apiClient.post<ApiSuccessResponse<{ status: string }>>(
      API_ENDPOINTS.PAYMENT.PAYPAL.CAPTURE,
      { orderId }
    );

    return response.data!;
  }

  /**
   * CONSENT & COOKIES
   */
  
  /**
   * Get user's cookie consent
   */
  async getConsent(): Promise<CookieConsent> {
    const response = await apiClient.get<ApiSuccessResponse<CookieConsent>>(
      API_ENDPOINTS.CONSENT
    );

    return response.data.data!;
  }

  /**
   * Save user's cookie consent
   */
  async saveConsent(consent: CookieConsent): Promise<void> {
    await apiClient.post(API_ENDPOINTS.CONSENT, consent);
  }

  /**
   * Delete user's consent
   */
  async deleteConsent(): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.CONSENT);
  }

  /**
   * Get cookie information
   */
  async getCookieInfo(): Promise<any> {
    const response = await apiClient.get<ApiSuccessResponse<any>>(
      API_ENDPOINTS.COOKIES
    );

    return response.data.data!;
  }

  /**
   * HERO BANNER
   */
  
  /**
   * Get hero banner preferences
   */
  async getHeroBannerPreferences(): Promise<HeroBannerPreferences> {
    const response = await apiClient.get<ApiSuccessResponse<HeroBannerPreferences>>(
      API_ENDPOINTS.HERO_BANNER
    );

    return response.data.data!;
  }

  /**
   * Update hero banner preferences
   */
  async updateHeroBannerPreferences(preferences: Partial<HeroBannerPreferences>): Promise<void> {
    await apiClient.patch(API_ENDPOINTS.HERO_BANNER, preferences);
  }

  /**
   * Reset hero banner preferences
   */
  async resetHeroBannerPreferences(): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.HERO_BANNER);
  }

  /**
   * HEALTH & ERRORS
   */
  
  /**
   * Check API health
   */
  async checkHealth(): Promise<{ status: string; timestamp: string }> {
    const response = await apiClient.get<ApiSuccessResponse<any>>(
      API_ENDPOINTS.HEALTH
    );

    return response.data.data!;
  }

  /**
   * Log client-side error
   */
  async logError(error: {
    message: string;
    stack?: string;
    url?: string;
    userAgent?: string;
  }): Promise<void> {
    await apiClient.post(API_ENDPOINTS.ERRORS, {
      ...error,
      timestamp: new Date().toISOString(),
    });
  }
}

// Export singleton instance
export const miscService = new MiscService();
