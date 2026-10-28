import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { settingsService } from '../services/settingsService';
import { formatCurrency as formatHelper, convertCurrency as convertHelper } from '../utils/currency';

const CurrencyContext = createContext(null);
const STORAGE_CURRENCY_KEY = 'jab_store_selected_currency';

export const CurrencyProvider = ({ children }) => {
  const [baseCurrency, setBaseCurrency] = useState('USD');
  const [supportedCurrencies, setSupportedCurrencies] = useState(['USD', 'PKR', 'EUR', 'GBP']);
  const [exchangeRates, setExchangeRates] = useState({
    USD: 1.0,
    PKR: 278.50,
    EUR: 0.92,
    GBP: 0.79,
  });
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(150.00);

  const [currency, setCurrencyState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_CURRENCY_KEY);
      if (saved && ['USD', 'PKR', 'EUR', 'GBP'].includes(saved)) {
        return saved;
      }
    } catch {
      // LocalStorage unavailable
    }
    return 'USD';
  });

  // Load store currency and exchange rates from settings table
  useEffect(() => {
    settingsService.getSettings().then((settings) => {
      const general = settings?.general || {};
      const shipping = settings?.shipping || {};

      if (general.baseCurrency) setBaseCurrency(general.baseCurrency);
      if (general.supportedCurrencies && Array.isArray(general.supportedCurrencies)) {
        setSupportedCurrencies(general.supportedCurrencies);
      }
      if (general.exchangeRates && typeof general.exchangeRates === 'object') {
        setExchangeRates((prev) => ({ ...prev, ...general.exchangeRates }));
      }
      if (shipping.freeShippingThreshold || general.freeShippingThreshold) {
        setFreeShippingThreshold(Number(shipping.freeShippingThreshold || general.freeShippingThreshold) || 150.00);
      }
    }).catch(console.error);
  }, []);

  const setCurrency = useCallback((newCurrency) => {
    if (supportedCurrencies.includes(newCurrency)) {
      setCurrencyState(newCurrency);
      try {
        localStorage.setItem(STORAGE_CURRENCY_KEY, newCurrency);
      } catch {
        // Continue
      }
    }
  }, [supportedCurrencies]);

  const convertPrice = useCallback((amountInBase, targetCurrency = null) => {
    const target = targetCurrency || currency;
    return convertHelper(amountInBase, baseCurrency, target, exchangeRates);
  }, [currency, baseCurrency, exchangeRates]);

  const formatPrice = useCallback((amountInBase, targetCurrency = null) => {
    const target = targetCurrency || currency;
    const converted = convertHelper(amountInBase, baseCurrency, target, exchangeRates);
    return formatHelper(converted, target);
  }, [currency, baseCurrency, exchangeRates]);

  const value = useMemo(() => ({
    currency,
    baseCurrency,
    supportedCurrencies,
    exchangeRates,
    freeShippingThreshold,
    setCurrency,
    convertPrice,
    formatPrice,
  }), [
    currency,
    baseCurrency,
    supportedCurrencies,
    exchangeRates,
    freeShippingThreshold,
    setCurrency,
    convertPrice,
    formatPrice,
  ]);

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

export default CurrencyContext;
