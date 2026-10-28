/**
 * Centralized form validation utilities.
 */

export const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

export const isValidPhone = (phone) => {
  // Accepts standard international and national phone formats
  const re = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
  return re.test(String(phone).trim());
};

export const isValidPostalCode = (postalCode) => {
  return String(postalCode).trim().length >= 3;
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
  if (!formData.phone?.trim()) errors.phone = 'Phone number is required';
  if (!formData.address?.trim()) errors.address = 'Street address is required';
  if (!formData.city?.trim()) errors.city = 'City is required';
  if (!formData.state?.trim()) errors.state = 'State / Province is required';
  if (!formData.postalCode?.trim()) errors.postalCode = 'Postal code is required';
  if (!formData.country?.trim()) errors.country = 'Country is required';

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
