// Formatting utility functions
export const formatCurrency = (
  amount: number,
  currency = 'INR',
  locale = 'en-IN'
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
};

export const formatNumber = (
  number: number,
  locale = 'en-IN',
  options?: Intl.NumberFormatOptions
): string => {
  return new Intl.NumberFormat(locale, options).format(number);
};

export const formatPercent = (
  number: number,
  locale = 'en-IN',
  decimals = 1
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(number);
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Format as Indian mobile number (+91 XXXXX XXXXX)
  if (cleaned.length === 10) {
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }
  
  // Format with country code already present
  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    return `+91 ${cleaned.slice(2, 7)} ${cleaned.slice(7)}`;
  }
  
  // Format with + prefix
  if (cleaned.length === 13 && cleaned.startsWith('91')) {
    return `+91 ${cleaned.slice(2, 7)} ${cleaned.slice(7)}`;
  }
  
  // Return original if can't format
  return phone;
};

export const formatAddress = (address: {
  street?: string;
  city?: string;
  state?: string;
  pinCode?: string;
  country?: string;
}): string => {
  const parts = [
    address.street,
    address.city,
    address.state && address.pinCode ? `${address.state} - ${address.pinCode}` : address.state || address.pinCode,
    address.country,
  ].filter(Boolean);
  
  return parts.join(', ');
};

export const formatInitials = (firstName: string, lastName?: string): string => {
  const first = firstName?.charAt(0)?.toUpperCase() || '';
  const last = lastName?.charAt(0)?.toUpperCase() || '';
  return `${first}${last}`;
};

export const formatCompactNumber = (number: number): string => {
  if (number < 1000) return number.toString();
  if (number < 100000) return `${(number / 1000).toFixed(1)}K`;
  if (number < 10000000) return `${(number / 100000).toFixed(1)}L`; // Lakhs
  return `${(number / 10000000).toFixed(1)}Cr`; // Crores
};

// Indian numbering system formatter
export const formatIndianNumber = (number: number): string => {
  return new Intl.NumberFormat('en-IN').format(number);
};

// Format price in Indian context with proper currency symbol
export const formatPrice = (amount: number, showDecimals = true): string => {
  const options: Intl.NumberFormatOptions = {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  };
  
  return new Intl.NumberFormat('en-IN', options).format(amount);
};
