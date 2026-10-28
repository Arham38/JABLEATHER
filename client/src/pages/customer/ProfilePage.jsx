import React, { useState, useEffect } from 'react';
import { customerService } from '../../services/customerService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

export const ProfilePage = () => {
  const { customer } = useAuth();
  const toast = useToast();
  const [profile, setProfile] = useState({
    firstName: customer?.firstName || '',
    lastName: customer?.lastName || '',
    email: customer?.email || '',
    phone: customer?.phone || '',
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    customerService.getProfile().then((p) => {
      if (p) {
        setProfile((prev) => ({
          ...prev,
          ...p,
          email: p.email || customer?.email || prev.email,
        }));
      }
    });
  }, [customer]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await customerService.updateProfile(profile);
      toast.success('Profile details updated successfully');
    } catch {
      toast.error('Could not update profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="pb-3 border-b border-stone-200">
        <h2 className="text-base font-bold uppercase tracking-wider text-[#171717]">
          Personal Profile
        </h2>
        <p className="text-xs text-[#6B665F] mt-0.5">
          Manage your contact credentials for express worldwide orders.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="First Name"
            value={profile.firstName}
            onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
            required
          />
          <Input
            label="Last Name"
            value={profile.lastName}
            onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
            required
          />
        </div>

        <Input
          label="Email Address"
          type="email"
          value={profile.email}
          onChange={(e) => setProfile({ ...profile, email: e.target.value })}
          required
        />

        <Input
          label="Phone Number"
          type="tel"
          value={profile.phone}
          onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
          helperText="Used strictly by international couriers for delivery notifications."
          required
        />

        <Button type="submit" variant="primary" size="sm" isLoading={isSaving} className="font-bold">
          Save Profile Changes
        </Button>
      </form>
    </div>
  );
};

export default ProfilePage;
