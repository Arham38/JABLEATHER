/**
 * Centralized form validation utilities for JAB LEATHER.
 */

export const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

export const isValidPhone = (phone) => {
  if (!phone) return false;
  const clean = String(phone).trim();
  // Accepts standard international formats including +92 (Pakistan), +1 (US), +44 (UK), etc.
  const re = /^\+?[0-9()\-.\s]{7,20}$/;
  const digitsOnly = clean.replace(/\D/g, '');
  return digitsOnly.length >= 7 && digitsOnly.length <= 15 && re.test(clean);
};

export const isValidPostalCode = (postalCode, country = 'United States') => {
  if (!postalCode) return false;
  const code = String(postalCode).trim().toUpperCase();

  if (country === 'United States') {
    return /^\d{5}(-\d{4})?$/.test(code);
  }
  if (country === 'Pakistan') {
    return /^\d{5}$/.test(code);
  }
  if (country === 'United Kingdom') {
    return /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/.test(code);
  }
  if (country === 'Canada') {
    return /^[A-Z]\d[A-Z]\s*\d[A-Z]\d$/.test(code);
  }

  // International generic postal format
  return code.length >= 3 && code.length <= 12 && /^[A-Z0-9\s-]+$/i.test(code);
};

export const validateLoginForm = ({ email, password }) => {
  const errors = {};
  if (!email || !isValidEmail(email)) {
    errors.email = 'Please enter a valid email address';
  }
  if (!password || password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  }
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateCheckoutForm = (formData) => {
  const errors = {};
  if (!formData.firstName?.trim()) errors.firstName = 'First name is required';
  if (!formData.lastName?.trim()) errors.lastName = 'Last name is required';
  if (!formData.email || !isValidEmail(formData.email)) errors.email = 'Valid email is required';
  if (!formData.phone || !isValidPhone(formData.phone)) errors.phone = 'Valid international phone number required (e.g. +92 300 1234567)';
  if (!formData.address?.trim()) errors.address = 'Street delivery address is required';
  if (!formData.city?.trim()) errors.city = 'City is required';
  if (!formData.state?.trim()) errors.state = 'State / Province is required';
  if (!formData.country?.trim()) errors.country = 'Country is required';
  if (!formData.postalCode || !isValidPostalCode(formData.postalCode, formData.country)) {
    errors.postalCode = formData.country === 'Pakistan'
      ? 'Valid 5-digit postal code required (e.g. 51310 for Sialkot)'
      : 'Valid postal/ZIP code required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export default {
  isValidEmail,
  isValidPhone,
  isValidPostalCode,
  validateLoginForm,
  validateCheckoutForm,
};
