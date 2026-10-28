const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

/**
 * Pure simulation of the PostgreSQL `create_order_atomic` transaction logic
 * defined in supabase/migrations/20261028000001_orders_and_customers.sql.
 */
function simulateAtomicOrderCreation({
  dbCatalog,
  dbCoupons,
  incomingItems,
  incomingCouponCode,
  customerData,
}) {
  // 1. Validate customer data
  if (!customerData?.email) {
    throw new Error('Valid customer email required');
  }

  let subtotal = 0;
  const verifiedOrderItems = [];
  const updatedCatalog = new Map(dbCatalog.map((p) => [p.id, { ...p }]));

  // 2. Validate items against canonical catalog (tampered prices ignored)
  for (const item of incomingItems) {
    const product = updatedCatalog.get(item.productId);
    if (!product) {
      throw new Error(`Product not found: ${item.productId}`);
    }

    if (product.status !== 'active') {
      throw new Error(`Product "${product.name}" is currently inactive or unavailable`);
    }

    const requestedQty = Number(item.quantity) || 1;
    if (requestedQty <= 0) {
      throw new Error(`Invalid item quantity for "${product.name}"`);
    }

    // Stock check & atomic decrement
    if (product.stock < requestedQty) {
      throw new Error(`Insufficient stock for "${product.name}". Available: ${product.stock}, Requested: ${requestedQty}`);
    }

    // Server-side authoritative price (client price in item.price is IGNORED)
    const effectivePrice = product.salePrice && product.salePrice > 0 && product.salePrice < product.price
      ? product.salePrice
      : product.price;

    const lineTotal = effectivePrice * requestedQty;
    subtotal += lineTotal;

    // Deduct stock
    product.stock -= requestedQty;

    verifiedOrderItems.push({
      productId: product.id,
      name: product.name,
      price: effectivePrice, // Authoritative price from catalog
      quantity: requestedQty,
      lineTotal,
    });
  }

  // 3. Authoritative coupon re-validation
  let discountAmount = 0;
  if (incomingCouponCode) {
    const coupon = (dbCoupons || []).find(
      (c) => c.code.toUpperCase() === incomingCouponCode.trim().toUpperCase()
    );

    if (!coupon || !coupon.isActive) {
      throw new Error(`Coupon "${incomingCouponCode}" is invalid or expired`);
    }

    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      throw new Error(`Coupon "${incomingCouponCode}" has expired`);
    }

    if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
      throw new Error(`Coupon requires minimum order of $${coupon.minOrderAmount}`);
    }

    if (coupon.usageLimit && (coupon.usageCount || 0) >= coupon.usageLimit) {
      throw new Error(`Coupon usage limit has been reached`);
    }

    if (coupon.discountType === 'percentage') {
      discountAmount = Number(((subtotal * coupon.discountValue) / 100).toFixed(2));
      if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
        discountAmount = coupon.maxDiscountAmount;
      }
    } else if (coupon.discountType === 'fixed') {
      discountAmount = Math.min(coupon.discountValue, subtotal);
    }
  }

  const freeShippingThreshold = 150.0;
  const shippingFee = subtotal >= freeShippingThreshold ? 0.0 : 25.0;
  const finalTotal = Math.max(0, subtotal - discountAmount + shippingFee);

  return {
    orderNumber: `JAB-${Date.now().toString().slice(-6)}`,
    subtotal,
    discount: discountAmount,
    shippingFee,
    total: finalTotal,
    items: verifiedOrderItems,
    catalogAfterOrder: Array.from(updatedCatalog.values()),
  };
}

describe('Authoritative Order Creation & Transaction Rules', () => {
  const catalog = [
    {
      id: 'prod-1',
      name: 'Black Leather Jacket',
      price: 400.0,
      salePrice: null,
      stock: 5,
      status: 'active',
    },
    {
      id: 'prod-2',
      name: 'Suede Weekender Bag',
      price: 250.0,
      salePrice: 200.0,
      stock: 2,
      status: 'active',
    },
    {
      id: 'prod-3',
      name: 'Archived Moto Jacket',
      price: 300.0,
      salePrice: null,
      stock: 10,
      status: 'inactive', // Inactive product
    },
  ];

  const coupons = [
    {
      code: 'VIP10',
      discountType: 'percentage',
      discountValue: 10,
      minOrderAmount: 100,
      isActive: true,
      expiresAt: new Date(Date.now() + 86400000).toISOString(),
      usageLimit: 10,
      usageCount: 2,
    },
    {
      code: 'EXPIRED50',
      discountType: 'percentage',
      discountValue: 50,
      isActive: true,
      expiresAt: new Date(Date.now() - 3600000).toISOString(),
    },
  ];

  it('ignores tampered client price and calculates total using canonical catalog price', () => {
    const incomingItems = [
      {
        productId: 'prod-1',
        quantity: 1,
        price: 1.0, // Malicious client attempts to buy $400 jacket for $1!
      },
    ];

    const order = simulateAtomicOrderCreation({
      dbCatalog: catalog,
      dbCoupons: coupons,
      incomingItems,
      incomingCouponCode: null,
      customerData: { email: 'buyer@example.com' },
    });

    // Client price of $1 MUST be ignored; canonical price of $400 used
    assert.equal(order.items[0].price, 400.0);
    assert.equal(order.subtotal, 400.0);
    assert.equal(order.total, 400.0); // 400 >= 150 -> free shipping
  });

  it('rejects order if any product is inactive in catalog', () => {
    const incomingItems = [
      { productId: 'prod-3', quantity: 1, price: 300.0 }, // Inactive product
    ];

    assert.throws(
      () => {
        simulateAtomicOrderCreation({
          dbCatalog: catalog,
          dbCoupons: coupons,
          incomingItems,
          customerData: { email: 'buyer@example.com' },
        });
      },
      {
        message: /inactive or unavailable/i,
      }
    );
  });

  it('rejects order if requested quantity exceeds available stock', () => {
    const incomingItems = [
      { productId: 'prod-2', quantity: 5, price: 200.0 }, // prod-2 only has stock 2
    ];

    assert.throws(
      () => {
        simulateAtomicOrderCreation({
          dbCatalog: catalog,
          dbCoupons: coupons,
          incomingItems,
          customerData: { email: 'buyer@example.com' },
        });
      },
      {
        message: /insufficient stock/i,
      }
    );
  });

  it('prevents overselling by atomically updating catalog stock', () => {
    const incomingItems = [
      { productId: 'prod-2', quantity: 2, price: 200.0 }, // Consumes all 2
    ];

    const order = simulateAtomicOrderCreation({
      dbCatalog: catalog,
      dbCoupons: coupons,
      incomingItems,
      customerData: { email: 'buyer@example.com' },
    });

    const bagAfter = order.catalogAfterOrder.find((p) => p.id === 'prod-2');
    assert.equal(bagAfter.stock, 0); // Depleted to 0

    // Second subsequent attempt must be rejected (cannot oversell)
    assert.throws(
      () => {
        simulateAtomicOrderCreation({
          dbCatalog: order.catalogAfterOrder,
          dbCoupons: coupons,
          incomingItems: [{ productId: 'prod-2', quantity: 1 }],
          customerData: { email: 'secondbuyer@example.com' },
        });
      },
      {
        message: /insufficient stock/i,
      }
    );
  });

  it('re-validates coupons server-side and rejects expired coupons at checkout', () => {
    const incomingItems = [{ productId: 'prod-1', quantity: 1 }];

    assert.throws(
      () => {
        simulateAtomicOrderCreation({
          dbCatalog: catalog,
          dbCoupons: coupons,
          incomingItems,
          incomingCouponCode: 'EXPIRED50',
          customerData: { email: 'buyer@example.com' },
        });
      },
      {
        message: /expired/i,
      }
    );
  });
});
