import { describe, it, expect } from 'vitest';
import {
  isValidEmail,
  isValidPhone,
  isValidPostalCode,
  validateLoginForm,
  validateCheckoutForm,
} from '../utils/validation';

describe('Form & Input Validations', () => {
  describe('Email Validation', () => {
    it('accepts valid email addresses', () => {
      expect(isValidEmail('customer@example.com')).toBe(true);
      expect(isValidEmail('arham.bhatti@jableather.pk')).toBe(true);
      expect(isValidEmail('user+tag@domain.co.uk')).toBe(true);
    });

    it('rejects invalid email addresses', () => {
      expect(isValidEmail('')).toBe(false);
      expect(isValidEmail('notanemail')).toBe(false);
      expect(isValidEmail('missing@domain')).toBe(false);
      expect(isValidEmail('@nodomain.com')).toBe(false);
      expect(isValidEmail('spaces in@email.com')).toBe(false);
    });
  });

  describe('Phone Validation (including Pakistani +92 numbers)', () => {
    it('accepts international Pakistani +92 numbers in various formats', () => {
      expect(isValidPhone('+92 300 1234567')).toBe(true);
      expect(isValidPhone('+923001234567')).toBe(true);
      expect(isValidPhone('+92-300-1234567')).toBe(true);
      expect(isValidPhone('+92 (300) 1234567')).toBe(true);
      expect(isValidPhone('03001234567')).toBe(true); // Local PK format
    });

    it('accepts US and international formats', () => {
      expect(isValidPhone('+1 (555) 234-5678')).toBe(true);
      expect(isValidPhone('+44 20 7946 0958')).toBe(true);
      expect(isValidPhone('555-0199')).toBe(true);
    });

    it('rejects invalid or too short phone numbers', () => {
      expect(isValidPhone('')).toBe(false);
      expect(isValidPhone('123')).toBe(false);
      expect(isValidPhone('phone-number')).toBe(false);
      expect(isValidPhone('+123456789012345678901')).toBe(false); // exceeds 15 digits
    });
  });

  describe('Postal Code Validation by Country', () => {
    it('validates Pakistani postal codes (5 digits, e.g. 51310 for Sialkot)', () => {
      expect(isValidPostalCode('51310', 'Pakistan')).toBe(true);
      expect(isValidPostalCode('54000', 'Pakistan')).toBe(true); // Lahore
      expect(isValidPostalCode('123', 'Pakistan')).toBe(false);
      expect(isValidPostalCode('ABCDE', 'Pakistan')).toBe(false);
    });

    it('validates US ZIP codes', () => {
      expect(isValidPostalCode('90210', 'United States')).toBe(true);
      expect(isValidPostalCode('10001-1234', 'United States')).toBe(true);
      expect(isValidPostalCode('9021', 'United States')).toBe(false);
    });

    it('validates UK postal codes', () => {
      expect(isValidPostalCode('SW1A 1AA', 'United Kingdom')).toBe(true);
      expect(isValidPostalCode('EC1A 1BB', 'United Kingdom')).toBe(true);
    });
  });

  describe('validateCheckoutForm', () => {
    const validData = {
      firstName: 'Hamza',
      lastName: 'Khan',
      email: 'hamza@example.pk',
      phone: '+92 300 7654321',
      country: 'Pakistan',
      address: 'Kashmir Road, Atelier #4',
      city: 'Sialkot',
      state: 'Punjab',
      postalCode: '51310',
    };

    it('passes for complete and valid checkout form data', () => {
      const { isValid, errors } = validateCheckoutForm(validData);
      expect(isValid).toBe(true);
      expect(Object.keys(errors)).toHaveLength(0);
    });

    it('fails when mandatory fields are missing', () => {
      const { isValid, errors } = validateCheckoutForm({
        firstName: '',
        lastName: '',
        email: 'invalid-email',
        phone: '12',
        country: 'Pakistan',
        address: '',
        city: '',
        state: '',
        postalCode: 'wrong',
      });

      expect(isValid).toBe(false);
      expect(errors.firstName).toBeDefined();
      expect(errors.lastName).toBeDefined();
      expect(errors.email).toBeDefined();
      expect(errors.phone).toBeDefined();
      expect(errors.address).toBeDefined();
      expect(errors.city).toBeDefined();
      expect(errors.state).toBeDefined();
      expect(errors.postalCode).toBeDefined();
    });
  });

  describe('validateLoginForm', () => {
    it('validates email and minimum password length', () => {
      expect(validateLoginForm({ email: 'test@domain.com', password: 'secretpassword' }).isValid).toBe(true);
      expect(validateLoginForm({ email: 'bad-email', password: '123' }).isValid).toBe(false);
    });
  });
});
