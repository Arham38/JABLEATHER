import React, { useState, useEffect } from 'react';
import { Plus, Trash2, MapPin } from 'lucide-react';
import { customerService } from '../../services/customerService';
import { useToast } from '../../context/ToastContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

export const AddressesPage = () => {
  const toast = useToast();
  const [addresses, setAddresses] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newAddr, setNewAddr] = useState({
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'United States',
    phone: '',
    isDefault: false,
  });

  useEffect(() => {
    customerService.getAddresses().then(setAddresses).catch(console.error);
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!newAddr.address || !newAddr.city) {
      toast.error('Please enter street address and city');
      return;
    }

    try {
      const updated = await customerService.saveAddress(newAddr);
      setAddresses(updated);
      setIsAdding(false);
      setNewAddr({
        firstName: '',
        lastName: '',
        address: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'United States',
        phone: '',
        isDefault: false,
      });
      toast.success('Address saved successfully');
    } catch {
      toast.error('Could not save address');
    }
  };

  const handleDelete = async (id) => {
    try {
      const updated = await customerService.deleteAddress(id);
      setAddresses(updated);
      toast.info('Address removed');
    } catch {
      toast.error('Could not delete address');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-stone-200">
        <div>
          <h2 className="text-base font-bold uppercase tracking-wider text-[#171717]">
            Saved Delivery Addresses
          </h2>
          <p className="text-xs text-[#6B665F] mt-0.5">
            Manage your default shipping and billing destinations.
          </p>
        </div>
        {!isAdding && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAdding(true)}
            className="gap-1.5 font-bold"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Address</span>
          </Button>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleSave} className="p-6 bg-stone-50 border border-stone-200 rounded-xs space-y-4 max-w-xl">
          <h3 className="text-sm font-bold text-[#171717]">New Address</h3>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="First Name"
              value={newAddr.firstName}
              onChange={(e) => setNewAddr({ ...newAddr, firstName: e.target.value })}
              required
            />
            <Input
              label="Last Name"
              value={newAddr.lastName}
              onChange={(e) => setNewAddr({ ...newAddr, lastName: e.target.value })}
              required
            />
          </div>
          <Input
            label="Street Address"
            value={newAddr.address}
            onChange={(e) => setNewAddr({ ...newAddr, address: e.target.value })}
            required
          />
          <div className="grid grid-cols-3 gap-3">
            <Input
              label="City"
              value={newAddr.city}
              onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
              required
            />
            <Input
              label="State / Province"
              value={newAddr.state}
              onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })}
              required
            />
            <Input
              label="Postal Code"
              value={newAddr.postalCode}
              onChange={(e) => setNewAddr({ ...newAddr, postalCode: e.target.value })}
              required
            />
          </div>
          <Input
            label="Country"
            value={newAddr.country}
            onChange={(e) => setNewAddr({ ...newAddr, country: e.target.value })}
            required
          />

          <div className="flex gap-2 pt-2">
            <Button type="submit" variant="primary" size="sm">Save Address</Button>
            <Button variant="ghost" size="sm" onClick={() => setIsAdding(false)}>Cancel</Button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {addresses.map((addr) => (
          <div
            key={addr.id}
            className="p-4 bg-white border border-[#DDD8D0] rounded-xs relative flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#171717]">
                  <MapPin className="w-3.5 h-3.5 text-[#A66A3F]" />
                  <span>{addr.firstName} {addr.lastName}</span>
                </div>
                {addr.isDefault && (
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-stone-100 px-2 py-0.5 rounded-xs text-stone-700">
                    Default
                  </span>
                )}
              </div>
              <div className="text-xs text-stone-600 leading-relaxed">
                <p>{addr.address}</p>
                <p>{addr.city}, {addr.state} {addr.postalCode}</p>
                <p>{addr.country}</p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-stone-100 flex justify-end">
              <button
                onClick={() => handleDelete(addr.id)}
                className="text-stone-400 hover:text-red-700 text-xs flex items-center gap-1"
                aria-label="Delete address"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AddressesPage;
