import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Shield, CheckCircle, XCircle, AlertTriangle, ArrowLeft, Loader2 } from 'lucide-react';
import { paymentService } from '../../services/paymentService';
import { formatCurrency } from '../../utils/currency';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/common/Button';

export const SandboxPaymentPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();

  const orderNumber = searchParams.get('order') || '';
  const ref = searchParams.get('ref') || `SB-${orderNumber}`;
  const amount = parseFloat(searchParams.get('amount') || '0');
  const currency = searchParams.get('currency') || 'USD';

  const [loadingAction, setLoadingAction] = useState(null);
  const [simResult, setSimResult] = useState(null);

  const handleSimulate = async (actionType) => {
    setLoadingAction(actionType);
    setSimResult(null);

    try {
      let payload;
      if (actionType === 'success') {
        payload = {
          orderNumber,
          amount,
          currency,
          status: 'paid',
          eventType: 'payment.succeeded',
          providerReference: ref,
        };
      } else if (actionType === 'fail') {
        payload = {
          orderNumber,
          amount,
          currency,
          status: 'failed',
          eventType: 'payment.failed',
          providerReference: ref,
        };
      } else if (actionType === 'tamper') {
        // Tampered payload with $1.00 instead of verified order total
        payload = {
          orderNumber,
          amount: 1.00,
          currency,
          status: 'paid',
          eventType: 'payment.succeeded',
          providerReference: ref,
        };
      }

      const res = await paymentService.triggerSandboxWebhook(payload);

      if (actionType === 'success') {
        toast.success('Sandbox payment authorized and settled!');
        setTimeout(() => {
          navigate(`/checkout/success?orderId=${encodeURIComponent(orderNumber)}`);
        }, 800);
      } else if (actionType === 'fail') {
        setSimResult({
          type: 'declined',
          message: 'Payment simulation declined: Card declined by simulated gateway.',
        });
        toast.error('Payment declined by simulated sandbox issuer.');
      } else {
        setSimResult({
          type: 'tamper_detected',
          message: res.message || 'Server verified amount mismatch and rejected authorization.',
        });
      }
    } catch (err) {
      if (actionType === 'tamper') {
        setSimResult({
          type: 'tamper_detected',
          message: `Expected server rejection: ${err.message}`,
        });
        toast.info('Security check passed: Backend rejected tampered amount.');
      } else {
        toast.error(err.message || 'Sandbox simulation failed');
      }
    } finally {
      setLoadingAction(null);
    }
  };

  if (!orderNumber) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white border border-[#DDD8D0] text-center rounded-xs space-y-4">
        <h2 className="text-lg font-bold text-[#171717]">Invalid Payment Session</h2>
        <p className="text-xs text-[#6B665F]">No order number provided in sandbox checkout URL.</p>
        <Link to="/cart">
          <Button variant="primary" size="sm">Return to Bag</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-16">
      <div className="bg-white rounded-xs border border-[#DDD8D0] shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-[#171717] text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-amber-500/20 text-amber-400 rounded flex items-center justify-center border border-amber-500/40">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#A66A3F] block">
                Sandbox Test Mode
              </span>
              <h1 className="text-lg font-bold">JAB LEATHER Payment Gateway</h1>
            </div>
          </div>
          <span className="px-2 py-0.5 bg-amber-950 text-amber-300 border border-amber-800 rounded text-[10px] font-bold uppercase tracking-wider">
            Test Environment
          </span>
        </div>

        {/* Order Info */}
        <div className="p-6 border-b border-[#DDD8D0] bg-[#F7F5F0] space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="text-[#6B665F]">Order Number:</span>
            <strong className="text-[#171717]">{orderNumber}</strong>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-[#6B665F]">Provider Reference:</span>
            <span className="font-mono text-[11px] text-[#171717]">{ref}</span>
          </div>
          <div className="flex justify-between items-center text-sm pt-2 border-t border-[#DDD8D0]">
            <span className="font-bold text-[#171717]">Total Due:</span>
            <span className="text-lg font-extrabold text-[#171717]">
              {formatCurrency(amount, currency)}
            </span>
          </div>
        </div>

        {/* Simulation Feedback */}
        {simResult && (
          <div className={`p-4 border-b text-xs flex items-start gap-2 ${
            simResult.type === 'declined'
              ? 'bg-red-50 border-red-200 text-red-800'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}>
            {simResult.type === 'declined' ? (
              <XCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
            ) : (
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
            )}
            <div>
              <strong>{simResult.type === 'declined' ? 'Authorization Failed' : 'Security Check Result'}:</strong>
              <p className="mt-0.5">{simResult.message}</p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="p-6 space-y-4">
          <p className="text-xs text-[#6B665F] leading-relaxed">
            Select a payment test action to trigger the backend webhook and observe database state transitions:
          </p>

          <div className="space-y-2.5">
            <button
              onClick={() => handleSimulate('success')}
              disabled={loadingAction !== null}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider rounded-xs transition flex items-center justify-center gap-2"
            >
              {loadingAction === 'success' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
              <span>Simulate Successful Payment ({formatCurrency(amount, currency)})</span>
            </button>

            <button
              onClick={() => handleSimulate('fail')}
              disabled={loadingAction !== null}
              className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider rounded-xs transition flex items-center justify-center gap-2"
            >
              {loadingAction === 'fail' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <XCircle className="w-4 h-4" />
              )}
              <span>Simulate Payment Decline (Failed Card)</span>
            </button>

            <button
              onClick={() => handleSimulate('tamper')}
              disabled={loadingAction !== null}
              className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider rounded-xs transition flex items-center justify-center gap-2"
            >
              {loadingAction === 'tamper' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <AlertTriangle className="w-4 h-4" />
              )}
              <span>Simulate Amount Mismatch Attack (Pay $1.00)</span>
            </button>
          </div>

          <div className="pt-4 border-t border-[#DDD8D0] flex justify-between items-center text-xs">
            <Link to="/cart" className="text-[#6B665F] hover:text-[#171717] inline-flex items-center gap-1 font-semibold">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Cancel & Return to Cart</span>
            </Link>
            <span className="text-[11px] text-stone-400">JAB LEATHER Dev Sandbox</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SandboxPaymentPage;
