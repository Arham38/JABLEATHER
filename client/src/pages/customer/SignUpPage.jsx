import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Breadcrumbs from '../../components/common/Breadcrumbs';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

export const SignUpPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isVerificationSent, setIsVerificationSent] = useState(false);
  const { signupCustomer } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.firstName || !formData.email || !formData.password) {
      toast.error('Please complete all required fields');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      const res = await signupCustomer(formData);
      if (res?.needsEmailVerification) {
        setIsVerificationSent(true);
      } else {
        navigate('/account');
      }
    } catch {
      // Handled in authContext
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <Breadcrumbs items={[{ label: 'Create Account' }]} />

      <div className="bg-white p-8 rounded-xs border border-[#DDD8D0] shadow-sm mt-6">
        <div className="text-center mb-8">
          <span className="text-xs uppercase tracking-widest font-bold text-[#A66A3F] block mb-1">
            New Client
          </span>
          <h1 className="text-2xl font-extrabold text-[#171717]">Create an Account</h1>
          <p className="text-xs text-[#6B665F] mt-1">
            Join JAB Leather for express ordering and order tracking.
          </p>
        </div>

        {isVerificationSent ? (
          <div className="p-6 bg-amber-50/60 border border-amber-200/80 rounded-xs text-center space-y-4">
            <h3 className="text-sm font-bold text-[#171717]">Verify Your Email</h3>
            <p className="text-xs text-[#6B665F] leading-relaxed">
              We sent a confirmation link to <strong>{formData.email}</strong>. Please check your inbox and confirm your address before logging in.
            </p>
            <Link to="/account/login">
              <Button variant="primary" size="sm" className="w-full">
                Proceed to Sign In
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="First Name"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              required
            />
            <Input
              label="Last Name"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              required
            />
          </div>

          <Input
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />

          <Input
            label="Password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            helperText="Minimum 6 characters"
            required
          />

          <Input
            label="Confirm Password"
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            required
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={isLoading}
            className="font-bold gap-2 mt-2"
          >
            <span>Create Account</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </form>
        )}

        <div className="mt-6 pt-6 border-t border-stone-100 text-center text-xs text-[#6B665F]">
          <p>
            Already have an account?{' '}
            <Link to="/account/login" className="text-[#171717] font-bold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
