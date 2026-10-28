import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { authService } from '../../services/authService';
import { useToast } from '../../context/ToastContext';
import Breadcrumbs from '../../components/common/Breadcrumbs';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isSent, setIsSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email');
      return;
    }
    setIsLoading(true);
    try {
      await authService.forgotPassword(email);
      setIsSent(true);
      toast.success('Reset link dispatched to your email');
    } catch {
      toast.error('Could not send reset email');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <Breadcrumbs items={[{ label: 'Forgot Password' }]} />

      <div className="bg-white p-8 rounded-xs border border-[#DDD8D0] shadow-sm mt-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-extrabold text-[#171717]">Reset Your Password</h1>
          <p className="text-xs text-[#6B665F] mt-1">
            Enter your email and we'll send a link to securely recover your account.
          </p>
        </div>

        {isSent ? (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xs text-center space-y-3">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <p className="text-xs text-emerald-900 leading-relaxed">
              A secure password reset link has been dispatched to <strong>{email}</strong>. Please check your email inbox to update your password.
            </p>
            <Link to="/account/login">
              <Button variant="outline" size="sm">Back to Sign In</Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isLoading}
              className="font-bold mt-2"
            >
              Send Reset Link
            </Button>
          </form>
        )}

        <div className="mt-6 pt-6 border-t border-stone-100 text-center">
          <Link
            to="/account/login"
            className="inline-flex items-center gap-1 text-xs text-[#6B665F] hover:text-[#171717]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Sign In</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
