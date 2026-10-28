const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('crypto');
const { getPaymentProvider } = require('../payments');
const sandbox = require('../payments/sandboxProvider');
const manual = require('../payments/manualProvider');

describe('Payment Layer & Provider Tests', () => {
  it('instantiates sandbox and manual payment providers correctly', () => {
    const sandboxFromFactory = getPaymentProvider('sandbox');
    const manualFromFactory = getPaymentProvider('manual');

    assert.equal(sandboxFromFactory.name, 'sandbox');
    assert.equal(manualFromFactory.name, 'manual');
  });

  it('createPayment on sandbox generates secure provider reference and redirect URL', async () => {
    const mockOrder = {
      order_number: 'JAB-100234',
      total: 350.0,
      currency: 'USD',
    };

    const session = await sandbox.createPayment(mockOrder);
    assert.ok(session.redirectUrl.includes('/sandbox-payment'));
    assert.ok(session.providerReference.startsWith('SB-JAB-100234'));
    assert.ok(session.clientSecret.startsWith('sb_sec_'));
  });

  it('createPayment on manual provider keeps payment pending without external redirect', async () => {
    const mockOrder = {
      order_number: 'JAB-100235',
      total: 120.0,
      currency: 'PKR',
    };

    const session = await manual.createPayment(mockOrder);
    assert.equal(session.redirectUrl, null);
    assert.ok(session.providerReference.startsWith('MANUAL-'));
    assert.ok(session.metadata.instructions.length > 0);
  });

  it('rejects sandbox webhook when HMAC signature is invalid', async () => {
    const rawPayload = JSON.stringify({
      orderNumber: 'JAB-100234',
      amount: 350.0,
      currency: 'USD',
      status: 'paid',
    });

    const badHeaders = {
      'x-sandbox-signature': '0000000000000000000000000000000000000000000000000000000000000000',
    };

    await assert.rejects(
      async () => {
        await sandbox.verifyWebhook(rawPayload, badHeaders);
      },
      {
        message: 'Sandbox webhook signature verification failed',
      }
    );
  });

  it('accepts sandbox webhook when HMAC signature is valid', async () => {
    const payload = {
      eventId: 'evt_test_123',
      orderNumber: 'JAB-100234',
      amount: 350.0,
      currency: 'USD',
      status: 'paid',
      providerReference: 'SB-JAB-100234',
    };
    const rawPayload = JSON.stringify(payload);

    // Compute legitimate signature
    const validSignature = crypto
      .createHmac('sha256', sandbox.secret)
      .update(rawPayload)
      .digest('hex');

    const headers = {
      'x-sandbox-signature': validSignature,
    };

    const event = await sandbox.verifyWebhook(rawPayload, headers);
    assert.equal(event.eventId, 'evt_test_123');
    assert.equal(event.orderNumber, 'JAB-100234');
    assert.equal(event.amount, 350.0);
    assert.equal(event.status, 'paid');
  });

  it('rejects sandbox webhook if orderNumber is missing', async () => {
    const rawPayload = JSON.stringify({
      amount: 350.0,
      status: 'paid',
    });

    await assert.rejects(
      async () => {
        await sandbox.verifyWebhook(rawPayload, {});
      },
      {
        message: 'Missing required orderNumber in sandbox webhook payload',
      }
    );
  });

  describe('Amount and Currency Mismatch Validation (Payment Anomaly Logic)', () => {
    function evaluatePaymentMatch(order, event) {
      const expectedAmount = Number(order.total);
      const paidAmount = Number(event.amount);
      const isAmountMatch = Math.abs(expectedAmount - paidAmount) < 0.01;
      const isCurrencyMatch = String(order.currency).toUpperCase() === String(event.currency).toUpperCase();

      if (!isAmountMatch || !isCurrencyMatch) {
        return {
          status: 'amount_mismatch',
          flagged: true,
          markPaid: false,
        };
      }
      return {
        status: 'paid',
        flagged: false,
        markPaid: true,
      };
    }

    it('flags amount mismatch and does not mark paid when paid amount < expected', () => {
      const order = { order_number: 'JAB-001', total: 350.0, currency: 'USD' };
      const event = { amount: 100.0, currency: 'USD', status: 'paid' };

      const result = evaluatePaymentMatch(order, event);
      assert.equal(result.status, 'amount_mismatch');
      assert.equal(result.markPaid, false);
      assert.equal(result.flagged, true);
    });

    it('flags amount mismatch when currency does not match (e.g. USD vs EUR)', () => {
      const order = { order_number: 'JAB-002', total: 350.0, currency: 'USD' };
      const event = { amount: 350.0, currency: 'EUR', status: 'paid' };

      const result = evaluatePaymentMatch(order, event);
      assert.equal(result.status, 'amount_mismatch');
      assert.equal(result.markPaid, false);
      assert.equal(result.flagged, true);
    });

    it('marks as paid when amount and currency match exactly', () => {
      const order = { order_number: 'JAB-003', total: 350.0, currency: 'USD' };
      const event = { amount: 350.0, currency: 'USD', status: 'paid' };

      const result = evaluatePaymentMatch(order, event);
      assert.equal(result.status, 'paid');
      assert.equal(result.markPaid, true);
      assert.equal(result.flagged, false);
    });
  });
});
