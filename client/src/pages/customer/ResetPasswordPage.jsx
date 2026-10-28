import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { useToast } from '../../context/ToastContext';
import Breadcrumbs from '../../components/common/Breadcrumbs';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

export const ResetPasswordPage = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      await authService.resetPassword('token', password);
      toast.success('Your password has been updated! Please sign in.');
      navigate('/account/login');
    } catch {
      toast.error('Could not reset password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <Breadcrumbs items={[{ label: 'Reset Password' }]} />

      <div className="bg-white p-8 rounded-xs border border-[#DDD8D0] shadow-sm mt-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-extrabold text-[#171717]">Create New Password</h1>
          <p className="text-xs text-[#6B665F] mt-1">
            Choose a strong password for your account.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="New Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Input
            label="Confirm New Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
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
            Update Password
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
