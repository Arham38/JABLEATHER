/**
 * Formats a numeric price into a currency string with proper symbols and precision.
 * Single source of truth for currency formatting across JAB LEATHER.
 */
export const formatCurrency = (amount, currency = 'USD') => {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return currency === 'PKR' ? '₨ 0.00' : '$0.00';
  }

  const safeCurrency = (currency || 'USD').toUpperCase();

  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: safeCurrency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(amount));
  } catch {
    return `${safeCurrency} ${Number(amount).toFixed(2)}`;
  }
};

/**
 * Converts an amount from one currency to another using exchange rates.
 */
export const convertCurrency = (
  amount,
  fromCurrency = 'USD',
  toCurrency = 'USD',
  rates = { USD: 1.0, PKR: 278.50, EUR: 0.92, GBP: 0.79 }
) => {
  if (amount === undefined || amount === null || isNaN(amount)) return 0;
  if (fromCurrency === toCurrency) return Number(amount);

  const fromRate = rates[fromCurrency] || 1.0;
  const toRate = rates[toCurrency] || 1.0;

  // Convert to base USD first, then to target currency
  const inBase = Number(amount) / fromRate;
  const inTarget = inBase * toRate;

  return Number(inTarget.toFixed(2));
};

export const calculateDiscountPercentage = (price, compareAtPrice) => {
  if (!compareAtPrice || compareAtPrice <= price) return 0;
  return Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
};

export default formatCurrency;
