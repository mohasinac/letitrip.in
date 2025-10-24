/**
 * Shiprocket Shipping Service
 */

import axios, { AxiosInstance } from 'axios';
import { SHIPROCKET_CONFIG, validateShiprocketConfig } from '@/lib/config/shipping';
import type { 
  ShiprocketOrderRequest, 
  ShiprocketServiceabilityRequest, 
  ShiprocketRateCalculation 
} from '@/types';

// Validate configuration on module load
validateShiprocketConfig();

class ShiprocketService {
  private api: AxiosInstance;
  private token: string | null = null;
  private tokenExpiry: number = 0;

  constructor() {
    this.api = axios.create({
      baseURL: SHIPROCKET_CONFIG.BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Authenticate and get access token
   */
  private async authenticate(): Promise<string> {
    try {
      // Check if token is still valid
      if (this.token && Date.now() < this.tokenExpiry) {
        return this.token as string;
      }

      const response = await this.api.post(SHIPROCKET_CONFIG.ENDPOINTS.AUTH, {
        email: SHIPROCKET_CONFIG.EMAIL,
        password: SHIPROCKET_CONFIG.PASSWORD,
      });

      if (response.data.token) {
        this.token = response.data.token;
        // Token typically expires in 24 hours
        this.tokenExpiry = Date.now() + (23 * 60 * 60 * 1000);
        return this.token!;
      }

      throw new Error('No token received from Shiprocket');
    } catch (error) {
      console.error('Shiprocket authentication error:', error);
      throw new Error('Failed to authenticate with Shiprocket');
    }
  }

  /**
   * Make authenticated API request
   */
  private async apiRequest(method: 'GET' | 'POST' | 'PUT' | 'DELETE', endpoint: string, data?: any) {
    const token = await this.authenticate();
    
    const config = {
      method,
      url: endpoint,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      data,
    };

    try {
      const response = await this.api.request(config);
      return response.data;
    } catch (error: any) {
      console.error(`Shiprocket API error (${method} ${endpoint}):`, error.response?.data || error.message);
      throw new Error(`Shiprocket API request failed: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Check serviceability for a pincode
   */
  async checkServiceability(params: ShiprocketServiceabilityRequest): Promise<any> {
    try {
      const queryParams = new URLSearchParams({
        pickup_postcode: params.pickup_postcode,
        delivery_postcode: params.delivery_postcode,
        weight: params.weight.toString(),
        cod: params.cod.toString(),
      });

      return await this.apiRequest('GET', `${SHIPROCKET_CONFIG.ENDPOINTS.SERVICEABILITY}?${queryParams}`);
    } catch (error) {
      console.error('Shiprocket serviceability check error:', error);
      throw new Error('Failed to check serviceability');
    }
  }

  /**
   * Calculate shipping rates
   */
  async calculateRates(params: {
    pickup_postcode: string;
    delivery_postcode: string;
    weight: number;
    cod: 0 | 1;
    declared_value: number;
  }): Promise<ShiprocketRateCalculation[]> {
    try {
      const response = await this.apiRequest('GET', SHIPROCKET_CONFIG.ENDPOINTS.RATE_CALCULATOR, params);
      return response.data || [];
    } catch (error) {
      console.error('Shiprocket rate calculation error:', error);
      throw new Error('Failed to calculate shipping rates');
    }
  }

  /**
   * Create shipping order
   */
  async createOrder(orderData: ShiprocketOrderRequest): Promise<any> {
    try {
      // Validate required fields
      this.validateOrderData(orderData);

      const response = await this.apiRequest('POST', SHIPROCKET_CONFIG.ENDPOINTS.CREATE_ORDER, orderData);
      return response;
    } catch (error) {
      console.error('Shiprocket create order error:', error);
      throw new Error('Failed to create shipping order');
    }
  }

  /**
   * Track shipment
   */
  async trackShipment(awbCode: string): Promise<any> {
    try {
      return await this.apiRequest('GET', `${SHIPROCKET_CONFIG.ENDPOINTS.TRACK_ORDER}/${awbCode}`);
    } catch (error) {
      console.error('Shiprocket track shipment error:', error);
      throw new Error('Failed to track shipment');
    }
  }

  /**
   * Cancel order
   */
  async cancelOrder(orderId: string): Promise<any> {
    try {
      return await this.apiRequest('POST', SHIPROCKET_CONFIG.ENDPOINTS.CANCEL_ORDER, {
        ids: [orderId]
      });
    } catch (error) {
      console.error('Shiprocket cancel order error:', error);
      throw new Error('Failed to cancel order');
    }
  }

  /**
   * Get pickup locations
   */
  async getPickupLocations(): Promise<any> {
    try {
      return await this.apiRequest('GET', SHIPROCKET_CONFIG.ENDPOINTS.PICKUP_LOCATIONS);
    } catch (error) {
      console.error('Shiprocket get pickup locations error:', error);
      throw new Error('Failed to get pickup locations');
    }
  }

  /**
   * Get courier partners
   */
  async getCourierPartners(): Promise<any> {
    try {
      return await this.apiRequest('GET', SHIPROCKET_CONFIG.ENDPOINTS.COURIER_PARTNERS);
    } catch (error) {
      console.error('Shiprocket get courier partners error:', error);
      throw new Error('Failed to get courier partners');
    }
  }

  /**
   * Validate order data before submission
   */
  private validateOrderData(orderData: ShiprocketOrderRequest): void {
    const required = [
      'order_id',
      'order_date',
      'billing_customer_name',
      'billing_address',
      'billing_city',
      'billing_pincode',
      'billing_state',
      'billing_country',
      'billing_email',
      'billing_phone',
      'order_items',
      'payment_method',
      'sub_total',
    ];

    for (const field of required) {
      if (!orderData[field as keyof ShiprocketOrderRequest]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Validate order items
    if (!Array.isArray(orderData.order_items) || orderData.order_items.length === 0) {
      throw new Error('Order must have at least one item');
    }

    // Validate pincode format
    const pincodeRegex = /^\d{6}$/;
    if (!pincodeRegex.test(orderData.billing_pincode)) {
      throw new Error('Invalid billing pincode format');
    }

    if (!orderData.shipping_is_billing && orderData.shipping_pincode && !pincodeRegex.test(orderData.shipping_pincode)) {
      throw new Error('Invalid shipping pincode format');
    }

    // Validate phone number
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(orderData.billing_phone.replace(/[^\d]/g, '').slice(-10))) {
      throw new Error('Invalid phone number format');
    }

    // Validate weight and dimensions
    if (orderData.weight < SHIPROCKET_CONFIG.MIN_WEIGHT) {
      throw new Error(`Weight must be at least ${SHIPROCKET_CONFIG.MIN_WEIGHT} kg`);
    }
  }

  /**
   * Format order data for Shiprocket API
   */
  formatOrderData(params: {
    orderId: string;
    orderDate: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    billingAddress: any;
    shippingAddress?: any;
    items: any[];
    paymentMethod: 'Prepaid' | 'COD';
    subtotal: number;
    shippingCharges: number;
    totalDiscount?: number;
    weight: number;
    dimensions?: { length: number; breadth: number; height: number };
  }): ShiprocketOrderRequest {
    const { billingAddress, shippingAddress } = params;
    const useShippingAddress = shippingAddress && shippingAddress.id !== billingAddress.id;

    return {
      order_id: params.orderId,
      order_date: params.orderDate,
      pickup_location: SHIPROCKET_CONFIG.DEFAULT_PICKUP_LOCATION,
      billing_customer_name: billingAddress.name.split(' ')[0] || params.customerName.split(' ')[0],
      billing_last_name: billingAddress.name.split(' ').slice(1).join(' ') || params.customerName.split(' ').slice(1).join(' '),
      billing_address: `${billingAddress.addressLine1}, ${billingAddress.addressLine2 || ''}`.trim(),
      billing_city: billingAddress.city,
      billing_pincode: billingAddress.pincode,
      billing_state: billingAddress.state,
      billing_country: billingAddress.country,
      billing_email: params.customerEmail,
      billing_phone: billingAddress.phone || params.customerPhone,
      shipping_is_billing: !useShippingAddress,
      shipping_customer_name: useShippingAddress ? shippingAddress.name.split(' ')[0] : undefined,
      shipping_last_name: useShippingAddress ? shippingAddress.name.split(' ').slice(1).join(' ') : undefined,
      shipping_address: useShippingAddress ? `${shippingAddress.addressLine1}, ${shippingAddress.addressLine2 || ''}`.trim() : undefined,
      shipping_city: useShippingAddress ? shippingAddress.city : undefined,
      shipping_pincode: useShippingAddress ? shippingAddress.pincode : undefined,
      shipping_state: useShippingAddress ? shippingAddress.state : undefined,
      shipping_country: useShippingAddress ? shippingAddress.country : undefined,
      shipping_email: useShippingAddress ? params.customerEmail : undefined,
      shipping_phone: useShippingAddress ? (shippingAddress.phone || params.customerPhone) : undefined,
      order_items: params.items.map(item => ({
        name: item.productName,
        sku: item.sku,
        units: item.quantity,
        selling_price: item.price.toString(),
        discount: '0',
        tax: '0',
        hsn: item.hsn || '',
      })),
      payment_method: params.paymentMethod,
      shipping_charges: params.shippingCharges,
      giftwrap_charges: 0,
      transaction_charges: 0,
      total_discount: params.totalDiscount || 0,
      sub_total: params.subtotal,
      length: params.dimensions?.length || SHIPROCKET_CONFIG.DEFAULT_DIMENSIONS.length,
      breadth: params.dimensions?.breadth || SHIPROCKET_CONFIG.DEFAULT_DIMENSIONS.breadth,
      height: params.dimensions?.height || SHIPROCKET_CONFIG.DEFAULT_DIMENSIONS.height,
      weight: params.weight,
    };
  }
}

export const shiprocketService = new ShiprocketService();
