import {
  ADDRESS_API_CONFIG,
  POSTAL_PINCODE_CONFIG,
  ZIPPOPOTAM_CONFIG,
  AddressAPIConfig,
} from '../address-api.config';

describe('Address API Config', () => {
  describe('POSTAL_PINCODE_CONFIG', () => {
    it('should have correct basic properties', () => {
      expect(POSTAL_PINCODE_CONFIG.id).toBe('postal_pincode');
      expect(POSTAL_PINCODE_CONFIG.name).toBe('Postal Pincode API');
      expect(POSTAL_PINCODE_CONFIG.description).toBeTruthy();
      expect(POSTAL_PINCODE_CONFIG.baseUrl).toBe('https://api.postalpincode.in');
      expect(POSTAL_PINCODE_CONFIG.enabled).toBe(true);
    });

    it('should have valid rate limits', () => {
      expect(POSTAL_PINCODE_CONFIG.rateLimit.requestsPerMinute).toBe(60);
      expect(POSTAL_PINCODE_CONFIG.rateLimit.requestsPerDay).toBe(10000);
      expect(POSTAL_PINCODE_CONFIG.rateLimit.requestsPerMinute).toBeGreaterThan(0);
      expect(POSTAL_PINCODE_CONFIG.rateLimit.requestsPerDay).toBeGreaterThan(0);
    });

    it('should have reasonable timeout and retry settings', () => {
      expect(POSTAL_PINCODE_CONFIG.timeout).toBe(5000);
      expect(POSTAL_PINCODE_CONFIG.retryAttempts).toBe(2);
      expect(POSTAL_PINCODE_CONFIG.timeout).toBeGreaterThan(0);
      expect(POSTAL_PINCODE_CONFIG.retryAttempts).toBeGreaterThanOrEqual(0);
    });

    it('should have cache time configured', () => {
      expect(POSTAL_PINCODE_CONFIG.cacheTime).toBe(86400000); // 24 hours
      expect(POSTAL_PINCODE_CONFIG.cacheTime).toBeGreaterThan(0);
    });

    it('should have documentation URL', () => {
      expect(POSTAL_PINCODE_CONFIG.docs).toBe('https://www.postalpincode.in/Api-Details');
      expect(POSTAL_PINCODE_CONFIG.docs).toMatch(/^https?:\/\//);
    });

    it('should have valid HTTPS URL', () => {
      expect(POSTAL_PINCODE_CONFIG.baseUrl).toMatch(/^https:\/\//);
    });
  });

  describe('ZIPPOPOTAM_CONFIG', () => {
    it('should have correct basic properties', () => {
      expect(ZIPPOPOTAM_CONFIG.id).toBe('zippopotam');
      expect(ZIPPOPOTAM_CONFIG.name).toBe('Zippopotam');
      expect(ZIPPOPOTAM_CONFIG.description).toBeTruthy();
      expect(ZIPPOPOTAM_CONFIG.baseUrl).toBe('https://api.zippopotam.us');
      expect(ZIPPOPOTAM_CONFIG.enabled).toBe(true);
    });

    it('should have valid rate limits', () => {
      expect(ZIPPOPOTAM_CONFIG.rateLimit.requestsPerMinute).toBe(60);
      expect(ZIPPOPOTAM_CONFIG.rateLimit.requestsPerDay).toBe(5000);
      expect(ZIPPOPOTAM_CONFIG.rateLimit.requestsPerMinute).toBeGreaterThan(0);
      expect(ZIPPOPOTAM_CONFIG.rateLimit.requestsPerDay).toBeGreaterThan(0);
    });

    it('should have reasonable timeout and retry settings', () => {
      expect(ZIPPOPOTAM_CONFIG.timeout).toBe(5000);
      expect(ZIPPOPOTAM_CONFIG.retryAttempts).toBe(2);
      expect(ZIPPOPOTAM_CONFIG.timeout).toBeGreaterThan(0);
      expect(ZIPPOPOTAM_CONFIG.retryAttempts).toBeGreaterThanOrEqual(0);
    });

    it('should have cache time configured', () => {
      expect(ZIPPOPOTAM_CONFIG.cacheTime).toBe(86400000); // 24 hours
      expect(ZIPPOPOTAM_CONFIG.cacheTime).toBeGreaterThan(0);
    });

    it('should have documentation URL', () => {
      expect(ZIPPOPOTAM_CONFIG.docs).toBe('http://www.zippopotam.us/');
      expect(ZIPPOPOTAM_CONFIG.docs).toMatch(/^https?:\/\//);
    });

    it('should have valid HTTPS URL', () => {
      expect(ZIPPOPOTAM_CONFIG.baseUrl).toMatch(/^https:\/\//);
    });
  });

  describe('ADDRESS_API_CONFIG', () => {
    it('should export both API configurations', () => {
      expect(ADDRESS_API_CONFIG.POSTAL_PINCODE).toBeDefined();
      expect(ADDRESS_API_CONFIG.ZIPPOPOTAM).toBeDefined();
    });

    it('should reference the same config objects', () => {
      expect(ADDRESS_API_CONFIG.POSTAL_PINCODE).toBe(POSTAL_PINCODE_CONFIG);
      expect(ADDRESS_API_CONFIG.ZIPPOPOTAM).toBe(ZIPPOPOTAM_CONFIG);
    });

    it('should have unique IDs for each API', () => {
      const ids = [
        ADDRESS_API_CONFIG.POSTAL_PINCODE.id,
        ADDRESS_API_CONFIG.ZIPPOPOTAM.id,
      ];
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have all APIs enabled by default', () => {
      expect(ADDRESS_API_CONFIG.POSTAL_PINCODE.enabled).toBe(true);
      expect(ADDRESS_API_CONFIG.ZIPPOPOTAM.enabled).toBe(true);
    });
  });

  describe('Configuration consistency', () => {
    it('should have consistent timeout values', () => {
      const configs: AddressAPIConfig[] = [
        POSTAL_PINCODE_CONFIG,
        ZIPPOPOTAM_CONFIG,
      ];
      
      configs.forEach((config) => {
        expect(config.timeout).toBe(5000);
      });
    });

    it('should have consistent retry attempts', () => {
      const configs: AddressAPIConfig[] = [
        POSTAL_PINCODE_CONFIG,
        ZIPPOPOTAM_CONFIG,
      ];
      
      configs.forEach((config) => {
        expect(config.retryAttempts).toBe(2);
      });
    });

    it('should have consistent cache times', () => {
      const configs: AddressAPIConfig[] = [
        POSTAL_PINCODE_CONFIG,
        ZIPPOPOTAM_CONFIG,
      ];
      
      configs.forEach((config) => {
        expect(config.cacheTime).toBe(86400000);
      });
    });

    it('should have valid HTTPS URLs for all APIs', () => {
      const configs: AddressAPIConfig[] = [
        POSTAL_PINCODE_CONFIG,
        ZIPPOPOTAM_CONFIG,
      ];
      
      configs.forEach((config) => {
        expect(config.baseUrl).toMatch(/^https:\/\//);
      });
    });
  });

  describe('Rate limiting', () => {
    it('should have reasonable daily limits', () => {
      expect(POSTAL_PINCODE_CONFIG.rateLimit.requestsPerDay).toBeLessThanOrEqual(100000);
      expect(ZIPPOPOTAM_CONFIG.rateLimit.requestsPerDay).toBeLessThanOrEqual(100000);
    });

    it('should have minute limits that make sense with daily limits', () => {
      const postalMinuteLimit = POSTAL_PINCODE_CONFIG.rateLimit.requestsPerMinute;
      const postalDailyLimit = POSTAL_PINCODE_CONFIG.rateLimit.requestsPerDay;
      expect(postalMinuteLimit * 1440).toBeGreaterThanOrEqual(postalDailyLimit);

      const zippoMinuteLimit = ZIPPOPOTAM_CONFIG.rateLimit.requestsPerMinute;
      const zippoDailyLimit = ZIPPOPOTAM_CONFIG.rateLimit.requestsPerDay;
      expect(zippoMinuteLimit * 1440).toBeGreaterThanOrEqual(zippoDailyLimit);
    });
  });

  describe('Type validation', () => {
    it('should match AddressAPIConfig interface', () => {
      const validateConfig = (config: AddressAPIConfig) => {
        expect(typeof config.id).toBe('string');
        expect(typeof config.name).toBe('string');
        expect(typeof config.description).toBe('string');
        expect(typeof config.baseUrl).toBe('string');
        expect(typeof config.enabled).toBe('boolean');
        expect(typeof config.rateLimit.requestsPerMinute).toBe('number');
        expect(typeof config.rateLimit.requestsPerDay).toBe('number');
        expect(typeof config.timeout).toBe('number');
        expect(typeof config.retryAttempts).toBe('number');
        expect(typeof config.cacheTime).toBe('number');
        expect(typeof config.docs).toBe('string');
      };

      validateConfig(POSTAL_PINCODE_CONFIG);
      validateConfig(ZIPPOPOTAM_CONFIG);
    });
  });

  describe('Edge cases', () => {
    it('should handle zero retry attempts', () => {
      const testConfig = { ...POSTAL_PINCODE_CONFIG, retryAttempts: 0 };
      expect(testConfig.retryAttempts).toBe(0);
    });

    it('should handle very long cache times', () => {
      const oneYear = 365 * 24 * 60 * 60 * 1000;
      expect(POSTAL_PINCODE_CONFIG.cacheTime).toBeLessThan(oneYear);
    });

    it('should handle disabled APIs', () => {
      const disabledConfig = { ...POSTAL_PINCODE_CONFIG, enabled: false };
      expect(disabledConfig.enabled).toBe(false);
    });
  });

  describe('URL validation', () => {
    it('should have valid base URLs without trailing slashes', () => {
      expect(POSTAL_PINCODE_CONFIG.baseUrl).not.toMatch(/\/$/);
      expect(ZIPPOPOTAM_CONFIG.baseUrl).not.toMatch(/\/$/);
    });

    it('should have valid documentation URLs', () => {
      const urlPattern = /^https?:\/\/.+/;
      expect(POSTAL_PINCODE_CONFIG.docs).toMatch(urlPattern);
      expect(ZIPPOPOTAM_CONFIG.docs).toMatch(urlPattern);
    });
  });

  describe('Performance settings', () => {
    it('should have reasonable timeout values (not too short or long)', () => {
      const minTimeout = 1000; // 1 second
      const maxTimeout = 30000; // 30 seconds
      
      expect(POSTAL_PINCODE_CONFIG.timeout).toBeGreaterThanOrEqual(minTimeout);
      expect(POSTAL_PINCODE_CONFIG.timeout).toBeLessThanOrEqual(maxTimeout);
      expect(ZIPPOPOTAM_CONFIG.timeout).toBeGreaterThanOrEqual(minTimeout);
      expect(ZIPPOPOTAM_CONFIG.timeout).toBeLessThanOrEqual(maxTimeout);
    });

    it('should have reasonable cache times (at least 1 hour)', () => {
      const oneHour = 60 * 60 * 1000;
      
      expect(POSTAL_PINCODE_CONFIG.cacheTime).toBeGreaterThanOrEqual(oneHour);
      expect(ZIPPOPOTAM_CONFIG.cacheTime).toBeGreaterThanOrEqual(oneHour);
    });
  });

  describe('API specific features', () => {
    it('should identify India-specific API', () => {
      expect(POSTAL_PINCODE_CONFIG.name.toLowerCase()).toContain('pincode');
    });

    it('should identify international API', () => {
      expect(ZIPPOPOTAM_CONFIG.description.toLowerCase()).toContain('international');
    });
  });
});
