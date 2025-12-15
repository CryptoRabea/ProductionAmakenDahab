import DOMPurify from 'dompurify';

/**
 * Sanitization utilities to prevent XSS attacks
 */

/**
 * Sanitize HTML content to prevent XSS
 * Use this for user-generated content that may contain HTML
 */
export const sanitizeHtml = (dirty: string): string => {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href', 'target'],
    ALLOW_DATA_ATTR: false
  });
};

/**
 * Sanitize plain text by removing all HTML tags
 * Use this for simple text inputs like names, titles, etc.
 */
export const sanitizeText = (dirty: string): string => {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [],
    KEEP_CONTENT: true
  });
};

/**
 * Sanitize and validate URLs
 * Returns the URL if valid, empty string otherwise
 */
export const sanitizeUrl = (url: string): string => {
  const cleaned = DOMPurify.sanitize(url, {
    ALLOWED_TAGS: [],
    KEEP_CONTENT: true
  });

  try {
    const urlObj = new URL(cleaned);
    // Only allow http and https protocols
    if (urlObj.protocol === 'http:' || urlObj.protocol === 'https:') {
      return cleaned;
    }
    return '';
  } catch {
    return '';
  }
};

/**
 * Sanitize image URL (stricter validation)
 */
export const sanitizeImageUrl = (url: string): string => {
  const cleanUrl = sanitizeUrl(url);

  if (!cleanUrl) return '';

  // Check if URL ends with common image extensions or is from trusted CDNs
  const trustedDomains = ['unsplash.com', 'images.unsplash.com', 'cdn-icons-png.flaticon.com', 'firebasestorage.googleapis.com'];
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];

  try {
    const urlObj = new URL(cleanUrl);
    const hostname = urlObj.hostname;
    const pathname = urlObj.pathname.toLowerCase();

    const isTrustedDomain = trustedDomains.some(domain => hostname.includes(domain));
    const hasImageExtension = imageExtensions.some(ext => pathname.endsWith(ext));

    if (isTrustedDomain || hasImageExtension) {
      return cleanUrl;
    }

    return '';
  } catch {
    return '';
  }
};

/**
 * Sanitize user object to remove any potentially malicious content
 */
export const sanitizeUserInput = <T extends Record<string, unknown>>(obj: T): T => {
  const sanitized = {} as T;

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key as keyof T] = sanitizeText(value) as T[keyof T];
    } else if (Array.isArray(value)) {
      sanitized[key as keyof T] = value.map(item =>
        typeof item === 'string' ? sanitizeText(item) : item
      ) as T[keyof T];
    } else {
      sanitized[key as keyof T] = value as T[keyof T];
    }
  }

  return sanitized;
};
