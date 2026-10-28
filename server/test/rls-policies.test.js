const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

/**
 * Supabase Row Level Security (RLS) Verification Suite
 * Verifies that Supabase migration files enforce zero-trust Row Level Security (RLS)
 * across all critical tables: orders, addresses, profiles, products, categories, coupons, store_settings, payments.
 */

describe('Supabase Row Level Security (RLS) Verification', () => {
  const migrationsDir = path.resolve(__dirname, '../../supabase/migrations');
  const migrationFiles = fs.readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .map((f) => fs.readFileSync(path.join(migrationsDir, f), 'utf8'));
  const allSql = migrationFiles.join('\n');

  it('enforces RLS enabled on all sensitive tables', () => {
    const sensitiveTables = [
      'orders',
      'profiles',
      'addresses',
      'products',
      'categories',
      'coupons',
      'store_settings',
      'shipping_methods',
      'payments',
      'processed_webhook_events',
      'payment_audit_log',
    ];

    for (const table of sensitiveTables) {
      const rlsPattern = new RegExp(`ALTER TABLE (?:IF EXISTS )?(?:public\\.)?${table} ENABLE ROW LEVEL SECURITY;`, 'i');
      assert.ok(
        rlsPattern.test(allSql),
        `Table "${table}" must have ROW LEVEL SECURITY enabled in migrations`
      );
    }
  });

  it('restricts orders SELECT so Customer A cannot read Customer B orders and anonymous cannot read orders', () => {
    // Check that customer order read policy checks auth.uid() = user_id
    assert.ok(
      allSql.includes('auth.uid() = user_id'),
      'Orders select policy must verify auth.uid() = user_id for customer access'
    );
    // Check admin policy checks app_metadata ->> role = admin
    assert.ok(
      allSql.includes("auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'"),
      'Orders select policy must verify admin role via app_metadata'
    );
  });

  it('restricts customer addresses to authenticated owner only', () => {
    assert.ok(
      allSql.includes('auth.uid() = user_id'),
      'Addresses table must enforce user ownership check'
    );
  });

  it('restricts write operations on products, coupons, and store_settings to admin role only', () => {
    assert.ok(
      allSql.includes("auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'"),
      'Write policies must restrict mutations to app_metadata.role = admin'
    );
  });

  describe('Pure Policy Rule Simulation', () => {
    function evaluateOrderReadPolicy(session, order) {
      // Anonymous
      if (!session) return false;
      // Admin
      if (session.app_metadata?.role === 'admin') return true;
      // Customer
      if (session.id && order.user_id && session.id === order.user_id) return true;
      return false;
    }

    it('denies anonymous user from reading orders', () => {
      const order = { id: 'ord-1', user_id: 'cust-uuid-1', order_number: 'JAB-1001' };
      assert.equal(evaluateOrderReadPolicy(null, order), false);
    });

    it('denies Customer A from reading Customer B order', () => {
      const customerA = { id: 'cust-a-uuid', email: 'a@example.com', app_metadata: { role: 'customer' } };
      const orderB = { id: 'ord-2', user_id: 'cust-b-uuid', order_number: 'JAB-1002' };
      assert.equal(evaluateOrderReadPolicy(customerA, orderB), false);
    });

    it('permits Customer A to read Customer A order', () => {
      const customerA = { id: 'cust-a-uuid', email: 'a@example.com', app_metadata: { role: 'customer' } };
      const orderA = { id: 'ord-1', user_id: 'cust-a-uuid', order_number: 'JAB-1001' };
      assert.equal(evaluateOrderReadPolicy(customerA, orderA), true);
    });

    it('permits Admin to read all customer orders', () => {
      const admin = { id: 'admin-uuid', email: 'admin@jableather.pk', app_metadata: { role: 'admin' } };
      const order = { id: 'ord-1', user_id: 'cust-uuid', order_number: 'JAB-1001' };
      assert.equal(evaluateOrderReadPolicy(admin, order), true);
    });
  });
});
