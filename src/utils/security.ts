// Security utilities for input sanitization and validation
// Following Clean Architecture - these are framework-independent utilities

// HTML sanitization to prevent XSS
export const sanitizeHtml = (input: string): string => {
  // Remove script tags and event handlers
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/on\w+\s*=\s*[^"'\s>]*/gi, '');
};

// SQL injection prevention for search queries
export const sanitizeSearchQuery = (query: string): string => {
  return query
    .replace(/['"\\;]/g, '')
    .replace(/(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|EXEC)\b)/gi, '')
    .trim()
    .substring(0, 100); // Limit length
};

// Validate email format
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email) && email.length <= 254;
};

// Validate URL format and allowed domains
export const isValidUrl = (url: string, allowedDomains?: string[]): boolean => {
  try {
    const urlObj = new URL(url);
    
    // Check protocol
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return false;
    }
    
    // Check domain whitelist if provided
    if (allowedDomains) {
      return allowedDomains.some(domain => urlObj.hostname.includes(domain));
    }
    
    return true;
  } catch {
    return false;
  }
};

// Password strength validation
export const validatePasswordStrength = (password: string): {
  isValid: boolean;
  score: number;
  feedback: string[];
} => {
  const feedback: string[] = [];
  let score = 0;

  // Length check
  if (password.length >= 8) {
    score += 1;
  } else {
    feedback.push('Password should be at least 8 characters long');
  }

  // Uppercase check
  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Include at least one uppercase letter');
  }

  // Lowercase check
  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Include at least one lowercase letter');
  }

  // Number check
  if (/\d/.test(password)) {
    score += 1;
  } else {
    feedback.push('Include at least one number');
  }

  // Special character check
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Include at least one special character');
  }

  // Common password check
  const commonPasswords = ['password', '123456', 'qwerty', 'admin', 'letmein'];
  if (commonPasswords.includes(password.toLowerCase())) {
    score = 0;
    feedback.push('Avoid common passwords');
  }

  return {
    isValid: score >= 4,
    score,
    feedback
  };
};

// Environment variable validation
export const validateEnvVarName = (name: string): boolean => {
  // Allow only uppercase letters, numbers, and underscores
  // Must start with letter or underscore
  const envVarRegex = /^[A-Z_][A-Z0-9_]*$/;
  return envVarRegex.test(name) && name.length <= 50;
};

// Project name validation
export const validateProjectName = (name: string): boolean => {
  // Allow alphanumeric, hyphens, underscores
  // Must start and end with alphanumeric
  const projectNameRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-_]*[a-zA-Z0-9])?$/;
  return projectNameRegex.test(name) && name.length >= 1 && name.length <= 50;
};

// Domain name validation
export const validateDomainName = (domain: string): boolean => {
  const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
  return domainRegex.test(domain);
};

// File path validation (for build outputs)
export const validateFilePath = (path: string): boolean => {
  // Prevent directory traversal
  if (path.includes('..') || path.includes('//')) {
    return false;
  }
  
  // Allow alphanumeric, hyphens, underscores, forward slashes, dots
  const filePathRegex = /^[a-zA-Z0-9._/-]+$/;
  return filePathRegex.test(path) && path.length <= 200;
};

// Rate limiting helper
export class RateLimiter {
  private attempts: Map<string, { count: number; resetTime: number }> = new Map();

  isAllowed(key: string, maxAttempts: number, windowMs: number): boolean {
    const now = Date.now();
    const record = this.attempts.get(key);

    if (!record || now > record.resetTime) {
      // Reset or create new record
      this.attempts.set(key, { count: 1, resetTime: now + windowMs });
      return true;
    }

    if (record.count >= maxAttempts) {
      return false;
    }

    record.count++;
    return true;
  }

  getRemainingAttempts(key: string, maxAttempts: number): number {
    const record = this.attempts.get(key);
    if (!record || Date.now() > record.resetTime) {
      return maxAttempts;
    }
    return Math.max(0, maxAttempts - record.count);
  }

  getResetTime(key: string): number | null {
    const record = this.attempts.get(key);
    if (!record || Date.now() > record.resetTime) {
      return null;
    }
    return record.resetTime;
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, record] of this.attempts.entries()) {
      if (now > record.resetTime) {
        this.attempts.delete(key);
      }
    }
  }
}

// CSRF token utilities
export const generateCSRFToken = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

export const validateCSRFToken = (token: string, storedToken: string): boolean => {
  return token === storedToken && token.length === 64;
};

// Content Security Policy helpers
export const getSecureHeaders = () => ({
  'Content-Security-Policy': 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: blob: https:; " +
    "connect-src 'self' wss: https:; " +
    "font-src 'self'; " +
    "frame-ancestors 'none';",
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
});

// Input length limits
export const INPUT_LIMITS = {
  PROJECT_NAME: 50,
  REPOSITORY_URL: 500,
  BUILD_COMMAND: 200,
  OUTPUT_DIRECTORY: 100,
  ENV_VAR_NAME: 50,
  ENV_VAR_VALUE: 1000,
  CUSTOM_DOMAIN: 253,
  USER_NAME: 100,
  EMAIL: 254,
  PASSWORD_MIN: 8,
  PASSWORD_MAX: 128
} as const;

// Validation helper that combines multiple checks
export const validateInput = (
  value: string,
  type: keyof typeof INPUT_LIMITS,
  customValidation?: (value: string) => boolean
): { isValid: boolean; error?: string } => {
  const limit = INPUT_LIMITS[type];
  
  if (!value || value.trim().length === 0) {
    return { isValid: false, error: 'This field is required' };
  }

  if (value.length > limit) {
    return { isValid: false, error: `Must be ${limit} characters or less` };
  }

  // Type-specific validation
  switch (type) {
    case 'PROJECT_NAME':
      if (!validateProjectName(value)) {
        return { isValid: false, error: 'Invalid project name format' };
      }
      break;
    case 'REPOSITORY_URL':
      if (!isValidUrl(value, ['github.com', 'gitlab.com', 'bitbucket.org'])) {
        return { isValid: false, error: 'Must be a valid Git repository URL' };
      }
      break;
    case 'EMAIL':
      if (!isValidEmail(value)) {
        return { isValid: false, error: 'Invalid email format' };
      }
      break;
    case 'CUSTOM_DOMAIN':
      if (!validateDomainName(value)) {
        return { isValid: false, error: 'Invalid domain name' };
      }
      break;
    case 'ENV_VAR_NAME':
      if (!validateEnvVarName(value)) {
        return { isValid: false, error: 'Invalid environment variable name' };
      }
      break;
  }

  // Custom validation if provided
  if (customValidation && !customValidation(value)) {
    return { isValid: false, error: 'Invalid input' };
  }

  return { isValid: true };
};