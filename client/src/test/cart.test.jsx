import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { CartProvider, useCart } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { cartService } from '../services/cartService';

// Mock CurrencyContext
vi.mock('../context/CurrencyContext', () => ({
  useCurrency: () => ({
    currency: 'USD',
    freeShippingThreshold: 150.0,
  }),
}));

// Mock AuthContext with authenticated customer
vi.mock('../context/AuthContext', () => {
  const AuthContext = React.createContext({
    customer: { id: 'cust-101', email: 'customer@jableather.com' },
    isAuthenticated: true,
  });
  return {
    AuthContext,
    useAuth: () => ({
      customer: { id: 'cust-101', email: 'customer@jableather.com' },
      isAuthenticated: true,
    }),
  };
});

// Mock ToastContext
vi.mock('../context/ToastContext', () => ({
  useToast: () => ({
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  }),
}));

// Mock cartService revalidation to return clean empty data immediately
vi.mock('../services/cartService', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    cartService: {
      ...actual.cartService,
      revalidateCart: vi.fn().mockResolvedValue({ hydratedItems: [], notices: [] }),
    },
  };
});

describe('CartContext & Cart Mechanics', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  const wrapper = ({ children }) => <CartProvider>{children}</CartProvider>;

  const mockProduct = {
    id: 'prod-101',
    name: 'Heritage Leather Biker Jacket',
    slug: 'heritage-leather-biker-jacket',
    price: 350.0,
    stockCount: 5,
    sizes: ['M', 'L'],
    colors: [{ name: 'Espresso' }],
    images: ['/img/heritage.jpg'],
  };

  it('adding the same item twice results in quantity 2, not 4 (regression bug fix)', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart(mockProduct, { size: 'M', color: 'Espresso', quantity: 1 });
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].quantity).toBe(1);

    // Add again with quantity 1
    act(() => {
      result.current.addToCart(mockProduct, { size: 'M', color: 'Espresso', quantity: 1 });
    });

    // Must be exactly 2, not 4, and array length remains 1
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].quantity).toBe(2);
    expect(result.current.itemCount).toBe(2);
  });

  it('strictly caps item quantity at available stockCount', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    const limitedProduct = {
      ...mockProduct,
      id: 'prod-limited',
      stockCount: 3,
    };

    act(() => {
      // Attempt to add 10 when stock is only 3
      result.current.addToCart(limitedProduct, { size: 'M', quantity: 10 });
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].quantity).toBe(3); // Capped at stockCount
  });

  it('prevents adding item when stock is 0 (out of stock)', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    const outOfStockProduct = {
      ...mockProduct,
      id: 'prod-zero',
      stockCount: 0,
    };

    act(() => {
      result.current.addToCart(outOfStockProduct, { size: 'M', quantity: 1 });
    });

    expect(result.current.items).toHaveLength(0);
  });

  it('updates item quantity and removes item when quantity is reduced to 0', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart(mockProduct, { size: 'M', quantity: 2 });
    });

    const cartItemId = result.current.items[0].cartItemId;

    // Update quantity to 4 (within stock limit of 5)
    act(() => {
      result.current.updateQuantity(cartItemId, 4);
    });
    expect(result.current.items[0].quantity).toBe(4);

    // Reduce to 0 -> should remove item
    act(() => {
      result.current.updateQuantity(cartItemId, 0);
    });
    expect(result.current.items).toHaveLength(0);
  });

  it('removes item directly via removeFromCart', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart(mockProduct, { size: 'M', quantity: 1 });
    });
    expect(result.current.items).toHaveLength(1);

    const cartItemId = result.current.items[0].cartItemId;
    act(() => {
      result.current.removeFromCart(cartItemId);
    });
    expect(result.current.items).toHaveLength(0);
  });

  it('persists minimal cart references in localStorage', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart(mockProduct, { size: 'L', color: 'Espresso', quantity: 2 });
    });

    const stored = cartService.getCart('cust-101');
    expect(Array.isArray(stored)).toBe(true);
    expect(stored).toHaveLength(1);
    expect(stored[0].productId).toBe('prod-101');
    expect(stored[0].size).toBe('L');
    expect(stored[0].quantity).toBe(2);
  });

  it('blocks cart usage and keeps count strictly at 0 for unauthenticated users', () => {
    const unauthWrapper = ({ children }) => (
      <AuthContext.Provider value={{ customer: null, isAuthenticated: false }}>
        <CartProvider>{children}</CartProvider>
      </AuthContext.Provider>
    );

    const { result } = renderHook(() => useCart(), { wrapper: unauthWrapper });
    expect(result.current.itemCount).toBe(0);
    expect(result.current.items).toHaveLength(0);

    let added;
    act(() => {
      added = result.current.addToCart(mockProduct, { size: 'M', quantity: 1 });
    });

    expect(added).toBe(false);
    expect(result.current.itemCount).toBe(0);
  });
});
