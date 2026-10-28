import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Lock, Mail, ArrowRight, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { validateLoginForm } from '../../utils/validation';
import Breadcrumbs from '../../components/common/Breadcrumbs';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const { loginCustomer } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const from = location.state?.from?.pathname || '/account';

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { isValid, errors: validationErrors } = validateLoginForm({ email, password });
    if (!isValid) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    try {
      await loginCustomer({ email, password });
      navigate(from, { replace: true });
    } catch {
      // Toast shown in context
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <Breadcrumbs items={[{ label: 'Sign In' }]} />

      <div className="bg-white p-8 rounded-xs border border-[#DDD8D0] shadow-sm mt-6">
        <div className="text-center mb-8">
          <span className="text-xs uppercase tracking-widest font-bold text-[#A66A3F] block mb-1">
            Welcome Back
          </span>
          <h1 className="text-2xl font-extrabold text-[#171717]">Sign In to Your Account</h1>
          <p className="text-xs text-[#6B665F] mt-1">
            Access your orders, saved addresses, and tailored wishlist.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            placeholder="you@example.com"
            required
          />

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs uppercase tracking-wider font-semibold text-[#1C1C1C]">
                Password
              </label>
              <Link
                to="/account/forgot-password"
                className="text-xs text-[#A66A3F] hover:underline"
              >
                Forgot Password?
              </Link>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full min-h-[44px] px-3.5 py-2.5 text-sm bg-white border border-[#DDD8D0] rounded-xs text-[#1C1C1C] focus:outline-none focus:border-[#171717]"
              required
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-600 font-medium">{errors.password}</p>
            )}
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={isLoading}
            className="font-bold gap-2 mt-2"
          >
            <span>Sign In</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-stone-100 text-center text-xs text-[#6B665F]">
          <p>
            Don't have an account yet?{' '}
            <Link to="/account/signup" className="text-[#171717] font-bold hover:underline">
              Create an Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
