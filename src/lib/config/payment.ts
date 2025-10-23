/**
 * Payment Gateway Configuration
 */

export const RAZORPAY_CONFIG = {
  KEY_ID: process.env.RAZORPAY_KEY_ID!,
  KEY_SECRET: process.env.RAZORPAY_KEY_SECRET!,
  WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET!,
  
  // Test mode configuration
  TEST_MODE: process.env.NODE_ENV !== 'production',
  
  // Supported currencies
  SUPPORTED_CURRENCIES: ['INR', 'USD'],
  DEFAULT_CURRENCY: 'INR',
  
  // Payment options
  OPTIONS: {
    theme: {
      color: '#3B82F6'
    },
    modal: {
      backdropclose: false,
      escape: false,
      handleback: false,
      confirm_close: true,
      ondismiss: function() {
        console.log('Payment cancelled by user');
      }
    }
  },
  
  // Webhook events to handle
  WEBHOOK_EVENTS: [
    'payment.authorized',
    'payment.captured',
    'payment.failed',
    'order.paid',
    'refund.created',
    'refund.processed',
  ],
};

export const validateRazorpayConfig = () => {
  // Skip validation during build time
  if (process.env.NODE_ENV === 'production' && !process.env.VERCEL_ENV) {
    return;
  }
  
  const requiredVars = ['RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET'];
  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    console.warn(`Missing Razorpay environment variables: ${missing.join(', ')}`);
    // Don't throw error during build, just warn
    if (process.env.NODE_ENV !== 'production') {
      throw new Error(`Missing required Razorpay environment variables: ${missing.join(', ')}`);
    }
  }
};

export const PAYMENT_METHODS = {
  RAZORPAY: 'razorpay',
  COD: 'cod',
} as const;

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
} as const;
