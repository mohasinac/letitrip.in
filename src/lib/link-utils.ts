/**
 * Link Utilities
 * 
 * Utilities for handling links - detecting internal vs external,
 * resolving relative paths, and validating link formats.
 * 
 * @module lib/link-utils
 * Epic: E034 - Flexible Link Fields
 */

// Link type classifications
export type LinkType = 'internal' | 'external' | 'email' | 'phone' | 'anchor' | 'invalid';

/**
 * Options for link validation
 */
export interface LinkValidationOptions {
  /** Allow relative paths (starting with /) */
  allowRelative?: boolean;
  /** Allow external URLs */
  allowExternal?: boolean;
  /** Allow email links (mailto:) */
  allowEmail?: boolean;
  /** Allow phone links (tel:) */
  allowPhone?: boolean;
  /** Allow anchor links (#) */
  allowAnchor?: boolean;
  /** Custom allowed protocols */
  allowedProtocols?: string[];
  /** Require https for external links */
  requireHttps?: boolean;
}

/**
 * Result of link validation
 */
export interface LinkValidationResult {
  /** Whether the link is valid */
  isValid: boolean;
  /** Error message if invalid */
  error?: string;
  /** The type of link */
  type: LinkType;
  /** The resolved URL (with domain prepended if relative) */
  resolvedUrl?: string;
  /** Whether the link is internal to the site */
  isInternal: boolean;
  /** Whether the link should open in a new tab */
  shouldOpenInNewTab: boolean;
}

// Default options
const defaultValidationOptions: LinkValidationOptions = {
  allowRelative: true,
  allowExternal: true,
  allowEmail: true,
  allowPhone: true,
  allowAnchor: true,
  requireHttps: false,
};

/**
 * Get the base URL for the current environment
 * Works in both browser and server contexts
 */
export function getBaseUrl(): string {
  // Browser context
  if (typeof globalThis !== 'undefined' && globalThis.location) {
    return globalThis.location.origin;
  }
  
  // Server context - check for environment variables
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }
  
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  
  // Default fallback for development
  return 'http://localhost:3000';
}

/**
 * Check if a URL is an internal link
 * 
 * @param href - The URL or path to check
 * @returns true if the link is internal (relative path or same domain)
 * 
 * @example
 * isInternalLink('/products') // true
 * isInternalLink('/products?q=test') // true
 * isInternalLink('#section') // true
 * isInternalLink('https://justforview.in/products') // true (same domain)
 * isInternalLink('https://google.com') // false
 */
export function isInternalLink(href: string): boolean {
  if (!href || typeof href !== 'string') {
    return false;
  }
  
  const trimmed = href.trim();
  
  // Relative paths are internal
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
    return true;
  }
  
  // Anchor links are internal
  if (trimmed.startsWith('#')) {
    return true;
  }
  
  // Check if same domain
  try {
    const url = new URL(trimmed);
    const baseUrl = getBaseUrl();
    const base = new URL(baseUrl);
    
    return url.hostname === base.hostname;
  } catch {
    // Invalid URL - might be a relative path without leading slash
    return false;
  }
}

/**
 * Check if a URL is an external link
 * 
 * @param href - The URL or path to check
 * @returns true if the link is external (different domain)
 * 
 * @example
 * isExternalLink('https://google.com') // true
 * isExternalLink('/products') // false
 * isExternalLink('https://justforview.in/products') // false (same domain)
 */
export function isExternalLink(href: string): boolean {
  if (!href || typeof href !== 'string') {
    return false;
  }
  
  const trimmed = href.trim();
  
  // Protocol-relative URLs (//example.com) are external
  if (trimmed.startsWith('//')) {
    const fullUrl = `https:${trimmed}`;
    try {
      const url = new URL(fullUrl);
      const base = new URL(getBaseUrl());
      return url.hostname !== base.hostname;
    } catch {
      return true;
    }
  }
  
  // Check for external protocols
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    try {
      const url = new URL(trimmed);
      const base = new URL(getBaseUrl());
      return url.hostname !== base.hostname;
    } catch {
      return false;
    }
  }
  
  return false;
}

/**
 * Get the type of a link
 * 
 * @param href - The URL or path to check
 * @returns The link type classification
 * 
 * @example
 * getLinkType('/products') // 'internal'
 * getLinkType('https://google.com') // 'external'
 * getLinkType('mailto:test@test.com') // 'email'
 * getLinkType('tel:+911234567890') // 'phone'
 * getLinkType('#section') // 'anchor'
 */
export function getLinkType(href: string): LinkType {
  if (!href || typeof href !== 'string') {
    return 'invalid';
  }
  
  const trimmed = href.trim().toLowerCase();
  
  // Email links
  if (trimmed.startsWith('mailto:')) {
    return 'email';
  }
  
  // Phone links
  if (trimmed.startsWith('tel:')) {
    return 'phone';
  }
  
  // Anchor links
  if (trimmed.startsWith('#')) {
    return 'anchor';
  }
  
  // Internal links
  if (isInternalLink(href)) {
    return 'internal';
  }
  
  // External links
  if (isExternalLink(href)) {
    return 'external';
  }
  
  // Check if it's a valid URL format
  try {
    new URL(href);
    return 'external';
  } catch {
    // Might be a malformed URL
    return 'invalid';
  }
}

/**
 * Resolve a relative path to a full URL
 * 
 * @param href - The URL or relative path
 * @param baseUrl - Optional base URL (defaults to current site)
 * @returns The fully resolved URL
 * 
 * @example
 * resolveUrl('/products') // 'https://justforview.in/products'
 * resolveUrl('/search?q=test') // 'https://justforview.in/search?q=test'
 * resolveUrl('#section') // 'https://justforview.in#section'
 * resolveUrl('https://google.com') // 'https://google.com' (unchanged)
 */
export function resolveUrl(href: string, baseUrl?: string): string {
  if (!href || typeof href !== 'string') {
    return href;
  }
  
  const trimmed = href.trim();
  const base = baseUrl || getBaseUrl();
  
  // Already a full URL
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  
  // Protocol-relative URL
  if (trimmed.startsWith('//')) {
    return `https:${trimmed}`;
  }
  
  // Email or phone - return as is
  if (trimmed.startsWith('mailto:') || trimmed.startsWith('tel:')) {
    return trimmed;
  }
  
  // Anchor link - prepend base URL
  if (trimmed.startsWith('#')) {
    return `${base}${trimmed}`;
  }
  
  // Relative path - prepend base URL
  if (trimmed.startsWith('/')) {
    // Remove trailing slash from base to avoid double slashes
    const cleanBase = base.replace(/\/$/, '');
    return `${cleanBase}${trimmed}`;
  }
  
  // Relative path without leading slash
  // This is ambiguous, so we just return as-is
  return trimmed;
}

/**
 * Validate a link value
 * 
 * @param value - The link value to validate
 * @param options - Validation options
 * @returns Validation result
 * 
 * @example
 * validateLink('/products') // { isValid: true, type: 'internal', ... }
 * validateLink('not a url') // { isValid: false, error: '...', ... }
 */
export function validateLink(
  value: string,
  options: LinkValidationOptions = {}
): LinkValidationResult {
  const opts = { ...defaultValidationOptions, ...options };
  
  // Empty string is valid (optional field)
  if (!value || value.trim() === '') {
    return {
      isValid: true,
      type: 'internal',
      isInternal: true,
      shouldOpenInNewTab: false,
    };
  }
  
  const trimmed = value.trim();
  const linkType = getLinkType(trimmed);
  
  // Check if type is allowed
  switch (linkType) {
    case 'internal':
      if (!opts.allowRelative && trimmed.startsWith('/')) {
        return {
          isValid: false,
          error: 'Relative paths are not allowed',
          type: linkType,
          isInternal: true,
          shouldOpenInNewTab: false,
        };
      }
      break;
      
    case 'external':
      if (!opts.allowExternal) {
        return {
          isValid: false,
          error: 'External URLs are not allowed',
          type: linkType,
          isInternal: false,
          shouldOpenInNewTab: true,
        };
      }
      
      // Check for HTTPS requirement
      if (opts.requireHttps && trimmed.toLowerCase().startsWith('http://')) {
        return {
          isValid: false,
          error: 'Only HTTPS URLs are allowed',
          type: linkType,
          isInternal: false,
          shouldOpenInNewTab: true,
        };
      }
      break;
      
    case 'email':
      if (!opts.allowEmail) {
        return {
          isValid: false,
          error: 'Email links are not allowed',
          type: linkType,
          isInternal: false,
          shouldOpenInNewTab: false,
        };
      }
      break;
      
    case 'phone':
      if (!opts.allowPhone) {
        return {
          isValid: false,
          error: 'Phone links are not allowed',
          type: linkType,
          isInternal: false,
          shouldOpenInNewTab: false,
        };
      }
      break;
      
    case 'anchor':
      if (!opts.allowAnchor) {
        return {
          isValid: false,
          error: 'Anchor links are not allowed',
          type: linkType,
          isInternal: true,
          shouldOpenInNewTab: false,
        };
      }
      break;
      
    case 'invalid':
      return {
        isValid: false,
        error: 'Invalid link format',
        type: linkType,
        isInternal: false,
        shouldOpenInNewTab: false,
      };
  }
  
  // All validations passed
  return {
    isValid: true,
    type: linkType,
    resolvedUrl: resolveUrl(trimmed),
    isInternal: linkType === 'internal' || linkType === 'anchor',
    shouldOpenInNewTab: linkType === 'external',
  };
}

/**
 * Get the appropriate rel attribute for a link
 * 
 * @param href - The link URL
 * @returns The rel attribute value
 */
export function getLinkRel(href: string): string | undefined {
  if (isExternalLink(href)) {
    return 'noopener noreferrer';
  }
  return undefined;
}

/**
 * Get the appropriate target attribute for a link
 * 
 * @param href - The link URL
 * @param forceNewTab - Force opening in new tab
 * @returns The target attribute value
 */
export function getLinkTarget(href: string, forceNewTab = false): string | undefined {
  if (forceNewTab || isExternalLink(href)) {
    return '_blank';
  }
  return undefined;
}

/**
 * Format a link for display (truncate if too long)
 * 
 * @param href - The link URL
 * @param maxLength - Maximum display length
 * @returns Formatted display string
 */
export function formatLinkForDisplay(href: string, maxLength = 50): string {
  if (!href) return '';
  
  // Remove protocol for cleaner display
  let display = href.replace(/^https?:\/\//, '');
  
  // Remove trailing slash
  display = display.replace(/\/$/, '');
  
  // Truncate if too long
  if (display.length > maxLength) {
    return `${display.substring(0, maxLength - 3)}...`;
  }
  
  return display;
}

/**
 * Extract domain from a URL
 * 
 * @param href - The URL
 * @returns The domain name or null
 */
export function extractDomain(href: string): string | null {
  try {
    const url = new URL(href.startsWith('//') ? `https:${href}` : href);
    return url.hostname;
  } catch {
    return null;
  }
}

/**
 * Check if a link is to a downloadable file
 * 
 * @param href - The URL
 * @returns true if the link points to a downloadable file
 */
export function isDownloadableLink(href: string): boolean {
  const downloadExtensions = [
    '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
    '.zip', '.rar', '.7z', '.tar', '.gz',
    '.mp3', '.mp4', '.avi', '.mov', '.wmv',
    '.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp',
  ];
  
  const lowercaseHref = href.toLowerCase();
  return downloadExtensions.some(ext => lowercaseHref.endsWith(ext));
}
