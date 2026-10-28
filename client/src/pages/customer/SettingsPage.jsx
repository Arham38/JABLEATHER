import React, { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

export const SettingsPage = () => {
  const toast = useToast();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      toast.error('Please fill in password fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    setIsUpdating(true);
    setTimeout(() => {
      setIsUpdating(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success('Security password updated successfully (simulated)');
    }, 400);
  };

  return (
    <div className="space-y-8 max-w-xl">
      <div className="pb-3 border-b border-stone-200">
        <h2 className="text-base font-bold uppercase tracking-wider text-[#171717]">
          Account Security & Preferences
        </h2>
      </div>

      {/* Password Form */}
      <form onSubmit={handlePasswordSubmit} className="space-y-4">
        <h3 className="text-sm font-bold text-[#171717]">Change Password</h3>
        <Input
          label="Current Password"
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
        />
        <Input
          label="New Password"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        <Input
          label="Confirm New Password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        <Button type="submit" variant="primary" size="sm" isLoading={isUpdating}>
          Update Password
        </Button>
      </form>

      {/* Notifications Toggle */}
      <div className="pt-6 border-t border-stone-200 space-y-3">
        <h3 className="text-sm font-bold text-[#171717]">Notifications</h3>
        <label className="flex items-center gap-3 cursor-pointer text-xs text-stone-800">
          <input
            type="checkbox"
            checked={emailNotifications}
            onChange={(e) => {
              setEmailNotifications(e.target.checked);
              toast.info('Notification preferences updated');
            }}
            className="w-4 h-4 rounded-xs border-stone-300 text-stone-900"
          />
          <span>Receive email updates on atelier drops, order tracking, and private events</span>
        </label>
      </div>
    </div>
  );
};

export default SettingsPage;
