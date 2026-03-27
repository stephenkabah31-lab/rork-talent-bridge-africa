export class InputSanitizer {
  static sanitizeString(input: string, maxLength: number = 1000): string {
    if (typeof input !== 'string') {
      return '';
    }

    return input
      .trim()
      .slice(0, maxLength)
      .replace(/[<>]/g, '');
  }

  static sanitizeEmail(email: string): string {
    if (typeof email !== 'string') {
      return '';
    }

    return email
      .toLowerCase()
      .trim()
      .slice(0, 255)
      .replace(/[<>'"]/g, '');
  }

  static sanitizeHTML(input: string): string {
    if (typeof input !== 'string') {
      return '';
    }

    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 255;
  }

  static validatePassword(password: string): {
    valid: boolean;
    message?: string;
  } {
    if (password.length < 8) {
      return {
        valid: false,
        message: 'Password must be at least 8 characters long',
      };
    }

    if (password.length > 100) {
      return {
        valid: false,
        message: 'Password is too long',
      };
    }

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);

    if (!hasUpperCase || !hasLowerCase || !hasNumber) {
      return {
        valid: false,
        message: 'Password must contain uppercase, lowercase, and number',
      };
    }

    return { valid: true };
  }

  static sanitizePhoneNumber(phone: string): string {
    if (typeof phone !== 'string') {
      return '';
    }

    return phone
      .replace(/[^\d+\-() ]/g, '')
      .slice(0, 20);
  }

  static sanitizeURL(url: string): string {
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        return '';
      }
      return parsed.toString();
    } catch {
      return '';
    }
  }

  static preventSQLInjection(input: string): string {
    if (typeof input !== 'string') {
      return '';
    }

    return input.replace(/['";\\]/g, '');
  }

  static sanitizeAlphanumeric(input: string, maxLength: number = 100): string {
    if (typeof input !== 'string') {
      return '';
    }

    return input
      .replace(/[^a-zA-Z0-9\s-_]/g, '')
      .trim()
      .slice(0, maxLength);
  }
}

export const sanitizeInput = InputSanitizer.sanitizeString;
export const sanitizeEmail = InputSanitizer.sanitizeEmail;
export const validateEmail = InputSanitizer.validateEmail;
export const validatePassword = InputSanitizer.validatePassword;
