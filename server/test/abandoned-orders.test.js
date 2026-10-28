const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

/**
 * Pure simulation of the PostgreSQL `cancel_abandoned_orders` function
 * defined in supabase/migrations/20261028000005_payment_architecture.sql.
 */
function simulateCancelAbandonedOrders({ orders, catalog, abandonHours = 24 }) {
  const cutoffTime = Date.now() - abandonHours * 3600 * 1000;
  const updatedOrders = orders.map((o) => ({ ...o, items: [...o.items] }));
  const updatedCatalog = new Map(catalog.map((p) => [p.id, { ...p }]));
  let cancelledCount = 0;

  for (const order of updatedOrders) {
    const isUnpaidPending = order.order_status === 'pending' && order.payment_status === 'pending';
    const isOlderThanCutoff = new Date(order.created_at).getTime() < cutoffTime;

    if (isUnpaidPending && isOlderThanCutoff) {
      order.order_status = 'cancelled';
      order.payment_status = 'abandoned';
      cancelledCount++;

      // Restore product stock
      for (const item of order.items) {
        const product = updatedCatalog.get(item.product_id);
        if (product) {
          product.stock += item.quantity;
        }
      }
    }
  }

  return {
    cancelledCount,
    orders: updatedOrders,
    catalog: Array.from(updatedCatalog.values()),
  };
}

describe('Abandoned Order Expiration & Stock Restoration', () => {
  it('cancels pending unpaid orders older than 24 hours and restores stock', () => {
    const catalog = [
      { id: 'prod-1', name: 'Leather Jacket', stock: 3 },
    ];

    const orders = [
      {
        id: 'ord-1',
        order_number: 'JAB-ABANDONED',
        order_status: 'pending',
        payment_status: 'pending',
        created_at: new Date(Date.now() - 25 * 3600 * 1000).toISOString(), // 25 hours old
        items: [{ product_id: 'prod-1', quantity: 2 }],
      },
    ];

    const result = simulateCancelAbandonedOrders({ orders, catalog, abandonHours: 24 });

    assert.equal(result.cancelledCount, 1);
    assert.equal(result.orders[0].order_status, 'cancelled');
    assert.equal(result.orders[0].payment_status, 'abandoned');

    // Stock was 3, restored +2 = 5
    const restoredProduct = result.catalog.find((p) => p.id === 'prod-1');
    assert.equal(restoredProduct.stock, 5);
  });

  it('does NOT cancel paid, confirmed, or recent orders', () => {
    const catalog = [
      { id: 'prod-1', name: 'Leather Jacket', stock: 10 },
    ];

    const orders = [
      {
        id: 'ord-recent',
        order_number: 'JAB-RECENT',
        order_status: 'pending',
        payment_status: 'pending',
        created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(), // Only 2 hours old
        items: [{ product_id: 'prod-1', quantity: 1 }],
      },
      {
        id: 'ord-paid',
        order_number: 'JAB-PAID',
        order_status: 'confirmed',
        payment_status: 'paid',
        created_at: new Date(Date.now() - 48 * 3600 * 1000).toISOString(), // 48 hours old but PAID
        items: [{ product_id: 'prod-1', quantity: 1 }],
      },
    ];

    const result = simulateCancelAbandonedOrders({ orders, catalog, abandonHours: 24 });

    assert.equal(result.cancelledCount, 0);
    assert.equal(result.orders[0].order_status, 'pending');
    assert.equal(result.orders[1].order_status, 'confirmed');

    // Stock unchanged
    const product = result.catalog.find((p) => p.id === 'prod-1');
    assert.equal(product.stock, 10);
  });
});
